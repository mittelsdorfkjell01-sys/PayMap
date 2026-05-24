/**
 * compute-derived-scores.ts
 * Computes 6 derived CityLifestyle score categories from existing DB data
 * or manually curated tables.
 *
 * Scores computed:
 *   1. cost_of_living_score      — from CostOfLivingItem.total_monthly_estimate
 *   2. purchasing_power_score    — monthly net (tax engine at benchmark gross) minus CoL
 *   3. tax_burden_score          — tax engine at 60k EUR, single, childless
 *   4. naturkatastrophen_resilienz — manual table (World Risk Report 2024)
 *   5. direct_flight_to_germany  — manual table (Flightradar24 / schedule data)
 *   6. healthcare_quality        — manual table (WHO HALE + Numbeo Health Care Index)
 *
 * Run:
 *   tsx compute-derived-scores.ts [--dry-run] [--only=<scoreType>]
 *
 * Example:
 *   tsx compute-derived-scores.ts --dry-run --only=tax_burden_score
 */

import { prisma }   from './_lib/prisma';
import { log, warn, printSummary } from './_lib/logger';
import { cityMapping } from './_lib/city-mapping';
import { calculateApproximate } from '@paymap/tax-engine';

const DRY_RUN = process.argv.includes('--dry-run');
const ONLY    = process.argv.find(a => a.startsWith('--only='))?.split('=')[1] ?? null;

const SCORE_TYPES = [
  'cost_of_living_score',
  'purchasing_power_score',
  'tax_burden_score',
  'naturkatastrophen_resilienz',
  'direct_flight_to_germany',
  'healthcare_quality',
] as const;
type ScoreType = typeof SCORE_TYPES[number];

if (ONLY && !SCORE_TYPES.includes(ONLY as ScoreType)) {
  console.error(`Unknown score type: ${ONLY}. Valid: ${SCORE_TYPES.join(', ')}`);
  process.exit(1);
}

const TYPES_TO_RUN: ScoreType[] = ONLY
  ? [ONLY as ScoreType]
  : [...SCORE_TYPES];

// ─── Exchange rate helpers ─────────────────────────────────────────────────────

async function getRate(from: string, to: string): Promise<number | null> {
  if (from === to) return 1;
  const direct = await prisma.exchangeRate.findFirst({
    where: { base: from, target: to },
    orderBy: { fetchedAt: 'desc' },
  });
  if (direct) return direct.rate;
  const inv = await prisma.exchangeRate.findFirst({
    where: { base: to, target: from },
    orderBy: { fetchedAt: 'desc' },
  });
  return inv ? 1 / inv.rate : null;
}

async function toEUR(amount: number, currency: string): Promise<number | null> {
  const rate = await getRate(currency, 'EUR');
  return rate != null ? amount * rate : null;
}

async function fromEUR(amount: number, currency: string): Promise<number | null> {
  const rate = await getRate('EUR', currency);
  return rate != null ? amount * rate : null;
}

// ─── Manual tables (country-level unless specified) ────────────────────────────

// World Risk Report 2024 — higher = less disaster risk
const DISASTER_RESILIENCE: Record<string, number> = {
  de: 85, at: 80, ch: 75, nl: 78,
  pt: 65,   // seismic risk
  es: 70, fr: 70,
  it: 50,   // earthquakes + volcanoes
  ie: 80, gb: 75, mt: 70,
  ee: 85, pl: 80, cz: 82, hu: 80,
  ro: 65,   // seismic zone
  ge: 60, uae: 80,
  th: 45,   // floods + tsunamis
  us: 50,   // varied — tornadoes, hurricanes, wildfires
  sg: 75,
  id: 25,   // Ring of Fire: earthquakes + volcanoes + tsunamis
  co: 50, mx: 45,
  ar: 70, za: 65,
};

// Flightradar24 + IATA schedule data. 100 = direct flights FRA/MUC/BER multiple/week
const FLIGHT_TO_DE: Record<string, number> = {
  berlin:        100, hamburg:       100, muenchen:      100,
  lissabon:      100, porto:          80,
  barcelona:     100, madrid:        100, valencia:       80,
  amsterdam:     100, rotterdam:      80,
  wien:          100,
  zuerich:       100,
  mailand:       100,
  paris:         100,
  dublin:        100,
  london:        100,
  tallinn:        80,
  warschau:      100,
  prag:          100,
  budapest:      100,
  bukarest:       80,
  valletta:       80,
  tbilisi:        60,
  dubai:         100,
  bangkok:        80,
  'chiang-mai':   40,
  bali:           40,
  medellin:       40,
  'mexiko-city':  60,
  'buenos-aires': 60,
  'new-york':    100,
  miami:          80,
  singapur:       80,
  kapstadt:       60,
};

// WHO Healthy Life Expectancy + Numbeo Health Care Index 2024 (country-level)
const HEALTHCARE: Record<string, number> = {
  de: 80, at: 82, ch: 90, nl: 80, pt: 75,
  es: 80, fr: 78, it: 75, ie: 70, gb: 70,
  mt: 75, ee: 70, pl: 65, cz: 72, hu: 65,
  ro: 55, ge: 55, uae: 75, th: 60, us: 65,
  sg: 88, id: 50, co: 60, mx: 55, ar: 60, za: 50,
};

// ─── CoL normalisation constants ───────────────────────────────────────────────

const COL_MIN_EUR = 500;    // cheapest city → score 100
const COL_MAX_EUR = 4000;   // most expensive → score 0

function colToScore(eurPerMonth: number): number {
  const clamped = Math.max(COL_MIN_EUR, Math.min(COL_MAX_EUR, eurPerMonth));
  return Math.round(((COL_MAX_EUR - clamped) / (COL_MAX_EUR - COL_MIN_EUR)) * 100);
}

// ─── PP normalisation ─────────────────────────────────────────────────────────

const PP_MAX_EUR = 4000; // surplus → score 100; ≤0 → score 0

function ppToScore(surplus: number): number {
  if (surplus <= 0) return 0;
  return Math.round(Math.min(100, (surplus / PP_MAX_EUR) * 100));
}

// ─── Upsert helper ────────────────────────────────────────────────────────────

async function upsert(
  cityId: string,
  category: string,
  score: number,
  source: string,
  confidence: number,
  footnote: string,
): Promise<'inserted' | 'updated'> {
  const existing = await prisma.cityLifestyle.findFirst({
    where: { cityId, category },
  });
  const payload = { cityId, category, score, source, confidence, sourceFootnote: footnote, updatedAt: new Date() };
  if (existing) {
    await prisma.cityLifestyle.update({ where: { id: existing.id }, data: payload });
    return 'updated';
  }
  await prisma.cityLifestyle.create({ data: payload });
  return 'inserted';
}

// ─── Score computers ──────────────────────────────────────────────────────────

async function computeCostOfLiving(): Promise<void> {
  const TASK     = 'col-score';
  const CATEGORY = 'cost_of_living_score';
  let ok = 0; let skip = 0;
  const now = new Date().toISOString().slice(0, 10);
  const FOOTNOTE =
    `Aus CostOfLivingItem.total_monthly_estimate abgeleitet. ` +
    `Skala: ${COL_MIN_EUR}€/Monat = Score 100 (günstigste), ${COL_MAX_EUR}€/Monat = Score 0 (teuerste). ` +
    `Linear interpoliert. Stand: ${now}.`;

  for (const city of cityMapping) {
    const dbCity = await prisma.city.findFirst({ where: { slug: city.ourSlug, isActive: true } });
    if (!dbCity) { skip++; continue; }

    const colItem = await prisma.costOfLivingItem.findFirst({
      where: { cityId: dbCity.id, category: 'total_monthly_estimate' },
      orderBy: { periodStart: 'desc' },
    });
    if (!colItem) { warn(TASK, 'no-col', city.ourSlug); skip++; continue; }

    const colEUR = await toEUR(colItem.value, colItem.currency);
    if (colEUR == null) { warn(TASK, 'no-rate', `${city.ourSlug} ${colItem.currency}`); skip++; continue; }

    const score = colToScore(colEUR);
    log(TASK, 'score', `${city.ourSlug.padEnd(14)} ${Math.round(colEUR)}€/mo → ${score}`);
    if (!DRY_RUN) { await upsert(dbCity.id, CATEGORY, score, 'computed-col-2025', 75, FOOTNOTE); ok++; }
  }
  log(TASK, 'done', `${ok} written, ${skip} skipped`);
}

async function computeTaxBurden(): Promise<Map<string, number>> {
  const TASK      = 'tax-burden';
  const CATEGORY  = 'tax_burden_score';
  const REF_EUR   = 60_000;
  const YEAR      = new Date().getFullYear();
  const FOOTNOTE  =
    'Effektiver Steuersatz bei 60.000 EUR Brutto, Single, kinderlos (inkl. Sozialabgaben). ' +
    'Formel: score = round((1 − effectiveRate) × 100). ' +
    '100 = keine Steuer (UAE), ~55 = ~45% Steuerlast (DE), 0 = ~100% Steuerlast.';

  const rateBySlug = new Map<string, number>(); // countrySlug → effectiveRate for re-use in PP

  for (const city of cityMapping) {
    const dbCity = await prisma.city.findFirst({ where: { slug: city.ourSlug, isActive: true } });
    if (!dbCity) continue;

    let effectiveRate = 0;
    let score = 50;
    try {
      const grossLocal = await fromEUR(REF_EUR, city.countrySlug === 'uae' ? 'AED' : 'EUR');
      const currency   = city.countrySlug === 'uae' ? 'AED' :
                         city.countrySlug === 'ch'  ? 'CHF' :
                         city.countrySlug === 'gb'  ? 'GBP' :
                         city.countrySlug === 'sg'  ? 'SGD' :
                         city.countrySlug === 'id'  ? 'IDR' :
                         city.countrySlug === 'co'  ? 'COP' :
                         city.countrySlug === 'mx'  ? 'MXN' :
                         city.countrySlug === 'ar'  ? 'ARS' :
                         city.countrySlug === 'za'  ? 'ZAR' :
                         city.countrySlug === 'th'  ? 'THB' :
                         city.countrySlug === 'ge'  ? 'GEL' :
                         'EUR';
      const gross       = grossLocal ?? REF_EUR;
      const result      = calculateApproximate(city.countrySlug, gross, currency, YEAR, 'de');
      effectiveRate     = result.effectiveRate;
      score             = Math.max(0, Math.min(100, Math.round((1 - effectiveRate) * 100)));
    } catch {
      warn(TASK, 'calc-failed', city.ourSlug);
    }

    rateBySlug.set(city.countrySlug, effectiveRate);
    log(TASK, 'score', `${city.ourSlug.padEnd(14)} rate=${(effectiveRate * 100).toFixed(1)}% → ${score}`);
    if (!DRY_RUN) { await upsert(dbCity.id, CATEGORY, score, 'paymap-tax-engine-2025', 78, FOOTNOTE); }
  }
  return rateBySlug;
}

async function computePurchasingPower(effectiveRates: Map<string, number>): Promise<void> {
  const TASK     = 'pp-score';
  const CATEGORY = 'purchasing_power_score';
  let ok = 0; let skip = 0;
  const now = new Date().toISOString().slice(0, 10);
  const FOOTNOTE =
    'Monatliches Netto-Median (CountrySalaryBenchmark nach Steuer via Tax Engine) ' +
    'minus monatliche Lebenshaltungskosten in EUR. ' +
    `Skala: 0€ Überschuss = Score 0, ${PP_MAX_EUR}€ = Score 100. Stand: ${now}.`;

  for (const city of cityMapping) {
    const dbCity = await prisma.city.findFirst({
      where: { slug: city.ourSlug, isActive: true },
      include: {
        country: {
          include: {
            countrySalaryBenchmarks: { orderBy: { year: 'desc' }, take: 1 },
          },
        },
      },
    });
    if (!dbCity) { skip++; continue; }

    const benchmark = dbCity.country?.countrySalaryBenchmarks?.[0];
    const colItem   = await prisma.costOfLivingItem.findFirst({
      where: { cityId: dbCity.id, category: 'total_monthly_estimate' },
      orderBy: { periodStart: 'desc' },
    });

    if (!benchmark || !colItem) { warn(TASK, 'missing-data', city.ourSlug); skip++; continue; }

    const grossEUR = await toEUR(benchmark.grossMedian, benchmark.currency);
    const colEUR   = await toEUR(colItem.value, colItem.currency);
    if (grossEUR == null || colEUR == null) { warn(TASK, 'no-rate', city.ourSlug); skip++; continue; }

    const effRate     = effectiveRates.get(city.countrySlug) ?? 0.35;
    const netMonthly  = (grossEUR / 12) * (1 - effRate);
    const surplus     = netMonthly - colEUR;
    const score       = ppToScore(surplus);

    log(TASK, 'score', `${city.ourSlug.padEnd(14)} net=${Math.round(netMonthly)}€ col=${Math.round(colEUR)}€ surplus=${Math.round(surplus)}€ → ${score}`);
    if (!DRY_RUN) { await upsert(dbCity.id, CATEGORY, score, 'computed-pp-2025', 72, FOOTNOTE); ok++; }
  }
  log(TASK, 'done', `${ok} written, ${skip} skipped`);
}

async function computeManualByCountry(
  category: string,
  table: Record<string, number>,
  source: string,
  confidence: number,
  footnote: string,
): Promise<void> {
  const TASK = category;
  let ok = 0; let skip = 0;

  for (const city of cityMapping) {
    const score = table[city.countrySlug];
    if (score === undefined) { warn(TASK, 'no-value', `${city.ourSlug} (country: ${city.countrySlug})`); skip++; continue; }

    log(TASK, 'score', `${city.ourSlug.padEnd(14)} country=${city.countrySlug} → ${score}`);

    if (!DRY_RUN) {
      const dbCity = await prisma.city.findFirst({ where: { slug: city.ourSlug, isActive: true } });
      if (!dbCity) { skip++; continue; }
      await upsert(dbCity.id, category, score, source, confidence, footnote);
      ok++;
    }
  }
  log(TASK, 'done', `${ok} written, ${skip} skipped`);
}

async function computeManualByCity(
  category: string,
  table: Record<string, number>,
  source: string,
  confidence: number,
  footnote: string,
): Promise<void> {
  const TASK = category;
  let ok = 0; let skip = 0;

  for (const city of cityMapping) {
    const score = table[city.ourSlug];
    if (score === undefined) { warn(TASK, 'no-value', city.ourSlug); skip++; continue; }

    log(TASK, 'score', `${city.ourSlug.padEnd(14)} → ${score}`);

    if (!DRY_RUN) {
      const dbCity = await prisma.city.findFirst({ where: { slug: city.ourSlug, isActive: true } });
      if (!dbCity) { skip++; continue; }
      await upsert(dbCity.id, category, score, source, confidence, footnote);
      ok++;
    }
  }
  log(TASK, 'done', `${ok} written, ${skip} skipped`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  if (DRY_RUN) console.log('\nDRY RUN — no DB writes\n');
  if (ONLY) console.log(`Running only: ${ONLY}\n`);

  const counters: Record<string, string> = {};

  if (TYPES_TO_RUN.includes('tax_burden_score') || TYPES_TO_RUN.includes('purchasing_power_score')) {
    console.log('\n── tax_burden_score ──');
    const rates = await computeTaxBurden();
    counters['tax_burden_score'] = 'done';

    if (TYPES_TO_RUN.includes('purchasing_power_score')) {
      console.log('\n── purchasing_power_score ──');
      await computePurchasingPower(rates);
      counters['purchasing_power_score'] = 'done';
    }
  }

  if (TYPES_TO_RUN.includes('cost_of_living_score')) {
    console.log('\n── cost_of_living_score ──');
    await computeCostOfLiving();
    counters['cost_of_living_score'] = 'done';
  }

  if (TYPES_TO_RUN.includes('naturkatastrophen_resilienz')) {
    console.log('\n── naturkatastrophen_resilienz ──');
    await computeManualByCountry(
      'naturkatastrophen_resilienz',
      DISASTER_RESILIENCE,
      'world-risk-report-2024',
      65,
      'World Risk Report 2024, Land-Ebene. Skala: 100 = sehr geringes Risiko (DE/Skandinavien), ' +
      '50 = mittel, 0 = sehr hohes Risiko (Pazifik-Ring). Berücksichtigt Erdbeben, Vulkane, Tsunamis, Überschwemmungen.',
    );
    counters['naturkatastrophen_resilienz'] = 'done';
  }

  if (TYPES_TO_RUN.includes('direct_flight_to_germany')) {
    console.log('\n── direct_flight_to_germany ──');
    await computeManualByCity(
      'direct_flight_to_germany',
      FLIGHT_TO_DE,
      'flightradar24-iata-2025',
      80,
      'Direktflug-Verbindung zu Deutschland (FRA/MUC/BER). 100 = mehrmals wöchentlich direkt, ' +
      '80 = einmal wöchentlich direkt, 60 = 1× Umstieg unter 12h, 40 = 1× Umstieg über 12h, ' +
      '20 = mehrere Umstiege.',
    );
    counters['direct_flight_to_germany'] = 'done';
  }

  if (TYPES_TO_RUN.includes('healthcare_quality')) {
    console.log('\n── healthcare_quality ──');
    await computeManualByCountry(
      'healthcare_quality',
      HEALTHCARE,
      'who-hale-numbeo-health-2024',
      70,
      'Gesundheitssystem-Qualität basierend auf WHO Healthy Life Expectancy (HALE 2023) ' +
      '+ Numbeo Health Care Index 2024. Skala: 100 = exzellent (CH, SG), 50 = mittel, 0 = sehr schlecht.',
    );
    counters['healthcare_quality'] = 'done';
  }

  printSummary('Derived Scores Compute', [
    { label: 'Mode',    value: DRY_RUN ? 'dry-run (no writes)' : 'live' },
    ...Object.entries(counters).map(([k, v]) => ({ label: k, value: v })),
  ]);

  await prisma.$disconnect();
}

main().catch(err => {
  console.error(String(err));
  prisma.$disconnect().catch(() => undefined);
  process.exit(1);
});
