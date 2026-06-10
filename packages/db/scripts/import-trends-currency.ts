/**
 * import-trends-currency.ts
 * Populates CityLifestyle.currency_stability for every active city.
 *
 * currency_stability (0–100, higher = more stable) is a COUNTRY-level metric
 * applied to each of the country's cities. It is computed from two transparent,
 * auditable inputs — never guessed:
 *
 *   1. Inflation (60% weight) — REAL, SOURCED data:
 *      World Bank, "Inflation, consumer prices (annual %)" indicator
 *      FP.CPI.TOTL.ZG, year 2024. Retrieved 2026-06-10.
 *      https://data.worldbank.org/indicator/FP.CPI.TOTL.ZG
 *      infScore = clamp(0,100, 100 − 5.5 × max(0, inflation − 2))
 *      (2% = price stability target → 100; each pp above costs 5.5 points.)
 *
 *   2. FX regime vs EUR (40% weight) — a DOCUMENTED public classification of
 *      the currency's exchange-rate regime against the euro (the reference
 *      currency for a Germany-based user). This is a regime band, NOT a measured
 *      FX volatility series — stated honestly so the score is reproducible:
 *        EUR member ............... 100  (no FX risk for a euro earner)
 *        Safe-haven float (CHF) .... 88
 *        Hard USD peg (AED) / tight managed band (SGD) ... 78
 *        Major free float (USD, GBP) ..................... 70
 *        EU non-euro managed float (PLN, CZK, HUF, RON) .. 60
 *        EM free float (THB, IDR, MXN, ZAR, COP, GEL) .... 50
 *        Currency in crisis (ARS) ........................ 10
 *
 *   currency_stability = round(0.6 × infScore + 0.4 × fxRegimeScore)
 *
 * Run (only after review — NOT executed automatically):
 *   npx tsx packages/db/scripts/import-trends-currency.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const CATEGORY = 'currency_stability';
const SOURCE = 'worldbank-cpi-2024+fx-regime';
const CONFIDENCE = 70;
const INFLATION_RETRIEVED = '2026-06-10';

type Regime =
  | 'EUR' | 'CHF' | 'PEG_USD' | 'MANAGED_BAND'
  | 'MAJOR_FLOAT' | 'EU_MANAGED' | 'EM_FLOAT' | 'CRISIS';

const REGIME_SCORE: Record<Regime, number> = {
  EUR: 100, CHF: 88, PEG_USD: 78, MANAGED_BAND: 78,
  MAJOR_FLOAT: 70, EU_MANAGED: 60, EM_FLOAT: 50, CRISIS: 10,
};

const REGIME_LABEL: Record<Regime, string> = {
  EUR: 'EUR member (no FX risk for euro earner)',
  CHF: 'CHF safe-haven float',
  PEG_USD: 'hard USD peg',
  MANAGED_BAND: 'tightly managed band',
  MAJOR_FLOAT: 'major free float',
  EU_MANAGED: 'EU non-euro managed float',
  EM_FLOAT: 'EM free float',
  CRISIS: 'currency in crisis',
};

// countrySlug → { inflation 2024 (World Bank FP.CPI.TOTL.ZG, %), FX regime }
const COUNTRY: Record<string, { infl: number; regime: Regime }> = {
  de:  { infl: 2.26,   regime: 'EUR' },
  at:  { infl: 2.94,   regime: 'EUR' },
  nl:  { infl: 3.35,   regime: 'EUR' },
  pt:  { infl: 2.42,   regime: 'EUR' },
  es:  { infl: 2.77,   regime: 'EUR' },
  fr:  { infl: 2.00,   regime: 'EUR' },
  it:  { infl: 0.98,   regime: 'EUR' },
  ie:  { infl: 2.11,   regime: 'EUR' },
  ee:  { infl: 3.52,   regime: 'EUR' },
  mt:  { infl: 1.65,   regime: 'EUR' },
  ch:  { infl: 1.06,   regime: 'CHF' },
  uae: { infl: 1.66,   regime: 'PEG_USD' },
  sg:  { infl: 2.39,   regime: 'MANAGED_BAND' },
  us:  { infl: 2.95,   regime: 'MAJOR_FLOAT' },
  gb:  { infl: 3.27,   regime: 'MAJOR_FLOAT' },
  pl:  { infl: 3.79,   regime: 'EU_MANAGED' },
  cz:  { infl: 2.44,   regime: 'EU_MANAGED' },
  hu:  { infl: 3.70,   regime: 'EU_MANAGED' },
  ro:  { infl: 5.72,   regime: 'EU_MANAGED' },
  th:  { infl: 1.37,   regime: 'EM_FLOAT' },
  id:  { infl: 2.18,   regime: 'EM_FLOAT' },
  mx:  { infl: 4.72,   regime: 'EM_FLOAT' },
  za:  { infl: 4.36,   regime: 'EM_FLOAT' },
  co:  { infl: 6.61,   regime: 'EM_FLOAT' },
  ge:  { infl: 1.11,   regime: 'EM_FLOAT' },
  ar:  { infl: 219.88, regime: 'CRISIS' },
};

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

export function currencyStabilityScore(infl: number, regime: Regime): number {
  const infScore = clamp(100 - 5.5 * Math.max(0, infl - 2), 0, 100);
  const fxScore = REGIME_SCORE[regime];
  return Math.round(0.6 * infScore + 0.4 * fxScore);
}

async function main() {
  const cities = await prisma.city.findMany({
    where: { isActive: true },
    select: { id: true, slug: true, country: { select: { slug: true } } },
  });

  let inserted = 0;
  let updated = 0;
  let skipped = 0;
  const now = new Date();

  for (const city of cities) {
    const cs = city.country?.slug;
    const data = cs ? COUNTRY[cs] : undefined;
    if (!data) {
      console.warn(`  ⚠ no currency data for ${city.slug} (country=${cs ?? 'null'}) — skipped`);
      skipped++;
      continue;
    }
    const score = currencyStabilityScore(data.infl, data.regime);
    const sourceFootnote =
      `Inflation ${data.infl}% (World Bank CPI 2024, retrieved ${INFLATION_RETRIEVED}) ` +
      `+ FX regime: ${REGIME_LABEL[data.regime]}. ` +
      `Composite = round(0.6×inflation-score + 0.4×regime-score).`;

    const existing = await prisma.cityLifestyle.findFirst({
      where: { cityId: city.id, category: CATEGORY },
    });
    const payload = {
      cityId: city.id,
      category: CATEGORY,
      score,
      source: SOURCE,
      confidence: CONFIDENCE,
      sourceFootnote,
      updatedAt: now,
    };
    if (existing) {
      await prisma.cityLifestyle.update({ where: { id: existing.id }, data: payload });
      updated++;
    } else {
      await prisma.cityLifestyle.create({ data: payload });
      inserted++;
    }
    console.log(`  ✓ ${city.slug.padEnd(16)} ${String(score).padStart(3)}  (${cs})`);
  }

  console.log(`\nDone: ${inserted} inserted, ${updated} updated, ${skipped} skipped`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
