import { prisma } from './prisma';
import { CityData } from './city-lookup';

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

  return fetchCitiesByIds(combined.slice(0, limit));
}
