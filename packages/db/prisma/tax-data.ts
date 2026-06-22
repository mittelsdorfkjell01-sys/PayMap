import { PrismaClient } from '@prisma/client';
import { getDefaultTaxData, type TaxData } from '@paymap/tax-engine';

/**
 * Runtime loader that builds the engine's `TaxData` for a country/year from the
 * database — the admin-editable, year-versioned tax tables (TaxBracket,
 * SocialContribution, Deduction, Surcharge, FixedAmount + Region). This is the
 * "single source of truth = DB" path: every non-computed value (rates,
 * thresholds, allowances, surcharges, fixed amounts) comes from the DB and can
 * be changed there without a code release. The engine's algorithms (DE §32a,
 * splitting, CH effective rate, …) stay in code.
 *
 * National vs. regional separation is intrinsic to the keying: tax rows are
 * keyed by `countryId` (national) with an optional `regionId` (sub-national
 * scales). Cities never store tax — Porto and Lisbon both resolve to country
 * `pt`, so there is no per-city tax redundancy. City-level values (cost of
 * living) live in `CostOfLivingItem` and are loaded separately.
 *
 * Safe fallback to the canonical seed dataset (`getDefaultTaxData`) when:
 *   - the `USE_DB_TAX_DATA` kill-switch is set to "false", or
 *   - the country / its tables are absent (e.g. migration not yet deployed or
 *     not seeded for this country), or
 *   - any DB error occurs (transient, or columns missing in this environment).
 * So enabling it is non-breaking even before prod is migrated/reseeded.
 *
 * Region ids stored on rows are translated to region *slugs*, which is what the
 * engine matches against `opts.region`.
 */
export function dbTaxDataEnabled(): boolean {
  return process.env.USE_DB_TAX_DATA !== 'false';
}

let sharedClient: PrismaClient | undefined;
function client(injected?: PrismaClient): PrismaClient {
  if (injected) return injected;
  if (!sharedClient) sharedClient = new PrismaClient();
  return sharedClient;
}

export async function loadTaxData(
  countrySlug: string,
  year: number,
  prismaClient?: PrismaClient,
): Promise<TaxData> {
  if (!dbTaxDataEnabled()) return getDefaultTaxData(countrySlug, year);

  const prisma = client(prismaClient);
  try {
    // Fetch ALL years, then resolve the effective year in code. The canonical
    // dataset mixes data years per country (DE 2026, PT 2025, …) and
    // getDefaultTaxData ignores the requested year, so a strict `where: { year }`
    // filter would return nothing — and silently fall back to canonical —
    // whenever the caller's year differs from the seeded year. We instead pick
    // the most recent available year ≤ requested (else the latest overall), so
    // the DB stays the real source regardless of the mixed-year reality.
    const country = await prisma.country.findUnique({
      where: { slug: countrySlug },
      include: {
        regions: { select: { id: true, slug: true } },
        taxBrackets: true,
        socialContribs: true,
        deductions: true,
        surcharges: true,
        fixedAmounts: true,
      },
    });

    if (!country || (country.taxBrackets.length === 0 && country.socialContribs.length === 0)) {
      return getDefaultTaxData(countrySlug, year);
    }

    const years = [
      ...country.taxBrackets.map((b) => b.year),
      ...country.socialContribs.map((s) => s.year),
    ];
    const atMost = years.filter((y) => y <= year);
    const effectiveYear = atMost.length > 0 ? Math.max(...atMost) : Math.max(...years);
    const ofYear = <T extends { year: number }>(rows: T[]) => rows.filter((r) => r.year === effectiveYear);

    const slugOf = new Map(country.regions.map((rg) => [rg.id, rg.slug]));
    const toRegionSlug = (id: string | null) => (id ? slugOf.get(id) ?? null : null);

    return {
      countryCode: countrySlug,
      year: effectiveYear,
      brackets: ofYear(country.taxBrackets).map((b) => ({
        from: b.fromAmount,
        to: b.toAmount ?? null,
        rate: b.rate,
        employmentType: b.employmentType || 'employed',
        filingStatus: b.filingStatus ?? null,
        regionId: toRegionSlug(b.regionId),
      })),
      social: ofYear(country.socialContribs).map((s) => ({
        type: s.type,
        rate: s.rate,
        ceiling: s.ceiling ?? null,
      })),
      deductions: ofYear(country.deductions).map((d) => ({
        type: d.type,
        amount: d.amount ?? null,
        percentage: d.percentage ?? null,
        condition: d.condition ?? null,
      })),
      surcharges: ofYear(country.surcharges).map((s) => ({
        type: s.type,
        baseType: s.baseType as 'income_tax' | 'taxable_income',
        regionId: toRegionSlug(s.regionId),
        cityScope: s.cityScope ?? null,
        rate: s.rate ?? null,
        brackets: (s.brackets as TaxData['surcharges'][number]['brackets']) ?? null,
        allowance: s.allowance ?? null,
        variantKey: s.variantKey ?? null,
      })),
      fixedAmounts: ofYear(country.fixedAmounts).map((f) => ({
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
