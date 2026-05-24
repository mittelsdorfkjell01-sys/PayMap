import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { toEUR, fromEUR } from '@/lib/exchange-rates';
import { calculateApproximate } from '@paymap/tax-engine';
import { checkRateLimit } from '@/lib/rate-limit';
import { SCORE_CAT } from '@/lib/score-categories';
import { toEnSlug } from '@/lib/city-guide-slugs';

const REFERENCE_GROSS_EUR = 60_000;

const COUNT_CATEGORIES = new Set([
  'coworking_count',
  'hospital_count',
  'restaurant_count',
  'bar_count',
]);

const DISPLAY_COL_CATEGORIES = [
  'rent_outside_1br',
  'groceries_monthly',
  'transport_monthly',
  'utilities_monthly',
];

export interface CityDetailResponse {
  city: {
    id: string;
    slug: string;
    nameDE: string;
    nameEN: string;
    flag: string;
    currency: string;
    countrySlug: string;
    lat: number | null;
    lng: number | null;
  };
  finances: {
    specialRegimes: Array<{
      nameDE: string;
      nameEN: string;
      flatRate: number | null;
      conditionsDE: string | null;
    }>;
    salaryBenchmarkEUR: number | null;
    referenceNetMonthly: number;
    referenceEffectiveRate: number;
  };
  costOfLiving: {
    totalMonthlyEUR: number | null;
    items: Array<{ category: string; valueEUR: number; confidence: number }>;
  };
  safety: {
    scores: Record<string, number>;
    hospitalCount: number | null;
    consulates: Array<{ name: string; lat: number | null; lng: number | null; website: string | null }>;
  };
  climate: {
    sunshineDays: number;
    rainyDays: number;
    avgTempSummer: number;
    avgTempWinter: number;
    humidityIndex: number;
    weatherType: string;
    updatedAt: string;
  } | null;
  outdoor: {
    scores: Record<string, number>;
    coworkingCount: number | null;
  };
  social: {
    scores: Record<string, number>;
    restaurantCount: number | null;
    barCount: number | null;
    germanSchools: Array<{ name: string; lat: number | null; lng: number | null }>;
  };
  guidePreview: {
    steps: Array<{
      titleDE: string;
      titleEN: string;
      subtitleDE: string | null;
      subtitleEN: string | null;
      timingDE: string;
      timingEN: string;
      riskLevel: string;
      requiresLegalAdvice: boolean;
    }>;
    linkDE: string;
    linkEN: string;
  } | null;
}

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  const limited = checkRateLimit(req);
  if (limited) return limited;

  const { slug } = params;

  const city = await prisma.city.findFirst({
    where: { slug, isActive: true },
    include: {
      country: {
        select: {
          id: true,
          slug: true,
          nameDE: true,
          nameEN: true,
          specialRegimes: {
            select: { id: true, nameDE: true, nameEN: true, conditionsDE: true, flatRate: true },
          },
          countrySalaryBenchmarks: {
            select: { year: true, grossMedian: true, currency: true },
            orderBy: { year: 'desc' },
            take: 1,
          },
        },
      },
      weather: true,
      lifestyle: true,
      pois: true,
      costItems: {
        where: { confidence: { gte: 30 } },
        orderBy: { periodStart: 'desc' },
      },
      movingGuides: {
        where: { isActive: true },
        orderBy: { stepOrder: 'asc' },
        take: 20,
        select: {
          titleDE: true, titleEN: true,
          subtitleDE: true, subtitleEN: true,
          timingDE: true, timingEN: true,
          riskLevel: true, requiresLegalAdvice: true,
        },
      },
    },
  });

  if (!city) {
    return NextResponse.json({ error: 'City not found' }, { status: 404 });
  }

  const countrySlug = city.country?.slug ?? 'de';
  const currency = city.currency ?? 'EUR';
  const year = new Date().getFullYear();

  // Dedup CoL items — take latest per category
  const colByCategory = new Map<string, typeof city.costItems[0]>();
  for (const item of city.costItems) {
    if (!colByCategory.has(item.category)) colByCategory.set(item.category, item);
  }

  const colItemsEUR = await Promise.all(
    Array.from(colByCategory.values()).map(async (item) => ({
      category: item.category,
      valueEUR: Math.round(await toEUR(item.value, item.currency)),
      confidence: item.confidence,
    })),
  );

  const totalItem = colItemsEUR.find((i) => i.category === 'total_monthly_estimate');
  const displayItems = colItemsEUR.filter((i) => DISPLAY_COL_CATEGORIES.includes(i.category));

  // Salary benchmark
  const benchmark = city.country?.countrySalaryBenchmarks?.[0];
  let salaryBenchmarkEUR: number | null = null;
  if (benchmark) {
    salaryBenchmarkEUR = Math.round(await toEUR(benchmark.grossMedian, benchmark.currency));
  }

  // Reference tax at 60k EUR
  let referenceNetMonthly = 0;
  let referenceEffectiveRate = 0;
  try {
    const grossLocal = await fromEUR(REFERENCE_GROSS_EUR, currency);
    const ref = calculateApproximate(countrySlug, grossLocal, currency, year, 'de');
    const refNetEUR = await toEUR(ref.netMonthly, currency);
    referenceNetMonthly = Math.round(refNetEUR);
    referenceEffectiveRate = ref.effectiveRate;
  } catch {
    // unknown country module — leave as zero
  }

  // Lifestyle — split counts vs scores
  const lifestyleMap: Record<string, number> = {};
  for (const l of city.lifestyle) lifestyleMap[l.category] = l.score;

  const safetyScoreKeys = [
    SCORE_CAT.CRIME_INDEX,
    SCORE_CAT.POLITICAL_STABILITY,
    SCORE_CAT.POLITICAL_FREEDOM,
    SCORE_CAT.NATURKATASTROPHEN,
  ];
  const outdoorScoreKeys = [
    SCORE_CAT.HEALTHCARE_QUALITY,
    SCORE_CAT.AIR_QUALITY_PM25,
    SCORE_CAT.WATER_DRINKABLE,
  ];
  const socialScoreKeys = [
    SCORE_CAT.ENGLISH_PROFICIENCY,
    SCORE_CAT.LGBTQ_ACCEPTANCE,
    SCORE_CAT.INTERNET_SPEED_COMBINED,
    SCORE_CAT.DIRECT_FLIGHT_DE,
  ];

  const safetyScores: Record<string, number> = {};
  for (const k of safetyScoreKeys) if (lifestyleMap[k] !== undefined) safetyScores[k] = lifestyleMap[k];

  const outdoorScores: Record<string, number> = {};
  for (const k of outdoorScoreKeys) if (lifestyleMap[k] !== undefined) outdoorScores[k] = lifestyleMap[k];

  const socialScores: Record<string, number> = {};
  for (const k of socialScoreKeys) if (lifestyleMap[k] !== undefined) socialScores[k] = lifestyleMap[k];

  // POIs by type
  const consulates = city.pois
    .filter((p) => p.type.includes('consulate') || p.type.includes('embassy'))
    .map((p) => ({ name: p.name, lat: p.lat, lng: p.lng, website: p.website ?? null }));

  const germanSchools = city.pois
    .filter((p) => p.type.includes('school'))
    .map((p) => ({ name: p.name, lat: p.lat, lng: p.lng }));

  // Guide preview — prioritise high-risk steps, then medium, then low
  const RISK_ORDER: Record<string, number> = { high: 0, medium: 1, low: 2 };
  const topSteps = [...city.movingGuides]
    .sort((a, b) => (RISK_ORDER[a.riskLevel] ?? 2) - (RISK_ORDER[b.riskLevel] ?? 2))
    .slice(0, 4);

  const guidePreview = topSteps.length > 0
    ? {
        steps: topSteps.map((s) => ({
          titleDE: s.titleDE,
          titleEN: s.titleEN ?? s.titleDE,
          subtitleDE: s.subtitleDE ?? null,
          subtitleEN: s.subtitleEN ?? null,
          timingDE: s.timingDE,
          timingEN: s.timingEN ?? s.timingDE,
          riskLevel: s.riskLevel,
          requiresLegalAdvice: s.requiresLegalAdvice,
        })),
        linkDE: `/de/auswandern/${city.slug}`,
        linkEN: `/en/emigrate/${toEnSlug(city.slug)}`,
      }
    : null;

  const response: CityDetailResponse = {
    city: {
      id: city.id,
      slug: city.slug,
      nameDE: city.nameDE ?? city.slug,
      nameEN: city.nameEN ?? city.slug,
      flag: city.flag,
      currency,
      countrySlug,
      lat: city.lat ?? null,
      lng: city.lng ?? null,
    },
    finances: {
      specialRegimes: (city.country?.specialRegimes ?? []).map((r) => ({
        nameDE: r.nameDE,
        nameEN: r.nameEN,
        flatRate: r.flatRate ?? null,
        conditionsDE: r.conditionsDE ?? null,
      })),
      salaryBenchmarkEUR,
      referenceNetMonthly,
      referenceEffectiveRate,
    },
    costOfLiving: {
      totalMonthlyEUR: totalItem?.valueEUR ?? null,
      items: displayItems,
    },
    safety: {
      scores: safetyScores,
      hospitalCount: lifestyleMap['hospital_count'] ?? null,
      consulates,
    },
    climate: city.weather
      ? {
          sunshineDays: city.weather.sunshineDays,
          rainyDays: city.weather.rainyDays,
          avgTempSummer: city.weather.avgTempSummer,
          avgTempWinter: city.weather.avgTempWinter,
          humidityIndex: city.weather.humidityIndex,
          weatherType: city.weather.weatherType,
          updatedAt: city.weather.updatedAt.toISOString(),
        }
      : null,
    outdoor: {
      scores: outdoorScores,
      coworkingCount: lifestyleMap['coworking_count'] ?? null,
    },
    social: {
      scores: socialScores,
      restaurantCount: lifestyleMap['restaurant_count'] ?? null,
      barCount: lifestyleMap['bar_count'] ?? null,
      germanSchools,
    },
    guidePreview,
  };

  return NextResponse.json(response);
}
