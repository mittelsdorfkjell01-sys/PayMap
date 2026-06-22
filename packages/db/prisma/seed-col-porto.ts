/**
 * Schritt 1 — Porto cost-of-living, separated EUR positions.
 *
 * Replaces Porto's USD wherenext-derived money rows with clean, individually
 * listed EUR positions (Miete/Lebensmittel/ÖPNV + the now-separated
 * Strom/Wasser/Gas/Internet + Sonstige). Index rows (index_*) are left intact.
 *
 * Values (monthly EUR), confirmed by the owner:
 *   rent_cold_1br        863  Numbeo Porto (1BR outside centre, KALT)        high
 *   groceries_monthly    200  Numbeo Porto market prices (single person)     medium
 *   transport_monthly     40  Numbeo Porto (monthly pass)                    high
 *   electricity_monthly   60  PT household median (idealista/globalcitizen)  medium
 *   water_monthly         40  PT median incl. waste/taxa de resíduos         medium
 *   gas_monthly           30  PT natural-gas household                       low
 *   internet_monthly      33  Numbeo Porto (32.92)                           high
 *   other_monthly        307  residual to Numbeo single-person €710.1 (no rent)
 *   utilities_monthly    130  aggregate = electricity + water + gas (no internet)
 *   total_monthly_estimate 1573  rent 863 + 710 (Numbeo excl. rent)
 *
 * Run: npm run seed:col:porto  (from repo root or packages/db)
 *
 * Idempotent: deletes the money categories below (incl. the legacy
 * `rent_outside_1br`) for Porto, then recreates them.
 */
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { COL_MONEY_CATEGORIES } from './col-categories';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const prisma = new PrismaClient();
const PERIOD_START = new Date('2026-06-22T00:00:00Z');
const NUMBEO = 'numbeo.com/cost-of-living/in/Porto (2026-Q2)';
const PT_MEDIAN = 'PT household median (idealista/globalcitizensolutions 2025)';

type Row = { category: string; value: number; source: string; confidence: number };

const ROWS: Row[] = [
  { category: COL_MONEY_CATEGORIES.rent_cold_1br, value: 863, source: NUMBEO, confidence: 75 },
  { category: COL_MONEY_CATEGORIES.groceries_monthly, value: 200, source: NUMBEO, confidence: 55 },
  { category: COL_MONEY_CATEGORIES.transport_monthly, value: 40, source: NUMBEO, confidence: 75 },
  { category: COL_MONEY_CATEGORIES.electricity_monthly, value: 60, source: PT_MEDIAN, confidence: 50 },
  { category: COL_MONEY_CATEGORIES.water_monthly, value: 40, source: PT_MEDIAN, confidence: 50 },
  { category: COL_MONEY_CATEGORIES.gas_monthly, value: 30, source: PT_MEDIAN, confidence: 40 },
  { category: COL_MONEY_CATEGORIES.internet_monthly, value: 33, source: NUMBEO, confidence: 75 },
  { category: COL_MONEY_CATEGORIES.other_monthly, value: 307, source: `${NUMBEO} (residual)`, confidence: 55 },
  { category: COL_MONEY_CATEGORIES.utilities_monthly, value: 130, source: 'aggregate = Strom+Wasser+Gas', confidence: 50 },
  { category: COL_MONEY_CATEGORIES.total_monthly_estimate, value: 1573, source: `${NUMBEO} (rent + €710 excl. rent)`, confidence: 60 },
];

// Categories this seed owns and clears before reinserting (incl. legacy name).
const OWNED_CATEGORIES = [...ROWS.map((r) => r.category), 'rent_outside_1br'];

async function main(): Promise<void> {
  console.log('🌍 Porto COL — separated EUR positions\n');

  const city = await prisma.city.findUnique({ where: { slug: 'porto' }, select: { id: true } });
  if (!city) throw new Error('Porto city not found (slug=porto)');

  const deleted = await prisma.costOfLivingItem.deleteMany({
    where: { cityId: city.id, category: { in: OWNED_CATEGORIES } },
  });
  console.log(`🧹 removed ${deleted.count} superseded money rows`);

  for (const row of ROWS) {
    await prisma.costOfLivingItem.create({
      data: {
        cityId: city.id,
        category: row.category,
        value: row.value,
        currency: 'EUR',
        source: row.source,
        confidence: row.confidence,
        periodStart: PERIOD_START,
      },
    });
    console.log(`  ✓ ${row.category.padEnd(24)} ${String(row.value).padStart(5)} EUR  conf=${row.confidence}`);
  }

  // Consistency checks (no double-counting in the breakdown sum).
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

  console.log('\n✅ Porto COL seed complete.');
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
