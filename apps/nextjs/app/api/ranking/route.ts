import { NextRequest, NextResponse } from 'next/server';
import { calculateApproximate } from '@paymap/tax-engine';
import { findCity } from '@/lib/city-lookup';
import { prisma } from '@/lib/prisma';
import { toEUR, fromEUR } from '@/lib/exchange-rates';
import { checkRateLimit } from '@/lib/rate-limit';
import { SCORE_CAT } from '@/lib/score-categories';
import {
  computeWeightedScore,
  normalizeWeights,
  normalizeToScale,
  parseWeightsParam,
} from '@/lib/ranking';
import {
  computeClusterScore,
  parseClusterWeightsFromParams,
  type ClusterWeights,
} from '@/lib/ranking-score';

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
  // Trends-page filter flags (country-level) + coarse region for the region filter.
  region: string;
  filters: {
    dbaGermany: boolean | null;
    euEea: boolean | null;
    nomadVisa: boolean | null;
  };
  scores: Record<string, number>;
  score: number;
  breakdown: Record<string, number>;
  usedFallback: boolean;
  missingCategories: string[];
  col: null;
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

// Coarse region per country slug, used by the Trends-page region filter.
const REGION_BY_COUNTRY: Record<string, string> = {
  de: 'Europa', at: 'Europa', ch: 'Europa', nl: 'Europa', pt: 'Europa', es: 'Europa',
  fr: 'Europa', it: 'Europa', ie: 'Europa', ee: 'Europa', pl: 'Europa', cz: 'Europa',
  hu: 'Europa', ro: 'Europa', gb: 'Europa', mt: 'Europa', ge: 'Europa',
  uae: 'Naher Osten',
  th: 'Asien', id: 'Asien', sg: 'Asien',
  us: 'Nordamerika',
  co: 'Lateinamerika', mx: 'Lateinamerika', ar: 'Lateinamerika',
  za: 'Afrika',
};

export async function GET(req: NextRequest) {
  const limited = await checkRateLimit(req);
  if (limited) return limited;

  try {
  const from         = req.nextUrl.searchParams.get('from') ?? '';
  const grossParam   = req.nextUrl.searchParams.get('gross') ?? '';
  const gross        = parseFloat(grossParam);
  const locale       = (req.nextUrl.searchParams.get('locale') ?? 'de') as 'de' | 'en';
  const weightsRaw   = req.nextUrl.searchParams.get('weights') ?? null;
  const normWeights  = normalizeWeights(parseWeightsParam(weightsRaw));
  const clusterWeights: ClusterWeights | null = parseClusterWeightsFromParams(req.nextUrl.searchParams);

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
  // homeColEUR resolved below after batch CoL load
  let homeSurplusEUR = homeNetEUR; // placeholder, updated after batch load

  // Load all active cities + batch CoL totals in parallel
  const [cities, allColItems] = await Promise.all([
    prisma.city.findMany({
      where: { isActive: true },
      include: {
        country: { select: { slug: true, dbaGermany: true, euEea: true, nomadVisa: true } },
        lifestyle: { select: { category: true, score: true } },
      },
      orderBy: { sortOrder: 'asc' },
    }),
    prisma.costOfLivingItem.findMany({
      where: { category: 'total_monthly_estimate' },
      orderBy: { periodStart: 'desc' },
      select: { cityId: true, value: true, currency: true },
    }),
  ]);

  // Map: cityId → latest CoL total item
  const colByCityId = new Map<string, { value: number; currency: string }>();
  for (const item of allColItems) {
    if (!colByCityId.has(item.cityId)) colByCityId.set(item.cityId, item);
  }

  // Home city CoL
  const homeColItem = colByCityId.get(homeCity.id);
  const homeColEUR = homeColItem ? await toEUR(homeColItem.value, homeColItem.currency) : 0;
  homeSurplusEUR = homeNetEUR - homeColEUR;

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
    const colItem = colByCityId.get(city.id);
    const colMonthlyEUR = colItem ? Math.round(await toEUR(colItem.value, colItem.currency)) : 0;
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

  // Normalize purchasing power delta and CoL to 0-100
  const ppNorm  = normalizeToScale(rawRows.map((r) => r.purchasingPowerDelta));
  const colNorm = normalizeToScale(rawRows.map((r) => -r.colMonthlyEUR)); // lower CoL → higher score

  // Build rows with scores
  const rowsWithScore = rawRows.map((r, i) => {
    const ls = r.lifestyle;

    // Legacy display fields (kept for frontend compatibility)
    const safety  = ls['safety_general']  ?? ls[SCORE_CAT.CRIME_INDEX]             ?? 50;
    const climate = ls['air_quality']     ?? ls[SCORE_CAT.AIR_QUALITY_PM25]         ?? 50;
    const outdoor = ls['outdoor']         ?? 50;
    const gastro  = ls['gastro']          ?? 50;
    const social  = ls['expat_community'] ?? ls[SCORE_CAT.ENGLISH_PROFICIENCY]      ?? 50;
    const ppScore = ppNorm[i];

    // Build merged scores map: DB lifestyle values + live-computed overrides
    const combinedScores: Record<string, number> = {
      ...ls,
      // Live-computed financial overrides (user's actual salary)
      [SCORE_CAT.TAX_BURDEN_SCORE]:       Math.max(0, Math.min(100, Math.round((1 - r.effectiveRate) * 100))),
      [SCORE_CAT.PURCHASING_POWER_SCORE]:  ppScore,
      // CoL: prefer pre-computed DB score, fall back to cross-city normalisation
      [SCORE_CAT.COST_OF_LIVING_SCORE]:    ls[SCORE_CAT.COST_OF_LIVING_SCORE] ?? colNorm[i],
    };

    const score   = computeWeightedScore(combinedScores, normWeights);
    const cluster = computeClusterScore(combinedScores, clusterWeights ?? undefined);

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
      region: REGION_BY_COUNTRY[r.city.country?.slug ?? ''] ?? 'Andere',
      filters: {
        dbaGermany: r.city.country?.dbaGermany ?? null,
        euEea:      r.city.country?.euEea ?? null,
        nomadVisa:  r.city.country?.nomadVisa ?? null,
      },
      scores: combinedScores,
      score,
      breakdown:         cluster.breakdown as Record<string, number>,
      usedFallback:      cluster.usedFallback,
      missingCategories: cluster.missingCategories,
      col: null,
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
