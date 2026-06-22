/**
 * Berlin cost-of-living, separated EUR positions — the DE home-city baseline,
 * mirroring Porto (seed-col-porto.ts) so the two cities compare on identical
 * categories. Replaces Berlin's USD wherenext money rows with clean EUR
 * positions; index rows (index_*) are left intact.
 *
 * Values (monthly EUR), anchored to Numbeo Berlin (2026-Q2):
 *   rent_cold_1br        941  Numbeo (1BR outside centre, KALT, 940.80)      high
 *   groceries_monthly    300  Numbeo market prices (single person)           medium
 *   transport_monthly     63  Numbeo (monthly pass)                          high
 *   electricity_monthly  110  DE household median                            medium
 *   water_monthly         72  DE median incl. Abwasser/Müll                  medium
 *   gas_monthly          170  DE heating (Heizkosten-dominated)              low-med
 *   internet_monthly      44  Numbeo (44.36)                                 high
 *   other_monthly        299  residual to Numbeo single-person €1058.2 (no rent)
 *   utilities_monthly    352  aggregate = electricity + water + gas (no internet)
 *   total_monthly_estimate 1999  rent 941 + 1058 (Numbeo excl. rent)
 *
 * Run: npm run seed:col:berlin
 * Idempotent: deletes the money categories below (incl. legacy rent_outside_1br)
 * for Berlin, then recreates them.
 */
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { COL_MONEY_CATEGORIES } from './col-categories';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const prisma = new PrismaClient();
const PERIOD_START = new Date('2026-06-22T00:00:00Z');
const NUMBEO = 'numbeo.com/cost-of-living/in/Berlin (2026-Q2)';
const DE_MEDIAN = 'DE household median (Verivox/Statista 2025)';

type Row = { category: string; value: number; source: string; confidence: number };

const ROWS: Row[] = [
  { category: COL_MONEY_CATEGORIES.rent_cold_1br, value: 941, source: NUMBEO, confidence: 75 },
  { category: COL_MONEY_CATEGORIES.groceries_monthly, value: 300, source: NUMBEO, confidence: 55 },
  { category: COL_MONEY_CATEGORIES.transport_monthly, value: 63, source: NUMBEO, confidence: 75 },
  { category: COL_MONEY_CATEGORIES.electricity_monthly, value: 110, source: DE_MEDIAN, confidence: 50 },
  { category: COL_MONEY_CATEGORIES.water_monthly, value: 72, source: DE_MEDIAN, confidence: 50 },
  { category: COL_MONEY_CATEGORIES.gas_monthly, value: 170, source: DE_MEDIAN, confidence: 45 },
  { category: COL_MONEY_CATEGORIES.internet_monthly, value: 44, source: NUMBEO, confidence: 75 },
  { category: COL_MONEY_CATEGORIES.other_monthly, value: 299, source: `${NUMBEO} (residual)`, confidence: 55 },
  { category: COL_MONEY_CATEGORIES.utilities_monthly, value: 352, source: 'aggregate = Strom+Wasser+Gas', confidence: 50 },
  { category: COL_MONEY_CATEGORIES.total_monthly_estimate, value: 1999, source: `${NUMBEO} (rent + €1058 excl. rent)`, confidence: 60 },
];

const OWNED_CATEGORIES = [...ROWS.map((r) => r.category), 'rent_outside_1br'];

async function main(): Promise<void> {
  console.log('🐻 Berlin COL — separated EUR positions\n');

  const city = await prisma.city.findUnique({ where: { slug: 'berlin' }, select: { id: true } });
  if (!city) throw new Error('Berlin city not found (slug=berlin)');

  const deleted = await prisma.costOfLivingItem.deleteMany({
    where: { cityId: city.id, category: { in: OWNED_CATEGORIES } },
  });
  console.log(`🧹 removed ${deleted.count} superseded money rows`);

  for (const row of ROWS) {
    await prisma.costOfLivingItem.create({
      data: {
        cityId: city.id, category: row.category, value: row.value, currency: 'EUR',
        source: row.source, confidence: row.confidence, periodStart: PERIOD_START,
      },
    });
    console.log(`  ✓ ${row.category.padEnd(24)} ${String(row.value).padStart(5)} EUR  conf=${row.confidence}`);
  }

  const sumPositions = ROWS.filter((r) =>
    ['rent_cold_1br', 'groceries_monthly', 'transport_monthly', 'electricity_monthly',
     'water_monthly', 'gas_monthly', 'internet_monthly', 'other_monthly'].includes(r.category),
  ).reduce((s, r) => s + r.value, 0);
  const total = ROWS.find((r) => r.category === 'total_monthly_estimate')!.value;
  const util = ROWS.find((r) => r.category === 'utilities_monthly')!.value;
  const utilParts = ROWS.filter((r) => ['electricity_monthly', 'water_monthly', 'gas_monthly'].includes(r.category))
    .reduce((s, r) => s + r.value, 0);
  console.log(`\n🔎 Σ positions = ${sumPositions} (total_monthly_estimate = ${total})`);
  console.log(`🔎 utilities_monthly ${util} == Strom+Wasser+Gas ${utilParts}: ${util === utilParts ? 'OK' : 'MISMATCH'}`);

  console.log('\n✅ Berlin COL seed complete.');
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
