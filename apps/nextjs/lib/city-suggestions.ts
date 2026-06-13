import { prisma } from './prisma';
import { CityData } from './city-lookup';

// Curated default destinations, used when no search-aggregate data is available
// (tracking is off by default, so the aggregates are empty in production). These
// are the typical emigration targets, ordered by popularity.
const POPULAR_DESTINATION_SLUGS = [
  'lissabon', 'barcelona', 'dubai', 'bangkok', 'amsterdam',
  'madrid', 'zuerich', 'valencia', 'singapur', 'tallinn', 'porto', 'wien',
];

function toCityData(city: {
  id: string; slug: string; nameDE: string | null; nameEN: string | null;
  flag: string; currency: string | null; lat: number | null; lng: number | null;
  country: { slug: string } | null; region: { slug: string } | null;
  lifestyle: { category: string; score: number }[];
}): CityData {
  const lifestyle: Record<string, number> = {};
  for (const l of city.lifestyle) lifestyle[l.category] = l.score;
  return {
    id: city.id,
    slug: city.slug,
    nameDE: city.nameDE ?? city.slug,
    nameEN: city.nameEN ?? city.slug,
    flag: city.flag,
    currency: city.currency ?? 'EUR',
    countrySlug: city.country?.slug ?? 'de',
    regionSlug: city.region?.slug ?? null,
    lat: city.lat,
    lng: city.lng,
    lifestyle,
    costOfLiving: {},
  };
}

/**
 * Static fallback: curated popular destinations (excluding the home city and
 * any already-selected ids), preserving the curated order.
 */
async function fetchFallbackCities(
  excludeIds: Set<string>,
  excludeCityId: string,
  limit: number,
): Promise<CityData[]> {
  const cities = await prisma.city.findMany({
    where: {
      isActive: true,
      slug: { in: POPULAR_DESTINATION_SLUGS },
      id: { notIn: [excludeCityId, ...Array.from(excludeIds)] },
    },
    include: {
      country: { select: { slug: true } },
      region: { select: { slug: true } },
      lifestyle: { select: { category: true, score: true } },
    },
  });
  // Preserve the curated POPULAR_DESTINATION_SLUGS order.
  return POPULAR_DESTINATION_SLUGS
    .map((slug) => cities.find((c) => c.slug === slug))
    .filter((c): c is NonNullable<typeof c> => !!c)
    .slice(0, limit)
    .map(toCityData);
}

async function fetchCitiesByIds(ids: string[]): Promise<CityData[]> {
  if (ids.length === 0) return [];
  const cities = await prisma.city.findMany({
    where: { id: { in: ids }, isActive: true },
    include: {
      country: { select: { slug: true } },
      region: { select: { slug: true } },
      lifestyle: { select: { category: true, score: true } },
    },
  });
  // Preserve order
  return ids.flatMap((id) => {
    const city = cities.find((c) => c.id === id);
    if (!city) return [];
    const lifestyle: Record<string, number> = {};
    for (const l of city.lifestyle) lifestyle[l.category] = l.score;
    return [{
      id: city.id,
      slug: city.slug,
      nameDE: city.nameDE ?? city.slug,
      nameEN: city.nameEN ?? city.slug,
      flag: city.flag,
      currency: city.currency ?? 'EUR',
      countrySlug: city.country?.slug ?? 'de',
      regionSlug: city.region?.slug ?? null,
      lat: city.lat,
      lng: city.lng,
      lifestyle,
      costOfLiving: {},
    } satisfies CityData];
  });
}

export async function getSuggestedCities(
  fromCityId: string,
  limit = 6,
): Promise<CityData[]> {
  const rows = await prisma.citySearchAggregate.findMany({
    where: { fromCityId, period: '30d', searchCount: { gt: 0 } },
    orderBy: { searchCount: 'desc' },
    take: limit,
    select: { toCityId: true },
  });

  if (rows.length >= limit) {
    return fetchCitiesByIds(rows.map((r) => r.toCityId));
  }

  // Fallback: top destinations overall (exclude same city)
  const existing = new Set(rows.map((r) => r.toCityId));
  const fallback = await prisma.citySearchAggregate.findMany({
    where: { period: '30d', searchCount: { gt: 0 }, toCityId: { not: fromCityId } },
    orderBy: { searchCount: 'desc' },
    take: limit * 3,
    select: { toCityId: true },
  });

  // Deduplicate toCityIds
  const seen = new Set<string>(existing);
  const combined: string[] = rows.map((r) => r.toCityId);
  for (const r of fallback) {
    if (!seen.has(r.toCityId)) {
      seen.add(r.toCityId);
      combined.push(r.toCityId);
    }
    if (combined.length >= limit) break;
  }

  const fromAggregates = await fetchCitiesByIds(combined.slice(0, limit));
  if (fromAggregates.length >= limit) return fromAggregates;

  // No (or too little) tracking data — top up with curated popular destinations.
  const haveIds = new Set(fromAggregates.map((c) => c.id));
  const staticFill = await fetchFallbackCities(haveIds, fromCityId, limit - fromAggregates.length);
  return [...fromAggregates, ...staticFill].slice(0, limit);
}
