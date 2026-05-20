import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { calculate, calculateApproximate } from '@paymap/tax-engine';
import { findCity } from '@/lib/city-lookup';
import { prisma } from '@/lib/prisma';

const RequestSchema = z.object({
  fromCity: z.string().min(1),
  toCity: z.string().min(1),
  grossSalary: z.number().positive().max(9_999_999),
  // Optional — triggers precise mode
  employment: z.enum(['employed', 'freelancer', 'founder', 'passive']).optional(),
  familyStatus: z.enum(['single', 'married', 'divorced']).optional(),
  children: z.number().int().min(0).max(20).optional(),
  kvType: z.enum(['statutory', 'private']).optional(),
  specialRegimeId: z.string().optional(),
  partnerGross: z.number().optional(),
  year: z.number().int().min(2020).max(2030).optional(),
  locale: z.enum(['de', 'en']).default('de'),
});

type CalculateRequest = z.infer<typeof RequestSchema>;

function isPrecise(body: CalculateRequest): boolean {
  return !!(body.employment || body.familyStatus !== undefined || body.children !== undefined);
}

export async function POST(req: NextRequest) {
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

  let fromResult, toResult;

  if (approximate) {
    fromResult = calculateApproximate(fromCountry, data.grossSalary, fromCity.currency, year, data.locale);
    toResult = calculateApproximate(toCountry, data.grossSalary, toCity.currency, year, data.locale);
  } else {
    const opts = {
      gross: data.grossSalary,
      currency: fromCity.currency,
      employment: data.employment ?? 'employed',
      familyStatus: data.familyStatus ?? 'single',
      children: data.children ?? 0,
      kvType: data.kvType ?? 'statutory',
      year,
      specialRegimeId: data.specialRegimeId,
      partnerGross: data.partnerGross,
    } as const;

    fromResult = calculate(fromCountry, opts);
    toResult = calculate(toCountry, { ...opts, currency: toCity.currency });
  }

  // --- Cost of living comparison ---
  const fromCol = fromCity.col;
  const toCol = toCity.col;

  const monthlyDifference = toResult.netMonthly - fromResult.netMonthly;

  // Equivalence salary: what gross in fromCity gives same net as toCity
  const equivalenceSalary =
    fromResult.gross > 0 && fromResult.netAnnual > 0
      ? Math.round((toResult.netAnnual / fromResult.netAnnual) * fromResult.gross)
      : null;

  // --- Track CitySearch (fire-and-forget) ---
  trackSearch(fromCity.id, toCity.id, data.grossSalary).catch(() => {});

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
      from: fromCol,
      to: toCol,
    },
    lifestyle: {
      from: fromCity.lifestyle,
      to: toCity.lifestyle,
    },
    shareToken,
  };

  saveCalculation(fromCity.id, toCity.id, data, responseBody, approximate, shareToken).catch(() => {});

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
) {
  await prisma.calculation.create({
    data: {
      shareToken,
      fromCityId,
      toCityId,
      inputData,
      outputData,
      isApproximate,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
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
