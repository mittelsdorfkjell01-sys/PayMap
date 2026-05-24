import prisma from './prisma';
import { GUIDE_SECTIONS, SECTION_LABELS } from './guide-sections';

export type GuideStep = {
  id: string;
  stepOrder: number;
  phase: string;
  section: string;
  titleDE: string;
  titleEN: string;
  subtitleDE: string | null;
  subtitleEN: string | null;
  timingDE: string;
  timingEN: string;
  isWarning: boolean;
  infoBoxDE: string | null;
  infoBoxEN: string | null;
  infoBoxType: string | null;
  documents: Record<string, string>[];
  tags: string[];
  riskLevel: string;
  requiresLegalAdvice: boolean;
  sourceUrl: string | null;
  sourceLabel: string | null;
  lastVerified: Date | null;
  forEmployed: boolean;
  forFreelancer: boolean;
  forFounder: boolean;
  forFamily: boolean;
};

export type CityGuideData = {
  city: {
    slug: string;
    nameDE: string;
    nameEN: string;
    flag: string;
    country: { nameDE: string; nameEN: string; slug: string } | null;
  };
  sections: {
    key: string;
    labelDE: string;
    labelEN: string;
    steps: GuideStep[];
  }[];
  totalSteps: number;
  highRiskCount: number;
};

export async function getCityGuide(slug: string): Promise<CityGuideData | null> {
  const city = await prisma.city.findFirst({
    where: { slug, isActive: true },
    include: {
      country: { select: { nameDE: true, nameEN: true, slug: true } },
      movingGuides: {
        where: { isActive: true },
        orderBy: { stepOrder: 'asc' },
        select: {
          id: true, stepOrder: true, phase: true, section: true,
          titleDE: true, titleEN: true, subtitleDE: true, subtitleEN: true,
          timingDE: true, timingEN: true, isWarning: true,
          infoBoxDE: true, infoBoxEN: true, infoBoxType: true,
          documents: true, tags: true,
          riskLevel: true, requiresLegalAdvice: true,
          sourceUrl: true, sourceLabel: true, lastVerified: true,
          forEmployed: true, forFreelancer: true, forFounder: true, forFamily: true,
        },
      },
    },
  });

  if (!city) return null;

  const steps = city.movingGuides as unknown as GuideStep[];

  const sections = GUIDE_SECTIONS.map((key) => ({
    key,
    labelDE: SECTION_LABELS[key].de,
    labelEN: SECTION_LABELS[key].en,
    steps: steps.filter((s) => s.section === key),
  })).filter((s) => s.steps.length > 0);

  return {
    city: {
      slug: city.slug,
      nameDE: city.nameDE ?? city.slug,
      nameEN: city.nameEN ?? city.slug,
      flag: city.flag ?? '',
      country: city.country
        ? { nameDE: city.country.nameDE ?? '', nameEN: city.country.nameEN ?? '', slug: city.country.slug }
        : null,
    },
    sections,
    totalSteps: steps.length,
    highRiskCount: steps.filter((s) => s.riskLevel === 'high').length,
  };
}

export async function getAllCitySlugs(): Promise<string[]> {
  const cities = await prisma.city.findMany({
    where: { isActive: true },
    select: { slug: true },
    orderBy: { sortOrder: 'asc' },
  });
  return cities.map((c) => c.slug);
}
