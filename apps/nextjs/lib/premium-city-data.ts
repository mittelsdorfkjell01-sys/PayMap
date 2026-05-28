import prisma from './prisma';

export type DistrictWithCoL = {
  id: string;
  slug: string;
  nameDE: string;
  nameEN: string;
  descriptionDE: string | null;
  descriptionEN: string | null;
  latitude: number | null;
  longitude: number | null;
  vibe: string | null;
  priceLevel: number;
  sortOrder: number;
  costOfLiving: {
    category: string;
    value: number;
    currency: string;
  }[];
};

export type CityNarrativeData = {
  section: string;
  titleDE: string;
  titleEN: string;
  contentDE: string;
  contentEN: string;
  sourceUrls: string[];
  lastVerified: Date | null;
};

export type CityToolData = {
  toolType: string;
  nameDE: string;
  nameEN: string;
  descriptionDE: string;
  descriptionEN: string;
  config: Record<string, unknown>;
  isActive: boolean;
};

export type ResourceData = {
  id: string;
  resourceType: string;
  titleDE: string;
  titleEN: string;
  descriptionDE: string | null;
  descriptionEN: string | null;
  content: Record<string, unknown>;
};

export type TestimonialData = {
  id: string;
  authorName: string;
  authorAge: number | null;
  authorProfession: string | null;
  authorPersona: string | null;
  yearMoved: number;
  contentDE: string;
  contentEN: string;
  rating: number;
  isVerified: boolean;
};

export type PremiumCityData = {
  districts: DistrictWithCoL[];
  narratives: CityNarrativeData[];
  tools: CityToolData[];
  resources: ResourceData[];
  testimonials: TestimonialData[];
};

export async function getPremiumCityData(cityId: string): Promise<PremiumCityData | null> {
  const [districts, narratives, tools, resources, testimonials] = await Promise.all([
    prisma.district.findMany({
      where: { cityId },
      orderBy: { sortOrder: 'asc' },
      include: {
        costOfLiving: {
          select: { category: true, value: true, currency: true },
        },
      },
    }),
    prisma.cityNarrative.findMany({
      where: { cityId },
      orderBy: { sortOrder: 'asc' },
      select: {
        section: true, titleDE: true, titleEN: true,
        contentDE: true, contentEN: true,
        sourceUrls: true, lastVerified: true,
      },
    }),
    prisma.cityTool.findMany({
      where: { cityId, isActive: true },
      select: {
        toolType: true, nameDE: true, nameEN: true,
        descriptionDE: true, descriptionEN: true,
        config: true, isActive: true,
      },
    }),
    prisma.resource.findMany({
      where: { cityId },
      select: {
        id: true, resourceType: true, titleDE: true, titleEN: true,
        descriptionDE: true, descriptionEN: true, content: true,
      },
    }),
    prisma.testimonial.findMany({
      where: { cityId },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true, authorName: true, authorAge: true,
        authorProfession: true, authorPersona: true,
        yearMoved: true, contentDE: true, contentEN: true,
        rating: true, isVerified: true,
      },
    }),
  ]);

  if (districts.length === 0 && narratives.length === 0) return null;

  return {
    districts: districts as unknown as DistrictWithCoL[],
    narratives,
    tools: tools as unknown as CityToolData[],
    resources: resources as unknown as ResourceData[],
    testimonials,
  };
}

export async function getCityIdBySlug(slug: string): Promise<string | null> {
  const city = await prisma.city.findFirst({ where: { slug }, select: { id: true } });
  return city?.id ?? null;
}
