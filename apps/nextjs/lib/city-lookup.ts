import { prisma } from './prisma';

export interface CityData {
  id: string;
  slug: string;
  nameDE: string;
  nameEN: string;
  flag: string;
  currency: string;
  countrySlug: string;
  /** Sub-national tax region slug (ES comunidad, US state, …); null = national. */
  regionSlug: string | null;
  lat: number | null;
  lng: number | null;
  lifestyle: Record<string, number>;
}

export async function findCity(query: string): Promise<CityData | null> {
  const q = query.trim().toLowerCase();
  if (!q) return null;

  const city = await prisma.city.findFirst({
    where: {
      isActive: true,
      OR: [
        { slug: { equals: q } },
        { nameDE: { equals: query, mode: 'insensitive' } },
        { nameEN: { equals: query, mode: 'insensitive' } },
      ],
    },
    include: {
      country: { select: { slug: true } },
      region: { select: { slug: true } },
      lifestyle: { select: { category: true, score: true } },
    },
  });

  if (!city) return null;

  const lifestyle: Record<string, number> = {};
  for (const l of city.lifestyle) {
    lifestyle[l.category] = l.score;
  }

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
  };
}

export async function searchCities(query: string, limit = 8): Promise<CityData[]> {
  const q = query.trim();
  if (!q) return [];

  const cities = await prisma.city.findMany({
    where: {
      isActive: true,
      OR: [
        { nameDE: { contains: q, mode: 'insensitive' } },
        { nameEN: { contains: q, mode: 'insensitive' } },
        { slug: { contains: q.toLowerCase() } },
      ],
    },
    take: limit,
    orderBy: { sortOrder: 'asc' },
    include: {
      country: { select: { slug: true } },
      lifestyle: { select: { category: true, score: true } },
    },
  });

  return cities.map((city) => {
    const lifestyle: Record<string, number> = {};
    for (const l of city.lifestyle) {
      lifestyle[l.category] = l.score;
    }
    return {
      id: city.id,
      slug: city.slug,
      nameDE: city.nameDE ?? city.slug,
      nameEN: city.nameEN ?? city.slug,
      flag: city.flag,
      currency: city.currency ?? 'EUR',
      countrySlug: city.country?.slug ?? 'de',
      regionSlug: null,
      lat: city.lat,
      lng: city.lng,
      lifestyle,
    };
  });
}
