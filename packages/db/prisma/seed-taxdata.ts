/**
 * Focused tax-data seed: Region + the year-versioned tax tables (TaxBracket,
 * SocialContribution, Deduction, Surcharge, FixedAmount) from the canonical
 * engine dataset (DEFAULT_TAX_DATA). Makes the DB the editable single source of
 * truth that `loadTaxData` reads. Does NOT touch cities, lifestyle, COL,
 * narratives, etc. — only the tax layer + region links.
 *
 * Idempotent: regions are upserted; tax rows are inserted per country/year only
 * when that category is still empty (count === 0), so re-running is safe and
 * never duplicates. To re-import changed values, clear that country/year's rows
 * first (or edit them directly — they are admin-editable).
 *
 * Prerequisite: migration 20260608000000_tax_engine_regions_surcharges_fixed
 * must be applied (creates Region/Surcharge/FixedAmount + columns).
 *
 * Run: npm run seed:taxdata  (writes to whatever DATABASE_URL points at)
 */
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { DEFAULT_TAX_DATA, TAX_DATA_SOURCES, REGIONS, CITY_REGIONS } from '@paymap/tax-engine';

dotenv.config({ path: path.resolve(__dirname, '../.env') });
const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log('🏛  Seeding tax data (Region + tax tables) from DEFAULT_TAX_DATA\n');

  const countries = await prisma.country.findMany({ select: { id: true, slug: true } });
  const countryMap = new Map(countries.map((c) => [c.slug, c.id]));
  const cities = await prisma.city.findMany({ select: { id: true, slug: true } });
  const cityMap = new Map(cities.map((c) => [c.slug, c.id]));
  console.log(`   countries=${countryMap.size} cities=${cityMap.size}`);

  // ── Regions + city links ────────────────────────────────────────────────
  const regionMap = new Map<string, string>();
  for (const reg of REGIONS) {
    const cId = countryMap.get(reg.countryCode);
    if (!cId) continue;
    const existing = await prisma.region.findFirst({ where: { countryId: cId, slug: reg.slug } });
    const row = existing
      ? await prisma.region.update({ where: { id: existing.id }, data: { nameDE: reg.nameDE, nameEN: reg.nameEN } })
      : await prisma.region.create({ data: { countryId: cId, slug: reg.slug, nameDE: reg.nameDE, nameEN: reg.nameEN } });
    regionMap.set(reg.slug, row.id);
  }
  for (const [citySlug, regionSlug] of Object.entries(CITY_REGIONS)) {
    const cityId = cityMap.get(citySlug);
    const regionId = regionMap.get(regionSlug);
    if (!cityId || !regionId) continue;
    await prisma.city.update({ where: { id: cityId }, data: { regionId } });
  }
  console.log(`   regions=${regionMap.size} (city links applied)`);

  // ── Tax tables per country/year ─────────────────────────────────────────
  const toRegionId = (slug?: string | null) => (slug ? regionMap.get(slug) ?? null : null);
  let inserted = 0;
  for (const [slug, td] of Object.entries(DEFAULT_TAX_DATA)) {
    const cId = countryMap.get(slug);
    if (!cId) { console.log(`   ⚠ no country row for '${slug}' — skipped`); continue; }
    const src = TAX_DATA_SOURCES[slug] ?? '';
    const year = td.year;

    if (td.brackets.length > 0 && (await prisma.taxBracket.count({ where: { countryId: cId, year } })) === 0) {
      await prisma.taxBracket.createMany({
        data: td.brackets.map((b) => ({
          countryId: cId, regionId: toRegionId(b.regionId), filingStatus: b.filingStatus ?? null,
          fromAmount: b.from, toAmount: b.to ?? null, rate: b.rate, year,
          employmentType: b.employmentType ?? 'employed', sourceUrl: src || null,
        })),
      });
      inserted += td.brackets.length;
    }
    if (td.social.length > 0 && (await prisma.socialContribution.count({ where: { countryId: cId, year } })) === 0) {
      await prisma.socialContribution.createMany({
        data: td.social.map((s) => ({
          countryId: cId, type: s.type, rate: s.rate, ceiling: s.ceiling ?? null,
          employeeSide: true, year, sourceUrl: src || null,
        })),
      });
      inserted += td.social.length;
    }
    if (td.deductions.length > 0 && (await prisma.deduction.count({ where: { countryId: cId, year } })) === 0) {
      await prisma.deduction.createMany({
        data: td.deductions.map((d) => ({
          countryId: cId, type: d.type, amount: d.amount ?? null, percentage: d.percentage ?? null,
          condition: d.condition ?? null, year, sourceUrl: src || null,
        })),
      });
      inserted += td.deductions.length;
    }
    if (td.surcharges.length > 0 && (await prisma.surcharge.count({ where: { countryId: cId, year } })) === 0) {
      await prisma.surcharge.createMany({
        data: td.surcharges.map((s) => ({
          countryId: cId, regionId: toRegionId(s.regionId), cityScope: s.cityScope ?? null,
          type: s.type, baseType: s.baseType, rate: s.rate ?? null,
          brackets: (s.brackets ?? undefined) as object | undefined,
          allowance: s.allowance ?? null, variantKey: s.variantKey ?? null, year, sourceUrl: src,
        })),
      });
      inserted += td.surcharges.length;
    }
    if (td.fixedAmounts.length > 0 && (await prisma.fixedAmount.count({ where: { countryId: cId, year } })) === 0) {
      await prisma.fixedAmount.createMany({
        data: td.fixedAmounts.map((f) => ({
          countryId: cId, regionId: toRegionId(f.regionId), type: f.type,
          amount: f.amount, period: f.period, year, sourceUrl: src,
        })),
      });
      inserted += td.fixedAmounts.length;
    }
  }

  console.log(`\n✅ Tax-data seed complete. Inserted ${inserted} new rows (existing rows left untouched).`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
