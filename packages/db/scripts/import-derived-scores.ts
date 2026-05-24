/**
 * import-derived-scores.ts
 * Populates CityLifestyle with 3 derived score categories:
 *   tax_burden_score      — pre-computed via tax engine (standard €80k salary equiv.)
 *   cost_of_living_score  — Numbeo CoL Index 2024 (inverted: 100 = cheapest)
 *   purchasing_power_score — Numbeo Local Purchasing Power 2024 (100 = highest)
 *
 * Run: npx tsx packages/db/scripts/import-derived-scores.ts
 *
 * Tax burden formula: score = round((1 − effective_rate) × 100)
 * CoL formula: score = max(10, min(98, round(115 − numbeo_col_index)))
 * PP formula: score = min(98, round(numbeo_lpp × 0.72))
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ─── Tax burden pre-computed at €80k equivalent ────────────────────────────
// Source: @paymap/tax-engine calculateApproximate, single/employed, 2025.
// score = round((1 - effectiveRate) * 100) for each city's country module.
const TAX_BURDEN: Record<string, [number, string]> = {
  berlin:        [55, 'DE tax engine: ~45% effective rate at €80k (income + social)'],
  hamburg:       [55, 'DE tax engine: ~45% effective rate at €80k'],
  muenchen:      [55, 'DE tax engine: ~45% effective rate at €80k'],
  lissabon:      [65, 'PT tax engine: ~35% effective rate at €80k'],
  porto:         [65, 'PT tax engine: ~35% effective rate at €80k'],
  barcelona:     [62, 'ES tax engine: ~38% effective rate at €80k'],
  madrid:        [62, 'ES tax engine: ~38% effective rate at €80k'],
  valencia:      [62, 'ES tax engine: ~38% effective rate at €80k'],
  amsterdam:     [58, 'NL tax engine: ~42% effective rate at €80k (30%-ruling not assumed)'],
  rotterdam:     [58, 'NL tax engine: ~42% effective rate at €80k'],
  wien:          [57, 'AT tax engine: ~43% effective rate at €80k'],
  zuerich:       [75, 'CH tax engine: ~25% effective rate at CHF 86k (Zurich canton)'],
  mailand:       [55, 'IT tax engine: ~45% effective rate at €80k (IRPEF + social)'],
  paris:         [53, 'FR tax engine: ~47% effective rate at €80k'],
  dublin:        [62, 'IE tax engine: ~38% effective rate at €80k'],
  london:        [64, 'GB tax engine: ~36% effective rate at GBP 69k (income tax + NI)'],
  tallinn:       [75, 'EE tax engine: ~25% flat rate + ~2.3% pension at €80k'],
  warschau:      [70, 'PL tax engine: ~30% effective rate at €80k equiv.'],
  prag:          [72, 'CZ tax engine: ~28% effective rate at €80k equiv.'],
  budapest:      [67, 'HU tax engine: ~33% effective rate at €80k equiv.'],
  bukarest:      [65, 'RO tax engine: ~35% effective rate at €80k equiv.'],
  valletta:      [73, 'MT tax engine: ~27% effective rate at €80k'],
  tbilisi:       [78, 'GE tax engine: ~22% effective rate at GEL 216k (20% flat + 2% pension)'],
  dubai:         [100, 'UAE tax engine: 0% income tax — Net = Gross'],
  bangkok:       [82, 'TH tax engine: ~18% effective rate at THB 3M equiv.'],
  'chiang-mai':  [82, 'TH tax engine: ~18% effective rate at THB 3M equiv.'],
  bali:          [75, 'ID tax engine: ~25% effective rate at IDR 1.3B equiv. (PPh 21 + BPJS)'],
  medellin:      [65, 'CO tax engine: ~35% effective rate at COP 336M equiv.'],
  'mexiko-city': [70, 'MX tax engine: ~30% effective rate at MXN 1.44M (ISR + IMSS)'],
  'buenos-aires':[65, 'AR tax engine: ~35% effective rate at ARS 72M — ⚠ volatile, ±10%'],
  'new-york':    [65, 'US tax engine: ~35% effective rate at USD 86k (federal + FICA)'],
  miami:         [67, 'US tax engine: ~33% (Florida: no state income tax, saves ~5%)'],
  singapur:      [93, 'SG tax engine: ~7% effective rate at SGD 115k'],
  kapstadt:      [65, 'ZA tax engine: ~35% effective rate at ZAR 1.6M'],
};

// ─── Cost of Living (100 = cheapest) ──────────────────────────────────────
// Source: Numbeo CoL Index 2024 (base: NYC = 100).
// Formula: max(10, min(98, round(115 − numbeo_index))).
// Higher score = more affordable city for a given income.
const COST_OF_LIVING: Record<string, [number, string]> = {
  berlin:        [53, 'Numbeo 2024: CoL index ~62 (relative to NYC)'],
  hamburg:       [52, 'Numbeo 2024: CoL index ~63'],
  muenchen:      [45, 'Numbeo 2024: CoL index ~70'],
  lissabon:      [65, 'Numbeo 2024: CoL index ~50'],
  porto:         [67, 'Numbeo 2024: CoL index ~48'],
  barcelona:     [57, 'Numbeo 2024: CoL index ~58'],
  madrid:        [57, 'Numbeo 2024: CoL index ~58'],
  valencia:      [67, 'Numbeo 2024: CoL index ~48'],
  amsterdam:     [37, 'Numbeo 2024: CoL index ~78'],
  rotterdam:     [45, 'Numbeo 2024: CoL index ~70'],
  wien:          [49, 'Numbeo 2024: CoL index ~66'],
  zuerich:       [10, 'Numbeo 2024: CoL index ~115 (most expensive globally)'],
  mailand:       [47, 'Numbeo 2024: CoL index ~68'],
  paris:         [35, 'Numbeo 2024: CoL index ~80'],
  dublin:        [37, 'Numbeo 2024: CoL index ~78'],
  london:        [30, 'Numbeo 2024: CoL index ~85'],
  tallinn:       [63, 'Numbeo 2024: CoL index ~52'],
  warschau:      [67, 'Numbeo 2024: CoL index ~48'],
  prag:          [68, 'Numbeo 2024: CoL index ~47'],
  budapest:      [75, 'Numbeo 2024: CoL index ~40'],
  bukarest:      [77, 'Numbeo 2024: CoL index ~38'],
  valletta:      [57, 'Numbeo 2024: CoL index ~58'],
  tbilisi:       [80, 'Numbeo 2024: CoL index ~35'],
  dubai:         [47, 'Numbeo 2024: CoL index ~68 (housing cost high)'],
  bangkok:       [70, 'Numbeo 2024: CoL index ~45'],
  'chiang-mai':  [80, 'Numbeo 2024: CoL index ~35'],
  bali:          [77, 'Numbeo 2024: CoL index ~38'],
  medellin:      [82, 'Numbeo 2024: CoL index ~33'],
  'mexiko-city': [73, 'Numbeo 2024: CoL index ~42'],
  'buenos-aires':[68, 'Numbeo 2024: CoL index ~47'],
  'new-york':    [18, 'Numbeo 2024: CoL index ~100 (NYC baseline)'],
  miami:         [30, 'Numbeo 2024: CoL index ~85'],
  singapur:      [32, 'Numbeo 2024: CoL index ~83'],
  kapstadt:      [72, 'Numbeo 2024: CoL index ~43'],
};

// ─── Purchasing Power (100 = highest) ─────────────────────────────────────
// Source: Numbeo Local Purchasing Power Index 2024 (NYC = 100).
// Represents what local wages can buy; relevant for workers earning in local currency.
// Formula: min(98, round(numbeo_lpp × 0.72)).
const PURCHASING_POWER: Record<string, [number, string]> = {
  berlin:        [68, 'Numbeo 2024: LPP index ~95'],
  hamburg:       [70, 'Numbeo 2024: LPP index ~97'],
  muenchen:      [72, 'Numbeo 2024: LPP index ~100'],
  lissabon:      [55, 'Numbeo 2024: LPP index ~76'],
  porto:         [53, 'Numbeo 2024: LPP index ~74'],
  barcelona:     [62, 'Numbeo 2024: LPP index ~86'],
  madrid:        [64, 'Numbeo 2024: LPP index ~89'],
  valencia:      [60, 'Numbeo 2024: LPP index ~83'],
  amsterdam:     [72, 'Numbeo 2024: LPP index ~100'],
  rotterdam:     [70, 'Numbeo 2024: LPP index ~97'],
  wien:          [68, 'Numbeo 2024: LPP index ~94'],
  zuerich:       [92, 'Numbeo 2024: LPP index ~128 (highest globally)'],
  mailand:       [62, 'Numbeo 2024: LPP index ~86'],
  paris:         [65, 'Numbeo 2024: LPP index ~90'],
  dublin:        [68, 'Numbeo 2024: LPP index ~94'],
  london:        [64, 'Numbeo 2024: LPP index ~89'],
  tallinn:       [58, 'Numbeo 2024: LPP index ~81'],
  warschau:      [62, 'Numbeo 2024: LPP index ~86'],
  prag:          [62, 'Numbeo 2024: LPP index ~86'],
  budapest:      [55, 'Numbeo 2024: LPP index ~76'],
  bukarest:      [50, 'Numbeo 2024: LPP index ~69'],
  valletta:      [58, 'Numbeo 2024: LPP index ~81'],
  tbilisi:       [42, 'Numbeo 2024: LPP index ~58'],
  dubai:         [78, 'Numbeo 2024: LPP index ~108 (high expat salaries, 0% tax)'],
  bangkok:       [50, 'Numbeo 2024: LPP index ~69'],
  'chiang-mai':  [44, 'Numbeo 2024: LPP index ~61'],
  bali:          [36, 'Numbeo 2024: LPP index ~50'],
  medellin:      [34, 'Numbeo 2024: LPP index ~47'],
  'mexiko-city': [40, 'Numbeo 2024: LPP index ~56'],
  'buenos-aires':[32, 'Numbeo 2024: LPP index ~44 (inflation-eroded)'],
  'new-york':    [70, 'Numbeo 2024: LPP index ~97 (NYC baseline ~100, after costs)'],
  miami:         [68, 'Numbeo 2024: LPP index ~94'],
  singapur:      [74, 'Numbeo 2024: LPP index ~103'],
  kapstadt:      [36, 'Numbeo 2024: LPP index ~50'],
};

// ─── Main ──────────────────────────────────────────────────────────────────
async function main() {
  let inserted = 0;
  let updated  = 0;
  const now = new Date();

  const DATASETS: Array<{ category: string; source: string; data: Record<string, [number, string]>; confidence: number }> = [
    { category: 'tax_burden_score',      source: 'paymap-tax-engine-2025', data: TAX_BURDEN,       confidence: 78 },
    { category: 'cost_of_living_score',  source: 'numbeo-col-2024',        data: COST_OF_LIVING,   confidence: 82 },
    { category: 'purchasing_power_score',source: 'numbeo-lpp-2024',        data: PURCHASING_POWER, confidence: 80 },
  ];

  for (const ds of DATASETS) {
    for (const [citySlug, [score, sourceFootnote]] of Object.entries(ds.data)) {
      const city = await prisma.city.findFirst({ where: { slug: citySlug } });
      if (!city) { console.warn(`City not found: ${citySlug}`); continue; }

      const existing = await prisma.cityLifestyle.findFirst({
        where: { cityId: city.id, category: ds.category },
      });

      const payload = {
        cityId: city.id,
        category: ds.category,
        score,
        source: ds.source,
        confidence: ds.confidence,
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
    }
    console.log(`  ✓ ${ds.category}`);
  }

  console.log(`\nDone: ${inserted} inserted, ${updated} updated`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
