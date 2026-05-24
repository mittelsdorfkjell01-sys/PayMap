import * as path from 'path';
import * as fs from 'fs';
import { prisma } from './_lib/prisma';
import { log, warn, logError, printSummary } from './_lib/logger';
import { cityMapping } from './_lib/city-mapping';
import { calculateApproximate } from '@paymap/tax-engine';

// ── Constants ─────────────────────────────────────────────────────────────────

const SOURCE = 'wherenext-2026-Q2';
const BASE_URL = 'https://getwherenext.com/api/data';
const GROSS_FOR_TAX_CHECK = 60_000;
const TAX_YEAR = 2026;
const REQUEST_DELAY_MS = 1_000;
const MAX_REQUESTS = 50;

// confidence levels (Int field)
const CONF_ESTIMATED = 60;  // country-level × city factor
const CONF_INDEX     = 30;  // derived from relative index

// our slug → ISO 2-letter (most match; UAE slug = 'uae' but ISO = 'AE')
const SLUG_TO_ISO: Record<string, string> = {
  de: 'DE', at: 'AT', ch: 'CH', nl: 'NL', pt: 'PT', es: 'ES',
  fr: 'FR', it: 'IT', ie: 'IE', ee: 'EE', pl: 'PL', cz: 'CZ',
  hu: 'HU', ro: 'RO', uae: 'AE', th: 'TH', us: 'US', gb: 'GB',
  id: 'ID', co: 'CO', mx: 'MX', ar: 'AR', sg: 'SG', za: 'ZA',
  mt: 'MT', ge: 'GE',
};

const ISO_TO_SLUG: Record<string, string> = Object.fromEntries(
  Object.entries(SLUG_TO_ISO).map(([s, iso]) => [iso, s])
);

// City factor: how much more expensive a city is vs its country average
const CITY_FACTORS: Record<string, number> = {
  berlin: 1.10, hamburg: 1.05, muenchen: 1.20,
  lissabon: 1.15, porto: 0.95,
  barcelona: 1.10, madrid: 1.05, valencia: 0.85,
  amsterdam: 1.20, rotterdam: 0.90,
  wien: 1.05, zuerich: 1.10,
  mailand: 1.15, paris: 1.20, dublin: 1.10, london: 1.25,
  tallinn: 1.00, warschau: 1.10, prag: 1.10,
  budapest: 1.05, bukarest: 1.05, valletta: 1.00, tbilisi: 1.00,
  dubai: 1.20, bangkok: 1.10, 'chiang-mai': 0.70,
  bali: 0.85, medellin: 0.90, 'mexiko-city': 1.10,
  'buenos-aires': 1.10, 'new-york': 1.30, miami: 1.15,
  singapur: 1.00, kapstadt: 0.90,
};

// Fixed budget proportions of monthly_estimate_usd for each category.
// rent_index / grocery_index etc. measure burden-vs-income, NOT absolute price —
// so we cannot use them to scale absolute category amounts.
const PROPORTION: Record<string, number> = {
  rent_outside_1br:  0.35,
  groceries_monthly: 0.15,
  transport_monthly: 0.06,
  utilities_monthly: 0.08,
};

// ── Arg parsing ───────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const onlyArg  = args.find(a => a.startsWith('--only='))?.split('=')[1];

const DATASETS = ['cost-of-living', 'expat-tax-rates', 'median-salaries', 'digital-nomad-visas'] as const;
type Dataset = typeof DATASETS[number];

function shouldRun(ds: Dataset): boolean {
  return !onlyArg || onlyArg === ds;
}

// ── Utilities ─────────────────────────────────────────────────────────────────

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

function getPeriodStart(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

let requestCount = 0;

async function fetchJson<T = unknown>(url: string): Promise<T | null> {
  if (requestCount >= MAX_REQUESTS) {
    warn('fetch', 'rate-limit', `Max ${MAX_REQUESTS} requests reached — skipping ${url}`);
    return null;
  }
  await sleep(REQUEST_DELAY_MS);
  requestCount++;
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'PayMap-DataImport/1.0 (paymap.io)' },
    });
    if (!res.ok) {
      warn('fetch', 'http-error', `${res.status} ${res.statusText} — ${url}`);
      return null;
    }
    return await res.json() as T;
  } catch (err) {
    logError('fetch', 'network', `${url}: ${String(err)}`);
    return null;
  }
}

// ── CoL item upsert ───────────────────────────────────────────────────────────

async function upsertCoL(
  cityId: string, category: string, value: number, currency: string,
  confidence: number, periodStart: Date,
): Promise<'created' | 'updated'> {
  const existing = await prisma.costOfLivingItem.findFirst({
    where: { cityId, category, periodStart },
  });
  if (existing) {
    await prisma.costOfLivingItem.update({
      where: { id: existing.id },
      data: { value, source: SOURCE, confidence },
    });
    return 'updated';
  }
  await prisma.costOfLivingItem.create({
    data: { cityId, category, value, currency, source: SOURCE, confidence, periodStart },
  });
  return 'created';
}

// ── Dataset: cost-of-living ───────────────────────────────────────────────────

interface CoLEntry {
  country_code: string;
  monthly_estimate_usd: number;
  cost_index: number;
  rent_index: number;
  grocery_index: number;
  utilities_index: number;
  transport_index: number;
}

interface CoLStats { cities: number; items: number; warnings: number }

async function importCostOfLiving(
  cityIdMap: Map<string, string>, periodStart: Date,
): Promise<CoLStats> {
  const stats: CoLStats = { cities: 0, items: 0, warnings: 0 };

  log('wherenext', 'cost-of-living', 'fetching…');
  const raw = await fetchJson<unknown>(`${BASE_URL}/cost-of-living`);
  if (!raw) { warn('wherenext', 'cost-of-living', 'no data received'); return stats; }

  const rawObj = raw as Record<string, unknown>;
  const entries = (Array.isArray(raw) ? raw
    : Array.isArray(rawObj.data)      ? rawObj.data
    : Array.isArray(rawObj.countries) ? rawObj.countries
    : Array.isArray(rawObj.results)   ? rawObj.results
    : []) as CoLEntry[];
  log('wherenext', 'cost-of-living', `received ${entries.length} country entries`);

  // Build ISO → CoL entry map
  const byISO = new Map<string, CoLEntry>();
  for (const e of entries) {
    if (e.country_code) byISO.set(e.country_code.toUpperCase(), e);
  }

  for (const cm of cityMapping) {
    const iso = SLUG_TO_ISO[cm.countrySlug]?.toUpperCase();
    if (!iso) continue;

    const entry = byISO.get(iso);
    if (!entry) {
      warn('wherenext', 'cost-of-living', `no country data for ${cm.ourSlug} (ISO=${iso})`);
      stats.warnings++;
      continue;
    }

    const cityId = cityIdMap.get(cm.ourSlug);
    if (!cityId) {
      warn('wherenext', 'cost-of-living', `city not found in DB: ${cm.ourSlug}`);
      stats.warnings++;
      continue;
    }

    const factor = CITY_FACTORS[cm.ourSlug] ?? 1.0;
    const cityMonthly = entry.monthly_estimate_usd * factor;

    // Derive category amounts from monthly total using fixed proportions.
    // We do NOT use rent_index to scale rent because rent_index measures
    // rent-burden-vs-income (high in cheap countries), not absolute price.
    const derivedItems: Array<{ category: string; value: number; confidence: number }> = [
      { category: 'total_monthly_estimate', value: Math.round(cityMonthly), confidence: CONF_ESTIMATED },
      { category: 'rent_outside_1br',  value: Math.round(cityMonthly * PROPORTION.rent_outside_1br),  confidence: CONF_ESTIMATED },
      { category: 'groceries_monthly', value: Math.round(cityMonthly * PROPORTION.groceries_monthly), confidence: CONF_ESTIMATED },
      { category: 'transport_monthly', value: Math.round(cityMonthly * PROPORTION.transport_monthly), confidence: CONF_ESTIMATED },
      { category: 'utilities_monthly', value: Math.round(cityMonthly * PROPORTION.utilities_monthly), confidence: CONF_ESTIMATED },
      // raw indices stored as-is (unit: index points, not USD)
      { category: 'index_cost',      value: entry.cost_index,      confidence: CONF_INDEX },
      { category: 'index_rent',      value: entry.rent_index,      confidence: CONF_INDEX },
      { category: 'index_grocery',   value: entry.grocery_index,   confidence: CONF_INDEX },
      { category: 'index_utilities', value: entry.utilities_index, confidence: CONF_INDEX },
      { category: 'index_transport', value: entry.transport_index, confidence: CONF_INDEX },
    ];

    let cityItemCount = 0;
    for (const item of derivedItems) {
      if (isDryRun) {
        console.log(
          `  [dry-run] ${cm.ourSlug.padEnd(14)} ${item.category.padEnd(25)} ` +
          `${String(item.value).padStart(6)} USD  conf=${item.confidence}`
        );
        cityItemCount++;
      } else {
        await upsertCoL(cityId, item.category, item.value, 'USD', item.confidence, periodStart);
        cityItemCount++;
      }
    }

    stats.cities++;
    stats.items += cityItemCount;
    if (!isDryRun) {
      log('wherenext', 'cost-of-living', `${cm.ourSlug}: ${cityItemCount} items  (monthly≈$${Math.round(cityMonthly)}, factor=${factor})`);
    }
  }

  return stats;
}

// ── Dataset: expat-tax-rates (logging / cross-validation only) ────────────────

interface TaxRateBracket {
  grossIncome: number;
  totalTax: number;
  effectiveRate: number;
}
interface ExpatTaxEntry {
  countryCode: string;
  rates: TaxRateBracket[];
}

async function checkExpatTaxRates(): Promise<void> {
  log('wherenext', 'expat-tax-rates', 'fetching for tax-engine cross-validation…');
  const raw = await fetchJson<{ countries?: ExpatTaxEntry[] }>(`${BASE_URL}/expat-tax-rates`);
  if (!raw?.countries) {
    warn('wherenext', 'expat-tax-rates', 'no countries array found — skipping');
    return;
  }

  log('wherenext', 'expat-tax-rates', `received ${raw.countries.length} entries`);

  for (const entry of raw.countries) {
    const iso = entry.countryCode?.toUpperCase();
    const slug = ISO_TO_SLUG[iso];
    if (!slug) continue;

    // Find bracket closest to 60k (API has 50k, 100k, 200k)
    const bracket = entry.rates.reduce((best, r) =>
      Math.abs(r.grossIncome - GROSS_FOR_TAX_CHECK) < Math.abs(best.grossIncome - GROSS_FOR_TAX_CHECK)
        ? r : best
    );

    const theirTax = bracket.totalTax;
    const theirGross = bracket.grossIncome;

    try {
      const result = calculateApproximate(slug, theirGross, 'EUR', TAX_YEAR);
      const ourTax = theirGross - result.netAnnual;
      const diff = ourTax - theirTax;
      const diffPct = theirTax > 0 ? ((diff / theirTax) * 100).toFixed(1) : 'N/A';
      const sign = diff >= 0 ? '+' : '';
      log(
        'wherenext', 'tax-check',
        `${slug.toUpperCase().padEnd(3)} ${theirGross / 1000}k: ` +
        `their=${Math.round(theirTax)} ours=${Math.round(ourTax)} diff=${sign}${diffPct}%`
      );
    } catch {
      warn('wherenext', 'tax-check', `could not calculate for: ${slug}`);
    }
  }
}

// ── Dataset: median-salaries → CountrySalaryBenchmark ────────────────────────

interface SalaryEntry {
  code: string;
  currency: string;
  dataYear: number;
  medianGrossLocal: number;
  medianNetLocal: number;
  medianGrossUSD: number;
  medianNetUSD: number;
}

interface SalaryStats { created: number; updated: number; skipped: number }

async function importMedianSalaries(
  countryIdMap: Map<string, string>,
): Promise<SalaryStats> {
  const stats: SalaryStats = { created: 0, updated: 0, skipped: 0 };

  log('wherenext', 'median-salaries', 'fetching…');
  const raw = await fetchJson<{ countries?: SalaryEntry[] }>(`${BASE_URL}/median-salaries`);
  if (!raw?.countries) {
    warn('wherenext', 'median-salaries', 'no countries array — skipping');
    return stats;
  }

  log('wherenext', 'median-salaries', `received ${raw.countries.length} entries`);

  for (const entry of raw.countries) {
    const iso  = entry.code?.toUpperCase();
    const slug = ISO_TO_SLUG[iso];
    if (!slug) { stats.skipped++; continue; }

    const countryId = countryIdMap.get(slug);
    if (!countryId) { stats.skipped++; continue; }

    // Prefer USD values for cross-country comparability
    const grossMedian = entry.medianGrossUSD ?? entry.medianGrossLocal;
    const netMedian   = entry.medianNetUSD   ?? entry.medianNetLocal  ?? undefined;
    const currency    = entry.medianGrossUSD ? 'USD' : entry.currency;
    const year        = entry.dataYear ?? TAX_YEAR;

    if (!grossMedian) { stats.skipped++; continue; }

    if (isDryRun) {
      console.log(
        `  [dry-run] ${slug.padEnd(4)} year=${year}  gross=${Math.round(grossMedian)} ${currency}` +
        `  net=${netMedian ? Math.round(netMedian) : 'n/a'}`
      );
      stats.created++;
      continue;
    }

    const existing = await prisma.countrySalaryBenchmark.findFirst({
      where: { countryId, year },
    });

    if (existing) {
      await prisma.countrySalaryBenchmark.update({
        where: { id: existing.id },
        data: { grossMedian, netMedian: netMedian ?? null, source: SOURCE },
      });
      stats.updated++;
    } else {
      await prisma.countrySalaryBenchmark.create({
        data: { countryId, year, grossMedian, netMedian: netMedian ?? null, currency, source: SOURCE },
      });
      stats.created++;
    }

    log('wherenext', 'median-salaries', `${slug}: gross=${Math.round(grossMedian)} ${currency}  year=${year}`);
  }

  return stats;
}

// ── Dataset: digital-nomad-visas → JSON reference file ───────────────────────

async function exportDigitalNomadVisas(): Promise<void> {
  log('wherenext', 'digital-nomad-visas', 'fetching reference data…');
  const raw = await fetchJson<{ visas?: unknown[] }>(`${BASE_URL}/digital-nomad-visas`);
  if (!raw) {
    warn('wherenext', 'digital-nomad-visas', 'no data — skipping');
    return;
  }

  const outDir  = path.resolve(__dirname, 'output');
  const outFile = path.join(outDir, 'wherenext-visa-reference.json');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify(raw, null, 2), 'utf-8');

  const count = raw.visas?.length ?? 0;
  log('wherenext', 'digital-nomad-visas', `written ${count} visa entries → ${outFile}`);
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  log('wherenext', 'start', isDryRun ? 'DRY-RUN — DB will NOT be modified' : 'LIVE MODE');
  if (onlyArg) log('wherenext', 'filter', `only: ${onlyArg}`);

  const [cities, countries] = await Promise.all([
    prisma.city.findMany({ select: { id: true, slug: true } }),
    prisma.country.findMany({ select: { id: true, slug: true } }),
  ]);
  const cityIdMap    = new Map(cities.map(c    => [c.slug, c.id]));
  const countryIdMap = new Map(countries.map(c => [c.slug, c.id]));
  log('wherenext', 'setup', `${cities.length} cities, ${countries.length} countries in DB`);

  const periodStart = getPeriodStart();
  let colStats:    CoLStats    = { cities: 0, items: 0, warnings: 0 };
  let salaryStats: SalaryStats = { created: 0, updated: 0, skipped: 0 };

  if (shouldRun('cost-of-living'))   colStats    = await importCostOfLiving(cityIdMap, periodStart);
  if (shouldRun('expat-tax-rates'))  await checkExpatTaxRates();
  if (shouldRun('median-salaries'))  salaryStats = await importMedianSalaries(countryIdMap);
  if (shouldRun('digital-nomad-visas') && !isDryRun) await exportDigitalNomadVisas();

  await prisma.$disconnect();

  printSummary('WhereNext Import — Summary', [
    { label: 'Mode',                   value: isDryRun ? 'DRY-RUN (no writes)' : 'LIVE' },
    { label: 'CoL — cities touched',   value: colStats.cities },
    { label: 'CoL — items written',    value: colStats.items },
    { label: 'CoL — warnings',         value: colStats.warnings },
    { label: 'Salary — created',       value: salaryStats.created },
    { label: 'Salary — updated',       value: salaryStats.updated },
    { label: 'Salary — skipped',       value: salaryStats.skipped },
    { label: 'API requests made',      value: requestCount },
    { label: 'Source tag',             value: SOURCE },
  ]);
}

main().catch(err => {
  logError('wherenext', 'fatal', String(err));
  prisma.$disconnect().catch(() => undefined);
  process.exit(1);
});
