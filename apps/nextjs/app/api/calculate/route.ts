import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { calculate, evaluateEligibility, type EligibilityRule, type BreakdownCategory } from '@paymap/tax-engine';
import { findCity } from '@/lib/city-lookup';
import { loadTaxData } from '@/lib/tax-data';
import { prisma } from '@/lib/prisma';
import { flags } from '@/lib/feature-flags';
import { checkRateLimit } from '@/lib/rate-limit';
import { toEURStrict, fromEURStrict, areRatesStale } from '@/lib/exchange-rates';

const RequestSchema = z.object({
  fromCity: z.string().min(1),
  toCity: z.string().min(1),
  grossSalary: z.number().positive().max(9_999_999),
  // Precise inputs are mandatory — the approximate mode was removed. A missing
  // one yields a 400 (intentional; the UI must always send them).
  employment: z.enum(['employed', 'freelancer', 'founder', 'passive']),
  familyStatus: z.enum(['single', 'married', 'divorced']),
  children: z.number().int().min(0).max(20),
  kvType: z.enum(['statutory', 'private']).optional(),
  // DE PKV monthly premium (used as health contribution when kvType='private').
  privateKvPremium: z.number().nonnegative().max(100000).optional(),
  specialRegimeId: z.string().optional(),
  partnerGross: z.number().optional(),
  // DE church tax: levied only when churchMember; bundesland selects the rate
  // (8% in BY/BW, 9% elsewhere).
  churchMember: z.boolean().optional(),
  bundesland: z.string().optional(),
  // Year the user moves / first becomes tax-resident — feeds derived eligibility
  // rules (e.g. PT IFICI "from 2024", PL ulga "after 2021").
  moveYear: z.number().int().min(2000).max(2100).optional(),
  // Self-attested yes/no answers keyed by rule id (attested eligibility rules).
  attestations: z.record(z.boolean()).optional(),
  year: z.number().int().min(2020).max(2030).optional(),
  locale: z.enum(['de', 'en']).default('de'),
  persistShare: z.boolean().optional(),
});

type CalculateRequest = z.infer<typeof RequestSchema>;

// Category-aligned tax breakdown order (EUR/month), so the UI can render rows
// for the same concept on both sides regardless of country-specific labels.
const BREAKDOWN_ORDER: BreakdownCategory[] = [
  'income_tax',
  'surcharge',
  'church_tax',
  'social_health',
  'social_pension',
  'social_unemployment',
  'social_care',
];

// Only these regime effects actually change the salary net in the engine; for
// all others we never surface a (misleading) recomputed net.
const SALARY_EFFECT_REGIMES = new Set(['replaces_income_tax', 'reduces_taxable_base']);

export async function POST(req: NextRequest) {
  const limited = await checkRateLimit(req);
  if (limited) return limited;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    // The three precise fields are required; a missing/invalid input is a 400.
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  const year = data.year ?? new Date().getFullYear();

  // Resolve cities from DB
  const [fromCity, toCity] = await Promise.all([
    findCity(data.fromCity),
    findCity(data.toCity),
  ]);

  if (!fromCity) {
    return NextResponse.json({ error: 'fromCity not found', code: 'CITY_NOT_FOUND' }, { status: 404 });
  }
  if (!toCity) {
    return NextResponse.json({ error: 'toCity not found', code: 'CITY_NOT_FOUND' }, { status: 404 });
  }

  // --- Tax calculation (precise only) ---
  const fromCountry = fromCity.countrySlug;
  const toCountry = toCity.countrySlug;

  // The salary input is in EUR (see the "€ / Jahr" unit in the form). Tax
  // brackets in the engine are denominated in each country's LOCAL currency
  // (e.g. Thailand's brackets are in THB), so we must convert the EUR input
  // into each city's currency before running the engine — otherwise 60.000 €
  // would be taxed as 60.000 THB. Refuse to compute on a missing rate rather
  // than emit a silent wrong value.
  const [fromGross, toGross] = await Promise.all([
    fromEURStrict(data.grossSalary, fromCity.currency),
    fromEURStrict(data.grossSalary, toCity.currency),
  ]);
  if (fromGross === null || toGross === null) {
    const missing = [
      fromGross === null ? fromCity.currency : null,
      toGross === null ? toCity.currency : null,
    ].filter(Boolean);
    return NextResponse.json(
      { error: `Exchange rate unavailable for ${missing.join(', ')}`, code: 'FX_RATE_UNAVAILABLE' },
      { status: 503 },
    );
  }

  // Tax tables (brackets, social, deductions, surcharges, fixed amounts) for
  // both countries, plus the sub-national region from each city. The city slug
  // doubles as the cityScope for municipal surcharges (NYC city tax, IT
  // addizionale comunale).
  const fromRegion = fromCity.regionSlug ?? undefined;
  const toRegion = toCity.regionSlug ?? undefined;
  const fromCityScope = fromCity.slug;
  const toCityScope = toCity.slug;
  const [fromTaxData, toTaxData] = await Promise.all([
    loadTaxData(fromCountry, year),
    loadTaxData(toCountry, year),
  ]);

  const opts = {
    employment: data.employment,
    familyStatus: data.familyStatus,
    children: data.children,
    kvType: data.kvType ?? 'statutory',
    privateKvPremium: data.privateKvPremium,
    year,
    specialRegimeId: data.specialRegimeId,
    partnerGross: data.partnerGross,
    churchMember: data.churchMember,
    bundesland: data.bundesland,
  } as const;

  const fromResult = calculate(fromCountry, { ...opts, gross: fromGross, currency: fromCity.currency, region: fromRegion, cityScope: fromCityScope }, fromTaxData);
  const toResult = calculate(toCountry, { ...opts, gross: toGross, currency: toCity.currency, region: toRegion, cityScope: toCityScope }, toTaxData);

  // Net figures live in each city's local currency; normalise to EUR before
  // comparing across currencies.
  const [fromNetMonthlyEUR, toNetMonthlyEUR] = await Promise.all([
    toEURStrict(fromResult.netMonthly, fromCity.currency),
    toEURStrict(toResult.netMonthly, toCity.currency),
  ]);
  const monthlyDifference = (toNetMonthlyEUR ?? 0) - (fromNetMonthlyEUR ?? 0);

  // EUR-per-local-unit factor for each city, used to express the per-category
  // (annual, local) breakdown amounts as EUR/month. Null when no FX rate.
  const [fromEurUnit, toEurUnit] = await Promise.all([
    toEURStrict(1, fromCity.currency),
    toEURStrict(1, toCity.currency),
  ]);
  const monthlyEUR = (annualLocal: number, unit: number | null): number | null =>
    unit === null ? null : Math.round((annualLocal * unit) / 12);

  // Category-aligned breakdown in EUR/month. A category present on only one side
  // gets a null on the other; rows absent on both sides are omitted.
  const fromByCat = new Map(fromResult.breakdown.map((l) => [l.category, l]));
  const toByCat = new Map(toResult.breakdown.map((l) => [l.category, l]));
  const taxBreakdown = BREAKDOWN_ORDER.flatMap((category) => {
    const f = fromByCat.get(category);
    const t = toByCat.get(category);
    if (!f && !t) return [];
    const fromEUR = f ? monthlyEUR(f.amount, fromEurUnit) : null;
    const toEUR = t ? monthlyEUR(t.amount, toEurUnit) : null;
    const line = t ?? f!;
    return [{
      category,
      labelDE: line.label,
      labelEN: line.labelEN,
      fromEUR,
      toEUR,
      diffEUR: (toEUR ?? 0) - (fromEUR ?? 0),
    }];
  });

  // Special regime for the to-country (most-recent validFrom wins when several).
  const toRegimeRow = await prisma.specialRegime.findFirst({
    where: { country: { slug: toCountry } },
    orderBy: { validFrom: 'desc' },
    select: {
      id: true, slug: true, nameDE: true, nameEN: true, conditionsDE: true, flatRate: true,
      eligibilityCriteria: true, regimeEffect: true, riskLevel: true,
      requiresLegalAdvice: true, sourceUrl: true,
    },
  });

  // Eligibility verdict (independent of whether the regime moves salary net).
  let eligibility: {
    regimeSlug: string;
    regimeNameDE: string;
    regimeNameEN: string;
    verdict: ReturnType<typeof evaluateEligibility>['verdict'];
    rules: ReturnType<typeof evaluateEligibility>['rules'];
    riskLevel: string;
    requiresLegalAdvice: boolean;
    regimeEffect: string | null;
    sourceUrl: string | null;
  } | null = null;

  if (toRegimeRow) {
    const rules = (toRegimeRow.eligibilityCriteria as unknown as EligibilityRule[] | null) ?? [];
    const verdictResult = evaluateEligibility(
      rules,
      {
        employment: data.employment,
        grossAnnualEUR: data.grossSalary,
        children: data.children,
        moveYear: data.moveYear,
      },
      data.attestations,
    );
    eligibility = {
      regimeSlug: toRegimeRow.slug,
      regimeNameDE: toRegimeRow.nameDE,
      regimeNameEN: toRegimeRow.nameEN,
      verdict: verdictResult.verdict,
      rules: verdictResult.rules,
      riskLevel: toRegimeRow.riskLevel,
      requiresLegalAdvice: toRegimeRow.requiresLegalAdvice,
      regimeEffect: toRegimeRow.regimeEffect,
      sourceUrl: toRegimeRow.sourceUrl,
    };
  }

  let taxWithRegime: {
    netMonthly: number;
    netMonthlyEUR: number | null;
    netAnnual: number;
    effectiveRate: number;
    regimeId: string;
    regimeSlug: string;
    regimeNameDE: string;
    regimeNameEN: string;
    conditionsDE: string | null;
    flatRate: number | null;
    savings: number;
    /** Whether the regime actually changes the liability vs. the normal tariff. */
    hasEffect: boolean;
  } | null = null;

  if (toRegimeRow) {
    const movesSalary = SALARY_EFFECT_REGIMES.has(toRegimeRow.regimeEffect ?? '');
    if (movesSalary) {
      try {
        const regimeCalc = calculate(toCountry, {
          ...opts,
          gross: toGross,
          currency: toCity.currency,
          specialRegimeId: toRegimeRow.slug,
          region: toRegion,
          cityScope: toCityScope,
        }, toTaxData);
        const regimeNetMonthlyEUR = await toEURStrict(regimeCalc.netMonthly, toCity.currency);
        taxWithRegime = {
          netMonthly: regimeCalc.netMonthly,
          netMonthlyEUR: regimeNetMonthlyEUR,
          netAnnual: regimeCalc.netAnnual,
          effectiveRate: regimeCalc.effectiveRate,
          regimeId: toRegimeRow.id,
          regimeSlug: toRegimeRow.slug,
          regimeNameDE: toRegimeRow.nameDE,
          regimeNameEN: toRegimeRow.nameEN,
          conditionsDE: toRegimeRow.conditionsDE,
          flatRate: toRegimeRow.flatRate,
          savings: Math.max(0, Math.round(regimeCalc.netAnnual - toResult.netAnnual)),
          hasEffect: Math.round(regimeCalc.netAnnual) !== Math.round(toResult.netAnnual),
        };
      } catch {
        // regime not implemented for this country — skip silently
      }
    } else {
      // Regime does not change a salary net (foreign-income-only, lump-sum, or a
      // partial bonus exemption). Surface its metadata, but never a recomputed
      // net that would mislead — the eligibility card carries the explanation.
      taxWithRegime = {
        netMonthly: toResult.netMonthly,
        netMonthlyEUR: toNetMonthlyEUR,
        netAnnual: toResult.netAnnual,
        effectiveRate: toResult.effectiveRate,
        regimeId: toRegimeRow.id,
        regimeSlug: toRegimeRow.slug,
        regimeNameDE: toRegimeRow.nameDE,
        regimeNameEN: toRegimeRow.nameEN,
        conditionsDE: toRegimeRow.conditionsDE,
        flatRate: toRegimeRow.flatRate,
        savings: 0,
        hasEffect: false,
      };
    }
  }

  // Cost-of-living indices per city; null when the city has no index_cost.
  const colFor = (city: typeof fromCity) => {
    const indexCost = city.costOfLiving['index_cost'];
    if (indexCost === undefined) return null;
    return { indexCost, indexRent: city.costOfLiving['index_rent'] ?? null };
  };
  const costOfLiving = { from: colFor(fromCity), to: colFor(toCity) };

  // Purchasing power: the to-net re-expressed at home (from) cost level.
  let purchasingPower: {
    fromNetEUR: number;
    toNetEUR: number;
    toNetInHomeCostEUR: number;
    diffEUR: number;
    ratio: number;
  } | null = null;
  if (
    costOfLiving.from &&
    costOfLiving.to &&
    costOfLiving.to.indexCost > 0 &&
    fromNetMonthlyEUR !== null &&
    toNetMonthlyEUR !== null &&
    Math.round(fromNetMonthlyEUR) !== 0
  ) {
    const fromNetEUR = Math.round(fromNetMonthlyEUR);
    const toNetEUR = Math.round(toNetMonthlyEUR);
    const toNetInHomeCostEUR = Math.round(toNetMonthlyEUR * (costOfLiving.from.indexCost / costOfLiving.to.indexCost));
    purchasingPower = {
      fromNetEUR,
      toNetEUR,
      toNetInHomeCostEUR,
      diffEUR: toNetInHomeCostEUR - fromNetEUR,
      ratio: Math.round((toNetInHomeCostEUR / fromNetEUR) * 100) / 100,
    };
  }

  // Equivalence salary: what gross in fromCity gives the same net as toCity.
  // Result is expressed in fromCity's currency (matching how the UI formats it),
  // so the to-net must be converted into fromCity's currency first.
  const toNetAnnualEUR = await toEURStrict(toResult.netAnnual, toCity.currency);
  const toNetAnnualInFrom =
    toNetAnnualEUR === null ? null : await fromEURStrict(toNetAnnualEUR, fromCity.currency);
  const equivalenceSalary =
    fromResult.gross > 0 && fromResult.netAnnual > 0 && toNetAnnualInFrom !== null
      ? Math.round((toNetAnnualInFrom / fromResult.netAnnual) * fromResult.gross)
      : null;

  // Mark results that relied on FX conversion with a potentially stale rate.
  const involvesNonEUR = fromCity.currency !== 'EUR' || toCity.currency !== 'EUR';
  const fxStale = involvesNonEUR ? await areRatesStale() : false;

  // Data minimization: gated until privacy policy is live
  if (flags.enableSearchTracking) {
    trackSearch(fromCity.id, toCity.id, data.grossSalary).catch(() => {});
  }

  const shareToken = crypto.randomUUID();
  const responseBody = {
    isApproximate: false,
    fromCity: {
      id: fromCity.id,
      slug: fromCity.slug,
      nameDE: fromCity.nameDE,
      nameEN: fromCity.nameEN,
      flag: fromCity.flag,
      currency: fromCity.currency,
      countrySlug: fromCountry,
    },
    toCity: {
      id: toCity.id,
      slug: toCity.slug,
      nameDE: toCity.nameDE,
      nameEN: toCity.nameEN,
      flag: toCity.flag,
      currency: toCity.currency,
      countrySlug: toCountry,
    },
    from: { ...fromResult, netMonthlyEUR: fromNetMonthlyEUR },
    to: { ...toResult, netMonthlyEUR: toNetMonthlyEUR },
    monthlyDifference: Math.round(monthlyDifference),
    equivalenceSalary,
    taxBreakdown,
    costOfLiving,
    purchasingPower,
    eligibility,
    lifestyle: {
      from: fromCity.lifestyle,
      to: toCity.lifestyle,
    },
    taxWithRegime,
    fxStale,
    shareToken,
  };

  // Data minimization: gated until privacy policy is live.
  // persistShare = explicit user action → save regardless of flag.
  const shouldSave = flags.enableAnonymousCalculationSave || data.persistShare;
  if (shouldSave) {
    saveCalculation(fromCity.id, toCity.id, data, responseBody, false, shareToken, !!data.persistShare).catch(() => {});
  }

  return NextResponse.json(responseBody);
}

function grossRange(salary: number): string {
  if (salary < 40_000) return '0-40k';
  if (salary < 70_000) return '40-70k';
  if (salary < 100_000) return '70-100k';
  if (salary < 150_000) return '100-150k';
  return '150k+';
}

async function saveCalculation(
  fromCityId: string,
  toCityId: string,
  inputData: CalculateRequest,
  outputData: object,
  isApproximate: boolean,
  shareToken: string,
  isShared: boolean = false,
) {
  await prisma.calculation.create({
    data: {
      shareToken,
      fromCityId,
      toCityId,
      inputData,
      outputData,
      isApproximate,
      isShared,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });
}

async function trackSearch(fromCityId: string, toCityId: string, grossSalary: number) {
  await prisma.citySearch.create({
    data: {
      fromCityId,
      toCityId,
      grossRange: grossRange(grossSalary),
      source: 'direct',
    },
  });

  const periods = ['7d', '30d', '90d'] as const;
  await Promise.all(
    periods.map((period) =>
      prisma.citySearchAggregate.upsert({
        where: { fromCityId_toCityId_period: { fromCityId, toCityId, period } },
        update: { searchCount: { increment: 1 } },
        create: { fromCityId, toCityId, period, searchCount: 1 },
      }),
    ),
  );
}
