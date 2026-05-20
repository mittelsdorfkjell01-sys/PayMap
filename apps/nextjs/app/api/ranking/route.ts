import { NextRequest, NextResponse } from 'next/server';
import { calculateApproximate } from '@paymap/tax-engine';
import { findCity } from '@/lib/city-lookup';
import { prisma } from '@/lib/prisma';
import { toEUR, fromEUR } from '@/lib/exchange-rates';

export const dynamic = 'force-dynamic';

export interface RankingRow {
  rank: number;
  city: {
    id: string;
    slug: string;
    nameDE: string;
    nameEN: string;
    flag: string;
    currency: string;
    countrySlug: string;
  };
  netMonthlyEUR: number;
  colMonthlyEUR: number;
  surplusEUR: number;
  purchasingPowerDelta: number;
  purchasingPowerScore: number;
  safety: number;
  climate: number;
  outdoor: number;
  gastro: number;
  social: number;
  score: number;
  col: { rent: number; food: number; transport: number } | null;
  effectiveRate: number;
  isHome: boolean;
}

export interface RankingResponse {
  homeCity: { id: string; slug: string; nameDE: string; nameEN: string; flag: string };
  homeSurplusEUR: number;
  homeNetMonthlyEUR: number;
  rows: RankingRow[];
}

function lifestyleMap(entries: { category: string; score: number }[]): Record<string, number> {
  const m: Record<string, number> = {};
  for (const e of entries) m[e.category] = e.score;
  return m;
}

function normalize(values: number[]): number[] {
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (max === min) return values.map(() => 50);
  return values.map((v) => Math.round(((v - min) / (max - min)) * 100));
}

export async function GET(req: NextRequest) {
  try {
  const from = req.nextUrl.searchParams.get('from') ?? '';
  const grossParam = req.nextUrl.searchParams.get('gross') ?? '';
  const gross = parseFloat(grossParam);
  const locale = (req.nextUrl.searchParams.get('locale') ?? 'de') as 'de' | 'en';

  if (!from || isNaN(gross) || gross <= 0) {
    return NextResponse.json({ error: 'from and gross params required' }, { status: 400 });
  }

  const homeCity = await findCity(from);
  if (!homeCity) {
    return NextResponse.json({ error: 'fromCity not found' }, { status: 404 });
  }

  const year = new Date().getFullYear();

  // Home calculation (gross is in EUR from user input)
  const homeGrossLocal = await fromEUR(gross, homeCity.currency);
  const homeResult = calculateApproximate(homeCity.countrySlug, homeGrossLocal, homeCity.currency, year, locale);
  const homeNetEUR = await toEUR(homeResult.netMonthly, homeCity.currency);
  const homeColEUR = homeCity.col ? homeCity.col.total : 0;
  const homeSurplusEUR = homeNetEUR - homeColEUR;

  // Load all active cities
  const cities = await prisma.city.findMany({
    where: { isActive: true },
    include: {
      country: { select: { slug: true } },
      col: { select: { rent: true, food: true, transport: true } },
      lifestyle: { select: { category: true, score: true } },
    },
    orderBy: { sortOrder: 'asc' },
  });

  // Calculate per city
  const rawRows: Array<{
    city: typeof cities[0];
    netMonthlyEUR: number;
    colMonthlyEUR: number;
    surplusEUR: number;
    purchasingPowerDelta: number;
    lifestyle: Record<string, number>;
    effectiveRate: number;
  }> = [];

  for (const city of cities) {
    const countrySlug = city.country?.slug ?? 'de';
    const currency = city.currency ?? 'EUR';
    const grossLocal = await fromEUR(gross, currency);

    let netMonthlyLocal = 0;
    let effectiveRate = 0;
    try {
      const result = calculateApproximate(countrySlug, grossLocal, currency, year, locale);
      netMonthlyLocal = result.netMonthly;
      effectiveRate = result.effectiveRate;
    } catch {
      // Unknown country module — skip with zero
    }

    const netMonthlyEUR = await toEUR(netMonthlyLocal, currency);
    const colMonthlyEUR = city.col ? city.col.rent + city.col.food + city.col.transport : 0;
    const surplusEUR = netMonthlyEUR - colMonthlyEUR;
    const purchasingPowerDelta = surplusEUR - homeSurplusEUR;

    rawRows.push({
      city,
      netMonthlyEUR: Math.round(netMonthlyEUR),
      colMonthlyEUR: Math.round(colMonthlyEUR),
      surplusEUR: Math.round(surplusEUR),
      purchasingPowerDelta: Math.round(purchasingPowerDelta),
      lifestyle: lifestyleMap(city.lifestyle),
      effectiveRate,
    });
  }

  // Normalize purchasing power to 0-100
  const ppNorm = normalize(rawRows.map((r) => r.purchasingPowerDelta));

  // Build rows with scores
  const rowsWithScore = rawRows.map((r, i) => {
    const ls = r.lifestyle;
    const safety = ls['safety_general'] ?? 50;
    const climate = ls['air_quality'] ?? 50;
    const outdoor = ls['outdoor'] ?? 50;
    const gastro = ls['gastro'] ?? 50;
    const social = ls['expat_community'] ?? 50;
    const ppScore = ppNorm[i];

    // Weighted score
    const score = Math.round(
      ppScore * 0.35 +
        safety * 0.15 +
        social * 0.20 +
        outdoor * 0.10 +
        gastro * 0.10 +
        climate * 0.10,
    );

    return {
      city: {
        id: r.city.id,
        slug: r.city.slug,
        nameDE: r.city.nameDE ?? r.city.slug,
        nameEN: r.city.nameEN ?? r.city.slug,
        flag: r.city.flag,
        currency: r.city.currency ?? 'EUR',
        countrySlug: r.city.country?.slug ?? 'de',
      },
      netMonthlyEUR: r.netMonthlyEUR,
      colMonthlyEUR: r.colMonthlyEUR,
      surplusEUR: r.surplusEUR,
      purchasingPowerDelta: r.purchasingPowerDelta,
      purchasingPowerScore: ppScore,
      safety,
      climate,
      outdoor,
      gastro,
      social,
      score,
      col: r.city.col,
      effectiveRate: r.effectiveRate,
      isHome: r.city.id === homeCity.id,
    };
  });

  // Default sort by score desc
  rowsWithScore.sort((a, b) => b.score - a.score);
  const ranked: RankingRow[] = rowsWithScore.map((r, i) => ({ rank: i + 1, ...r }));

  return NextResponse.json({
    homeCity: {
      id: homeCity.id,
      slug: homeCity.slug,
      nameDE: homeCity.nameDE,
      nameEN: homeCity.nameEN,
      flag: homeCity.flag,
    },
    homeSurplusEUR: Math.round(homeSurplusEUR),
    homeNetMonthlyEUR: Math.round(homeNetEUR),
    rows: ranked,
  } satisfies RankingResponse);
  } catch (err) {
    console.error('[ranking]', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
