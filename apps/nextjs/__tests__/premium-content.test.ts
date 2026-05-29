import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import prisma from '@/lib/prisma';
import { PREMIUM_CITY_SLUGS } from '@/lib/premium-content';

// Bangkok and Dubai: tax content is high-risk only — no premium tax depth required
const BANGKOK_DUBAI_TAX_EXEMPT = new Set(['bangkok', 'dubai']);

const REQUIRED_NARRATIVE_SECTIONS = ['intro', 'for_freelancers', 'for_families'];

type PremiumCityRow = {
  id: string;
  slug: string;
  nameDE: string | null;
  districts: {
    id: string;
    nameDE: string;
    vibe: string | null;
    priceLevel: number;
    costOfLiving: { category: string; value: number }[];
  }[];
  narratives: {
    id: string;
    section: string;
    titleDE: string;
    titleEN: string;
    contentDE: string;
    contentEN: string;
    sourceUrls: string[];
  }[];
  tools: {
    id: string;
    toolType: string;
    isActive: boolean;
  }[];
  resources: {
    id: string;
    resourceType: string;
  }[];
  testimonials: {
    id: string;
    isVerified: boolean;
    contentDE: string;
    contentEN: string;
    yearMoved: number;
    authorName: string;
  }[];
};

describe('Premium Content Integrity', () => {
  let cities: PremiumCityRow[] = [];
  let dbAvailable = true;

  beforeAll(async () => {
    try {
      const raw = await prisma.city.findMany({
        where: { slug: { in: [...PREMIUM_CITY_SLUGS] }, isActive: true },
        select: {
          id: true,
          slug: true,
          nameDE: true,
          districts: {
            select: {
              id: true,
              nameDE: true,
              vibe: true,
              priceLevel: true,
              costOfLiving: { select: { category: true, value: true } },
            },
          },
          narratives: {
            select: {
              id: true,
              section: true,
              titleDE: true,
              titleEN: true,
              contentDE: true,
              contentEN: true,
              sourceUrls: true,
            },
          },
          tools: {
            where: { isActive: true },
            select: { id: true, toolType: true, isActive: true },
          },
          resources: {
            select: { id: true, resourceType: true },
          },
          testimonials: {
            select: {
              id: true,
              isVerified: true,
              contentDE: true,
              contentEN: true,
              yearMoved: true,
              authorName: true,
            },
          },
        },
      });
      cities = raw as PremiumCityRow[];
    } catch (err) {
      console.warn('[premium-content] DB unavailable, skipping tests:', (err as Error).message);
      dbAvailable = false;
    }
  });

  afterAll(async () => {
    if (dbAvailable) await prisma.$disconnect();
  });

  // ── Prerequisite ─────────────────────────────────────────────────────────────

  it('database is reachable', () => {
    expect(dbAvailable, 'Set DATABASE_URL to run premium content tests').toBe(true);
  });

  it('all 13 premium cities exist in DB', () => {
    if (!dbAvailable) return;
    const foundSlugs = new Set(cities.map((c) => c.slug));
    const missing = PREMIUM_CITY_SLUGS.filter((s) => !foundSlugs.has(s));
    expect(
      missing,
      `Missing premium cities in DB: [${missing.join(', ')}]`,
    ).toHaveLength(0);
    expect(cities.length).toBe(PREMIUM_CITY_SLUGS.length);
  });

  // ── Districts ─────────────────────────────────────────────────────────────────

  it('each premium city has at least 8 districts', () => {
    if (!dbAvailable) return;
    const failures: string[] = [];
    for (const city of cities) {
      if (city.districts.length < 8) {
        failures.push(`  ${city.nameDE ?? city.slug}: ${city.districts.length} districts (min 8)`);
      }
    }
    expect(failures, `\nDistrict count failures:\n${failures.join('\n')}`).toHaveLength(0);
  });

  it('each district has rent_1br_center cost-of-living data', () => {
    if (!dbAvailable) return;
    const failures: string[] = [];
    for (const city of cities) {
      for (const district of city.districts) {
        const hasRent = district.costOfLiving.some(
          (c) => c.category === 'rent_1br_center' && c.value > 0,
        );
        if (!hasRent) {
          failures.push(`  ${city.nameDE ?? city.slug} — ${district.nameDE}: missing rent_1br_center`);
        }
      }
    }
    expect(failures, `\nMissing rent data:\n${failures.join('\n')}`).toHaveLength(0);
  });

  it('all districts have a vibe and valid priceLevel (1–5)', () => {
    if (!dbAvailable) return;
    const failures: string[] = [];
    for (const city of cities) {
      for (const district of city.districts) {
        if (!district.vibe) {
          failures.push(`  ${city.nameDE ?? city.slug} — ${district.nameDE}: missing vibe`);
        }
        if (district.priceLevel < 1 || district.priceLevel > 5) {
          failures.push(`  ${city.nameDE ?? city.slug} — ${district.nameDE}: invalid priceLevel ${district.priceLevel}`);
        }
      }
    }
    expect(failures, `\nDistrict metadata failures:\n${failures.join('\n')}`).toHaveLength(0);
  });

  // ── Narratives ────────────────────────────────────────────────────────────────

  it('each premium city has at least 5 narratives', () => {
    if (!dbAvailable) return;
    const failures: string[] = [];
    for (const city of cities) {
      if (city.narratives.length < 5) {
        failures.push(`  ${city.nameDE ?? city.slug}: ${city.narratives.length} narratives (min 5)`);
      }
    }
    expect(failures, `\nNarrative count failures:\n${failures.join('\n')}`).toHaveLength(0);
  });

  it('each premium city covers required narrative sections', () => {
    if (!dbAvailable) return;
    const failures: string[] = [];
    for (const city of cities) {
      const present = new Set(city.narratives.map((n) => n.section));
      const missing = REQUIRED_NARRATIVE_SECTIONS.filter((s) => !present.has(s));
      if (missing.length > 0) {
        failures.push(`  ${city.nameDE ?? city.slug}: missing sections [${missing.join(', ')}]`);
      }
    }
    expect(failures, `\nNarrative section failures:\n${failures.join('\n')}`).toHaveLength(0);
  });

  it('all narratives have non-empty DE and EN content', () => {
    if (!dbAvailable) return;
    const failures: string[] = [];
    for (const city of cities) {
      for (const n of city.narratives) {
        if (!n.titleDE || !n.titleEN) {
          failures.push(`  ${city.nameDE ?? city.slug} [${n.section}]: missing title DE or EN`);
        }
        if (!n.contentDE || n.contentDE.length < 100) {
          failures.push(`  ${city.nameDE ?? city.slug} [${n.section}]: contentDE too short (<100 chars)`);
        }
        if (!n.contentEN || n.contentEN.length < 100) {
          failures.push(`  ${city.nameDE ?? city.slug} [${n.section}]: contentEN too short (<100 chars)`);
        }
      }
    }
    expect(failures, `\nNarrative content failures:\n${failures.join('\n')}`).toHaveLength(0);
  });

  // ── Tools ─────────────────────────────────────────────────────────────────────

  it('each premium city has at least 2 active tools', () => {
    if (!dbAvailable) return;
    const failures: string[] = [];
    for (const city of cities) {
      const activeCount = city.tools.filter((t) => t.isActive).length;
      if (activeCount < 2) {
        failures.push(`  ${city.nameDE ?? city.slug}: ${activeCount} active tools (min 2)`);
      }
    }
    expect(failures, `\nTool count failures:\n${failures.join('\n')}`).toHaveLength(0);
  });

  it('each premium city has a first_month_budget tool', () => {
    if (!dbAvailable) return;
    const failures: string[] = [];
    for (const city of cities) {
      const hasBudget = city.tools.some((t) => t.toolType === 'first_month_budget' && t.isActive);
      if (!hasBudget) {
        failures.push(`  ${city.nameDE ?? city.slug}: missing first_month_budget tool`);
      }
    }
    expect(failures, `\nMissing budget tool:\n${failures.join('\n')}`).toHaveLength(0);
  });

  // ── Resources ─────────────────────────────────────────────────────────────────

  it('each premium city has at least 5 resources', () => {
    if (!dbAvailable) return;
    const failures: string[] = [];
    for (const city of cities) {
      if (city.resources.length < 5) {
        failures.push(`  ${city.nameDE ?? city.slug}: ${city.resources.length} resources (min 5)`);
      }
    }
    expect(failures, `\nResource count failures:\n${failures.join('\n')}`).toHaveLength(0);
  });

  // ── Testimonials ──────────────────────────────────────────────────────────────

  it('each premium city has at least 3 testimonials', () => {
    if (!dbAvailable) return;
    const failures: string[] = [];
    for (const city of cities) {
      if (city.testimonials.length < 3) {
        failures.push(`  ${city.nameDE ?? city.slug}: ${city.testimonials.length} testimonials (min 3)`);
      }
    }
    expect(failures, `\nTestimonial count failures:\n${failures.join('\n')}`).toHaveLength(0);
  });

  it('all testimonials are marked isVerified: false (constructed personas)', () => {
    if (!dbAvailable) return;
    const failures: string[] = [];
    for (const city of cities) {
      for (const t of city.testimonials) {
        if (t.isVerified) {
          failures.push(`  ${city.nameDE ?? city.slug} — "${t.authorName}": isVerified should be false`);
        }
      }
    }
    expect(failures, `\nVerification flag failures:\n${failures.join('\n')}`).toHaveLength(0);
  });

  it('all testimonials have non-empty DE and EN content', () => {
    if (!dbAvailable) return;
    const failures: string[] = [];
    for (const city of cities) {
      for (const t of city.testimonials) {
        if (!t.contentDE || t.contentDE.length < 50) {
          failures.push(`  ${city.nameDE ?? city.slug} — "${t.authorName}": contentDE too short`);
        }
        if (!t.contentEN || t.contentEN.length < 50) {
          failures.push(`  ${city.nameDE ?? city.slug} — "${t.authorName}": contentEN too short`);
        }
      }
    }
    expect(failures, `\nTestimonial content failures:\n${failures.join('\n')}`).toHaveLength(0);
  });

  it('testimonial yearMoved is plausible (2015–2026)', () => {
    if (!dbAvailable) return;
    const failures: string[] = [];
    for (const city of cities) {
      for (const t of city.testimonials) {
        if (t.yearMoved < 2015 || t.yearMoved > 2026) {
          failures.push(`  ${city.nameDE ?? city.slug} — "${t.authorName}": yearMoved ${t.yearMoved} out of range`);
        }
      }
    }
    expect(failures, `\nYearMoved range failures:\n${failures.join('\n')}`).toHaveLength(0);
  });
});
