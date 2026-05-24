import { prisma } from './_lib/prisma';
import { log, warn, logError, printSummary } from './_lib/logger';

// ── Constants ─────────────────────────────────────────────────────────────────

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';
const RADIUS_M     = 15_000;
const DELAY_MS     = 3_000;
const SOURCE       = 'overpass-osm';
const MAX_RETRIES  = 5;

// ── Args ──────────────────────────────────────────────────────────────────────

const args     = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');

// ── Types ─────────────────────────────────────────────────────────────────────

interface OsmElement {
  type:   string;
  id:     number;
  lat?:   number;
  lon?:   number;
  center?: { lat: number; lon: number };
  tags?:  Record<string, string>;
}

interface PoiItem { name: string; lat: number; lng: number; website?: string }

// ── Overpass helpers ──────────────────────────────────────────────────────────

async function overpassFetch(ql: string): Promise<{ elements: OsmElement[] } | null> {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(OVERPASS_URL, {
        method:  'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent':   'PayMap-DataImport/1.0 (paymap.io)',
        },
        body: `data=${encodeURIComponent(ql)}`,
      });

      if (res.status === 429 || res.status === 503) {
        const waitMs = Math.min(30_000 * Math.pow(2, attempt - 1), 120_000);
        warn('pois', 'rate-limit',
          `HTTP ${res.status} — waiting ${waitMs / 1000}s (attempt ${attempt}/${MAX_RETRIES})`);
        await new Promise(r => setTimeout(r, waitMs));
        continue;
      }

      if (!res.ok) {
        warn('pois', 'http', `HTTP ${res.status}`);
        return null;
      }

      return await res.json() as { elements: OsmElement[] };
    } catch (err) {
      if (attempt === MAX_RETRIES) {
        logError('pois', 'fetch', String(err));
        return null;
      }
      await new Promise(r => setTimeout(r, 10_000));
    }
  }
  return null;
}

/** Returns count of matching OSM elements (uses Overpass count mode). */
async function queryCount(lat: number, lng: number, filter: string): Promise<number> {
  const ql = `[out:json][timeout:25]; nwr(around:${RADIUS_M},${lat},${lng})${filter}; out count;`;
  const data = await overpassFetch(ql);
  const total = data?.elements?.[0]?.tags?.['total'];
  return total ? parseInt(total, 10) : 0;
}

/** Returns named POIs from matching OSM elements with full body. */
async function queryNamed(lat: number, lng: number, filter: string): Promise<PoiItem[]> {
  const ql = `[out:json][timeout:25]; nwr(around:${RADIUS_M},${lat},${lng})${filter}; out body center qt;`;
  const data = await overpassFetch(ql);
  if (!data?.elements?.length) return [];

  return data.elements
    .map(el => ({
      name:    el.tags?.['name:en'] ?? el.tags?.name ?? '',
      lat:     el.lat ?? el.center?.lat ?? lat,
      lng:     el.lon ?? el.center?.lon ?? lng,
      website: el.tags?.website ?? el.tags?.url,
    }))
    .filter(p => p.name.length > 0);
}

// ── DB write helpers ──────────────────────────────────────────────────────────

async function upsertLifestyle(
  cityId:   string,
  category: string,
  score:    number,
  counters: { created: number; updated: number },
) {
  if (isDryRun) return;
  const existing = await prisma.cityLifestyle.findFirst({ where: { cityId, category } });
  if (existing) {
    await prisma.cityLifestyle.update({
      where: { id: existing.id },
      data:  { score, source: SOURCE },
    });
    counters.updated++;
  } else {
    await prisma.cityLifestyle.create({
      data: { cityId, category, score, source: SOURCE },
    });
    counters.created++;
  }
}

async function replacePois(
  cityId:  string,
  type:    string,
  items:   PoiItem[],
  counters: { poiCreated: number },
) {
  if (isDryRun) return;
  await prisma.cityPOI.deleteMany({ where: { cityId, type } });
  if (items.length > 0) {
    await prisma.cityPOI.createMany({
      data: items.map(p => ({
        cityId,
        type,
        name:    p.name,
        lat:     p.lat,
        lng:     p.lng,
        website: p.website,
      })),
    });
    counters.poiCreated += items.length;
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  log('pois', 'start', isDryRun ? 'DRY-RUN' : 'LIVE');

  const cities = await prisma.city.findMany({
    select: { id: true, slug: true, nameEN: true, lat: true, lng: true },
    where:  { isActive: true },
  });
  log('pois', 'setup', `${cities.length} active cities`);

  const counters = { created: 0, updated: 0, poiCreated: 0, skipped: 0 };

  for (const city of cities) {
    if (city.lat === null || city.lng === null) {
      warn('pois', 'skip', `${city.slug}: no lat/lng`);
      counters.skipped++;
      continue;
    }

    const { lat, lng } = city;

    // ── 1. Coworking count ──────────────────────────────────────────────────
    await new Promise(r => setTimeout(r, DELAY_MS));
    const cwA = await queryCount(lat, lng, '[amenity=coworking_space]');
    await new Promise(r => setTimeout(r, DELAY_MS));
    const cwB = await queryCount(lat, lng, '[office=coworking]');
    const coworkingCount = cwA + cwB;

    // ── 2. Hospital count ───────────────────────────────────────────────────
    await new Promise(r => setTimeout(r, DELAY_MS));
    const hospitalCount = await queryCount(lat, lng, '[amenity=hospital]');

    // ── 3. German consulates (named) ────────────────────────────────────────
    await new Promise(r => setTimeout(r, DELAY_MS));
    const consulateFilter = '[office~"embassy|consulate|diplomatic"][country=DE]';
    const consulates = await queryNamed(lat, lng, consulateFilter);

    // ── 4. German international schools (named) ─────────────────────────────
    await new Promise(r => setTimeout(r, DELAY_MS));
    const schoolFilter = '[amenity=school][name~"[Dd]eutsch"]';
    const schools = await queryNamed(lat, lng, schoolFilter);

    if (isDryRun) {
      console.log(
        `  [dry-run] ${city.slug.padEnd(15)} ` +
        `cowork=${String(coworkingCount).padStart(3)}  ` +
        `hospital=${String(hospitalCount).padStart(3)}  ` +
        `consulate_de=${consulates.length}  ` +
        `school_de=${schools.length}`
      );
      if (consulates.length) consulates.forEach(c => console.log(`             consulate: ${c.name}`));
      if (schools.length)    schools.forEach(s => console.log(`             school:    ${s.name}`));
      counters.created += 4; // 4 lifestyle entries per city
      counters.poiCreated += consulates.length + schools.length;
      continue;
    }

    // Write CityLifestyle counts
    await upsertLifestyle(city.id, 'coworking_count',    coworkingCount,   counters);
    await upsertLifestyle(city.id, 'hospital_count',     hospitalCount,    counters);
    await upsertLifestyle(city.id, 'consulate_de_count', consulates.length, counters);
    await upsertLifestyle(city.id, 'school_de_count',    schools.length,   counters);

    // Write named CityPOI entries
    await replacePois(city.id, 'consulate_de', consulates, counters);
    await replacePois(city.id, 'school_de',    schools,    counters);

    log('pois', 'done',
      `${city.slug}: cowork=${coworkingCount}  hospital=${hospitalCount}  ` +
      `consulate_de=${consulates.length}  school_de=${schools.length}`);
  }

  await prisma.$disconnect();

  printSummary('Overpass POI Import', [
    { label: 'Mode',              value: isDryRun ? 'DRY-RUN' : 'LIVE' },
    { label: 'Lifestyle created', value: counters.created  },
    { label: 'Lifestyle updated', value: counters.updated  },
    { label: 'POI records',       value: counters.poiCreated },
    { label: 'Skipped',           value: counters.skipped  },
    { label: 'Radius',            value: `${RADIUS_M / 1000}km` },
  ]);
}

main().catch(err => {
  logError('pois', 'fatal', String(err));
  prisma.$disconnect().catch(() => undefined);
  process.exit(1);
});
