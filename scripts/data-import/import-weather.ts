import { prisma } from './_lib/prisma';
import { log, warn, logError, printSummary } from './_lib/logger';

// ── Constants ─────────────────────────────────────────────────────────────────

const BASE_URL    = 'https://archive-api.open-meteo.com/v1/archive';
const DAILY_VARS  = 'temperature_2m_max,temperature_2m_min,sunshine_duration,precipitation_sum,relative_humidity_2m_mean';
const SUNSHINE_S  = 6 * 3600;   // 6 h in seconds
const RAIN_MM     = 1.0;
const DELAY_MS    = 3_000;      // 3 s between requests
const RETRY_WAIT  = 60_000;    // 60 s after 429 (rate limit resets in ~45 s)
const MAX_RETRIES = 5;
const BIG_DIFF    = 0.30;       // warn if existing value differs > 30 %

// ── Args ──────────────────────────────────────────────────────────────────────

const args    = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const yearsArg = parseInt(args.find(a => a.startsWith('--years='))?.split('=')[1] ?? '30', 10);
const years    = isNaN(yearsArg) ? 30 : yearsArg;

// ── Types ─────────────────────────────────────────────────────────────────────

interface DailyData {
  time:                       string[];
  temperature_2m_max:         (number | null)[];
  temperature_2m_min:         (number | null)[];
  sunshine_duration:          (number | null)[];
  precipitation_sum:          (number | null)[];
  relative_humidity_2m_mean?: (number | null)[];
}

interface WeatherStats {
  sunshineDays:  number;
  rainyDays:     number;
  avgTempSummer: number;
  avgTempWinter: number;
  humidityIndex: number;
  weatherType:   string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

// Summer/winter months depend on hemisphere
function seasonMonths(isSouth: boolean) {
  return isSouth
    ? { summer: new Set([12, 1, 2]), winter: new Set([6, 7, 8]) }
    : { summer: new Set([6, 7, 8]),  winter: new Set([12, 1, 2]) };
}

function classifyWeather(
  avgTempSummer: number,
  avgTempWinter: number,
  rainyDays:     number,
  lat:           number,
): string {
  // Tropical: warm year-round + rainy
  if (avgTempWinter > 20 && rainyDays > 100) return 'tropical';
  // Desert: very dry
  if (rainyDays < 50) return 'desert';
  // Mediterranean: warm dry summer, latitude 25-45
  if (avgTempSummer > 20 && rainyDays < 100 && Math.abs(lat) >= 25 && Math.abs(lat) <= 45)
    return 'mediterranean';
  // Continental: cold winters
  if (avgTempWinter < 3) return 'continental';
  // Humid subtropical: hot summer, mild winter, moderately rainy
  if (avgTempSummer > 23 && avgTempWinter > 12 && rainyDays > 90) return 'humid_subtropical';
  // Default
  return 'oceanic';
}

function aggregateDaily(daily: DailyData, lat: number): WeatherStats {
  const isSouth  = lat < 0;
  const { summer, winter } = seasonMonths(isSouth);

  let sunCount   = 0, rainCount  = 0;
  let sumT = 0, sumN = 0, winT = 0, winN = 0;
  let humSum = 0, humN = 0;
  const yearSet = new Set<string>();

  for (let i = 0; i < daily.time.length; i++) {
    const ds    = daily.time[i];
    const month = parseInt(ds.slice(5, 7), 10);
    yearSet.add(ds.slice(0, 4));

    const sun = daily.sunshine_duration[i];
    if (sun !== null && sun > SUNSHINE_S) sunCount++;

    const rain = daily.precipitation_sum[i];
    if (rain !== null && rain > RAIN_MM) rainCount++;

    const tmax = daily.temperature_2m_max[i];
    const tmin = daily.temperature_2m_min[i];
    if (tmax !== null && tmin !== null) {
      const tmean = (tmax + tmin) / 2;
      if (summer.has(month)) { sumT += tmean; sumN++; }
      if (winter.has(month)) { winT += tmean; winN++; }
    }

    const hum = daily.relative_humidity_2m_mean?.[i];
    if (hum !== null && hum !== undefined) { humSum += hum; humN++; }
  }

  const ny = yearSet.size || 1;

  const avgTempSummer = sumN > 0 ? round1(sumT / sumN) : 0;
  const avgTempWinter = winN > 0 ? round1(winT / winN) : 0;
  const sunshineDays  = Math.round(sunCount  / ny);
  const rainyDays     = Math.round(rainCount / ny);
  const humidityIndex = humN > 0 ? Math.round(humSum / humN) : 60;  // 60 as neutral fallback

  return {
    sunshineDays, rainyDays,
    avgTempSummer, avgTempWinter,
    humidityIndex,
    weatherType: classifyWeather(avgTempSummer, avgTempWinter, rainyDays, lat),
  };
}

// ── Per-city helpers ──────────────────────────────────────────────────────────

type City = { id: string; slug: string; nameEN: string | null; lat: number | null; lng: number | null };

/** Fetch + parse one city. Returns stats, or null if fetch failed, or 'rate-limited' if 429 exhausted. */
async function fetchCity(
  city: City,
  url: string,
): Promise<WeatherStats | null | 'rate-limited'> {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'PayMap-DataImport/1.0 (paymap.io)' },
      });
      if (res.status === 429) {
        warn('weather', 'rate-limit',
          `${city.slug}: 429 — waiting ${RETRY_WAIT / 1000}s (attempt ${attempt}/${MAX_RETRIES})`);
        await new Promise(r => setTimeout(r, RETRY_WAIT));
        continue;
      }
      if (!res.ok) {
        warn('weather', 'http', `${city.slug}: HTTP ${res.status}`);
        return null;
      }
      const data = await res.json() as { daily?: DailyData };
      if (!data?.daily?.time?.length) {
        warn('weather', 'no-data', `${city.slug}: empty response`);
        return null;
      }
      return aggregateDaily(data.daily, city.lat!);
    } catch (err) {
      logError('weather', 'fetch', `${city.slug}: ${String(err)}`);
      return null;
    }
  }
  return 'rate-limited';
}

async function writeCity(
  city:    City,
  stats:   WeatherStats,
  prev:    { cityId: string; sunshineDays: number; rainyDays: number; avgTempSummer: number; avgTempWinter: number; weatherType: string } | undefined,
  counters: { created: number; updated: number; warned: number },
) {
  // Warn on large divergence from existing seeded data
  if (prev) {
    const checks: [string, number, number][] = [
      ['sunshineDays',  stats.sunshineDays,  prev.sunshineDays],
      ['rainyDays',     stats.rainyDays,     prev.rainyDays],
      ['avgTempSummer', stats.avgTempSummer, prev.avgTempSummer],
      ['avgTempWinter', stats.avgTempWinter, prev.avgTempWinter],
    ];
    for (const [field, calc, was] of checks) {
      if (was !== 0 && Math.abs(calc - was) / Math.abs(was) > BIG_DIFF) {
        warn('weather', 'big-diff',
          `${city.slug} ${field}: was=${was} calc=${calc} ` +
          `(${((calc - was) / Math.abs(was) * 100).toFixed(0)}%)`);
        counters.warned++;
      }
    }
  }

  if (isDryRun) {
    const prevType = prev?.weatherType ?? '—';
    const action   = prev ? 'update' : 'create';
    console.log(
      `  [dry-run] ${city.slug.padEnd(15)} ` +
      `${stats.weatherType.padEnd(18)} ` +
      `sun=${String(stats.sunshineDays).padStart(3)}d  ` +
      `rain=${String(stats.rainyDays).padStart(3)}d  ` +
      `summer=${String(stats.avgTempSummer).padStart(5)}°C  ` +
      `winter=${String(stats.avgTempWinter).padStart(5)}°C  ` +
      `hum=${stats.humidityIndex}%  ` +
      `[${action}${prev ? ` was:${prevType}` : ''}]`
    );
    if (action === 'create') counters.created++; else counters.updated++;
    return;
  }

  // CityWeather has no source field (decision 4: Open-Meteo is always the only source)
  try {
    if (prev) {
      await prisma.cityWeather.update({ where: { cityId: city.id }, data: stats });
      counters.updated++;
    } else {
      await prisma.cityWeather.create({ data: { cityId: city.id, ...stats } });
      counters.created++;
    }
    log('weather', prev ? 'update' : 'create',
      `${city.slug}: ${stats.weatherType}  sun=${stats.sunshineDays}d  rain=${stats.rainyDays}d  ` +
      `summer=${stats.avgTempSummer}°C  winter=${stats.avgTempWinter}°C`);
  } catch (err) {
    logError('weather', 'db', `${city.slug}: ${String(err)}`);
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  log('weather', 'start', isDryRun ? `DRY-RUN — ${years}y window` : `LIVE — ${years}y window`);

  const today     = new Date();
  const startDate = new Date(today);
  startDate.setFullYear(today.getFullYear() - years);
  const startStr = formatDate(startDate);
  const endStr   = formatDate(today);
  log('weather', 'range', `${startStr} → ${endStr}`);

  const cities = await prisma.city.findMany({
    select: { id: true, slug: true, nameEN: true, lat: true, lng: true },
    where: { isActive: true },
  });
  log('weather', 'setup', `${cities.length} active cities found`);

  const existing = await prisma.cityWeather.findMany();
  const existMap = new Map(existing.map(w => [w.cityId, w]));

  const counters = { created: 0, updated: 0, skipped: 0, warned: 0 };
  const rateLimitQueue: City[] = [];

  for (const city of cities) {
    if (city.lat === null || city.lng === null) {
      warn('weather', 'skip', `${city.slug}: no lat/lng`);
      counters.skipped++;
      continue;
    }

    await new Promise(r => setTimeout(r, DELAY_MS));

    const url =
      `${BASE_URL}?latitude=${city.lat}&longitude=${city.lng}` +
      `&start_date=${startStr}&end_date=${endStr}` +
      `&daily=${DAILY_VARS}&timezone=auto`;

    const result = await fetchCity(city, url);

    if (result === 'rate-limited') {
      warn('weather', 'queued', `${city.slug}: adding to retry queue`);
      rateLimitQueue.push(city);
      continue;
    }
    if (result === null) { counters.skipped++; continue; }

    await writeCity(city, result, existMap.get(city.id), counters);
  }

  // Second pass: retry rate-limited cities after a longer cool-down
  if (rateLimitQueue.length > 0) {
    const waitSec = 120;
    log('weather', 'retry-pass',
      `${rateLimitQueue.length} cities in retry queue — waiting ${waitSec}s before second pass`);
    await new Promise(r => setTimeout(r, waitSec * 1000));

    for (const city of rateLimitQueue) {
      await new Promise(r => setTimeout(r, DELAY_MS));

      const url =
        `${BASE_URL}?latitude=${city.lat}&longitude=${city.lng}` +
        `&start_date=${startStr}&end_date=${endStr}` +
        `&daily=${DAILY_VARS}&timezone=auto`;

      const result = await fetchCity(city, url);

      if (result === 'rate-limited' || result === null) {
        warn('weather', 'skip-final', `${city.slug}: still failing after retry pass`);
        counters.skipped++;
        continue;
      }

      await writeCity(city, result, existMap.get(city.id), counters);
    }
  }

  await prisma.$disconnect();

  printSummary(`Open-Meteo Weather Import (${years}y average)`, [
    { label: 'Mode',              value: isDryRun ? 'DRY-RUN' : 'LIVE' },
    { label: 'Created',           value: counters.created  },
    { label: 'Updated',           value: counters.updated  },
    { label: 'Skipped',           value: counters.skipped  },
    { label: 'Big-diff warnings', value: counters.warned   },
    { label: 'Period',            value: `${startStr} → ${endStr}` },
  ]);
}

main().catch(err => {
  logError('weather', 'fatal', String(err));
  prisma.$disconnect().catch(() => undefined);
  process.exit(1);
});
