import { prisma } from './prisma';
import { getDefaultTaxData, type TaxData } from '@paymap/tax-engine';
import { flags } from './feature-flags';

/**
 * Builds the engine's `TaxData` for a country/year from the database
 * (admin-editable, year-versioned tables). Falls back to the engine's canonical
 * dataset when:
 *   - the `useDbTaxData` flag is off (default — e.g. before the tax-engine
 *     migration is deployed and the DB reseeded), or
 *   - the country / its tables are not present, or
 *   - any DB error occurs (e.g. new columns not yet migrated in this env).
 *
 * Region ids stored on bracket / surcharge / fixed-amount rows are translated
 * to region *slugs*, which is what the engine matches against `opts.region`.
 */
export async function loadTaxData(countrySlug: string, year: number): Promise<TaxData> {
  if (!flags.useDbTaxData) return getDefaultTaxData(countrySlug, year);

  try {
    const country = await prisma.country.findUnique({
      where: { slug: countrySlug },
      include: {
        regions: { select: { id: true, slug: true } },
        taxBrackets: { where: { year } },
        socialContribs: { where: { year } },
        deductions: { where: { year } },
        surcharges: { where: { year } },
        fixedAmounts: { where: { year } },
      },
    });

    if (!country || (country.taxBrackets.length === 0 && country.socialContribs.length === 0)) {
      return getDefaultTaxData(countrySlug, year);
    }

    const slugOf = new Map(country.regions.map((rg) => [rg.id, rg.slug]));
    const toRegionSlug = (id: string | null) => (id ? slugOf.get(id) ?? null : null);

    return {
      countryCode: countrySlug,
      year,
      brackets: country.taxBrackets.map((b) => ({
        from: b.fromAmount,
        to: b.toAmount ?? null,
        rate: b.rate,
        employmentType: b.employmentType || 'employed',
        filingStatus: b.filingStatus ?? null,
        regionId: toRegionSlug(b.regionId),
      })),
      social: country.socialContribs.map((s) => ({
        type: s.type,
        rate: s.rate,
        ceiling: s.ceiling ?? null,
      })),
      deductions: country.deductions.map((d) => ({
        type: d.type,
        amount: d.amount ?? null,
        percentage: d.percentage ?? null,
        condition: d.condition ?? null,
      })),
      surcharges: country.surcharges.map((s) => ({
        type: s.type,
        baseType: s.baseType as 'income_tax' | 'taxable_income',
        regionId: toRegionSlug(s.regionId),
        cityScope: s.cityScope ?? null,
        rate: s.rate ?? null,
        brackets: (s.brackets as TaxData['surcharges'][number]['brackets']) ?? null,
        allowance: s.allowance ?? null,
        variantKey: s.variantKey ?? null,
      })),
      fixedAmounts: country.fixedAmounts.map((f) => ({
        type: f.type,
        regionId: toRegionSlug(f.regionId),
        amount: f.amount,
        period: f.period as 'monthly' | 'yearly',
      })),
    };
  } catch {
    // Schema not migrated in this environment, or transient DB error.
    return getDefaultTaxData(countrySlug, year);
  }
}
