import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { calculate, calculateApproximate } from '@paymap/tax-engine';
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
  // Optional — triggers precise mode
  employment: z.enum(['employed', 'freelancer', 'founder', 'passive']).optional(),
  familyStatus: z.enum(['single', 'married', 'divorced']).optional(),
  children: z.number().int().min(0).max(20).optional(),
  kvType: z.enum(['statutory', 'private']).optional(),
  // DE PKV monthly premium (used as health contribution when kvType='private').
  privateKvPremium: z.number().nonnegative().max(100000).optional(),
  specialRegimeId: z.string().optional(),
  partnerGross: z.number().optional(),
  // DE church tax: levied only when churchMember; bundesland selects the rate
  // (8% in BY/BW, 9% elsewhere).
  churchMember: z.boolean().optional(),
  bundesland: z.string().optional(),
  year: z.number().int().min(2020).max(2030).optional(),
  locale: z.enum(['de', 'en']).default('de'),
  persistShare: z.boolean().optional(),
});

type CalculateRequest = z.infer<typeof RequestSchema>;

function isPrecise(body: CalculateRequest): boolean {
  return !!(body.employment || body.familyStatus !== undefined || body.children !== undefined);
}

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
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
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

  const approximate = !isPrecise(data);

  // --- Tax calculation ---
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

  let fromResult, toResult;

  if (approximate) {
    fromResult = calculateApproximate(fromCountry, fromGross, fromCity.currency, year, data.locale, fromTaxData, fromRegion, fromCityScope);
    toResult = calculateApproximate(toCountry, toGross, toCity.currency, year, data.locale, toTaxData, toRegion, toCityScope);
  } else {
    const opts = {
      employment: data.employment ?? 'employed',
      familyStatus: data.familyStatus ?? 'single',
      children: data.children ?? 0,
      kvType: data.kvType ?? 'statutory',
      privateKvPremium: data.privateKvPremium,
      year,
      specialRegimeId: data.specialRegimeId,
      partnerGross: data.partnerGross,
      churchMember: data.churchMember,
      bundesland: data.bundesland,
    } as const;

    fromResult = calculate(fromCountry, { ...opts, gross: fromGross, currency: fromCity.currency, region: fromRegion, cityScope: fromCityScope }, fromTaxData);
    toResult = calculate(toCountry, { ...opts, gross: toGross, currency: toCity.currency, region: toRegion, cityScope: toCityScope }, toTaxData);
  }

  // Net figures live in each city's local currency; normalise to EUR before
  // comparing across currencies.
  const [fromNetMonthlyEUR, toNetMonthlyEUR] = await Promise.all([
    toEURStrict(fromResult.netMonthly, fromCity.currency),
    toEURStrict(toResult.netMonthly, toCity.currency),
  ]);
  const monthlyDifference = (toNetMonthlyEUR ?? 0) - (fromNetMonthlyEUR ?? 0);

  // Special regime for to-country (kick off in parallel with sync work above)
  const toRegimeRow = await prisma.specialRegime.findFirst({
    where: { country: { slug: toCountry } },
    select: { id: true, slug: true, nameDE: true, nameEN: true, conditionsDE: true, flatRate: true },
  });

  let taxWithRegime: {
    netMonthly: number;
    netAnnual: number;
    effectiveRate: number;
    regimeId: string;
    regimeSlug: string;
    regimeNameDE: string;
    regimeNameEN: string;
    conditionsDE: string | null;
    flatRate: number | null;
    savings: number;
  } | null = null;

  if (toRegimeRow) {
    try {
      const regimeCalc = calculate(toCountry, {
        gross: toGross,
        currency: toCity.currency,
        employment: data.employment ?? 'employed',
        familyStatus: data.familyStatus ?? 'single',
        children: data.children ?? 0,
        kvType: data.kvType ?? 'statutory',
        year,
        specialRegimeId: toRegimeRow.slug,
        region: toRegion,
        cityScope: toCityScope,
      }, toTaxData);
      taxWithRegime = {
        netMonthly: regimeCalc.netMonthly,
        netAnnual: regimeCalc.netAnnual,
        effectiveRate: regimeCalc.effectiveRate,
        regimeId: toRegimeRow.id,
        regimeSlug: toRegimeRow.slug,
        regimeNameDE: toRegimeRow.nameDE,
        regimeNameEN: toRegimeRow.nameEN,
        conditionsDE: toRegimeRow.conditionsDE,
        flatRate: toRegimeRow.flatRate,
        savings: Math.max(0, Math.round(regimeCalc.netAnnual - toResult.netAnnual)),
      };
    } catch {
      // regime not implemented for this country — skip silently
    }
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
    isApproximate: approximate,
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
    from: fromResult,
    to: toResult,
    monthlyDifference: Math.round(monthlyDifference),
    equivalenceSalary,
    costOfLiving: {
      from: null,
      to: null,
    },
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
    saveCalculation(fromCity.id, toCity.id, data, responseBody, approximate, shareToken, !!data.persistShare).catch(() => {});
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
