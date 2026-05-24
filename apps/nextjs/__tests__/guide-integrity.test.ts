import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import prisma from '@/lib/prisma';
import { GUIDE_SECTIONS } from '@/lib/guide-sections';

// Non-EU city slugs — no DBA with DE, or DBA cancelled (high tax complexity)
const NON_EU_CITY_SLUGS = new Set([
  'zuerich', 'london', 'dubai', 'tbilisi', 'bangkok', 'chiang-mai',
  'bali', 'singapur', 'kapstadt', 'mexico-city', 'buenos-aires',
  'medellin', 'miami', 'new-york',
]);

// Cities where the DBA is cancelled/non-existent — strict high-risk coverage required
// UAE DBA was cancelled 2021; USA has only a limited income tax treaty (no capital gains protection)
const NO_DBA_CITY_SLUGS = new Set([
  'dubai', 'miami', 'new-york',
]);

// ─── Types ────────────────────────────────────────────────────────────────────

type GuideStep = {
  id: string;
  section: string;
  riskLevel: string;
  requiresLegalAdvice: boolean;
  sourceUrl: string | null;
  sourceLabel: string | null;
  titleDE: string;
  titleEN: string | null;
  timingDE: string;
  timingEN: string | null;
};

type CityWithSteps = {
  slug: string;
  nameDE: string | null;
  steps: GuideStep[];
};

// ─── Suite ────────────────────────────────────────────────────────────────────

describe('Guide Data Integrity', () => {
  let cities: CityWithSteps[] = [];
  let dbAvailable = true;

  beforeAll(async () => {
    try {
      const raw = await prisma.city.findMany({
        where: { isActive: true },
        select: {
          slug: true,
          nameDE: true,
          movingGuides: {
            where: { isActive: true },
            select: {
              id: true,
              section: true,
              riskLevel: true,
              requiresLegalAdvice: true,
              sourceUrl: true,
              sourceLabel: true,
              titleDE: true,
              titleEN: true,
              timingDE: true,
              timingEN: true,
            },
          },
        },
        orderBy: { sortOrder: 'asc' },
      });
      cities = raw.map((c) => ({ slug: c.slug, nameDE: c.nameDE, steps: c.movingGuides }));
    } catch (err) {
      console.warn('[guide-integrity] DB unavailable, skipping tests:', (err as Error).message);
      dbAvailable = false;
    }
  });

  afterAll(async () => {
    if (dbAvailable) await prisma.$disconnect();
  });

  // ── Prerequisite ──────────────────────────────────────────────────────────

  it('database is reachable', () => {
    expect(dbAvailable, 'Set DATABASE_URL to run guide integrity tests').toBe(true);
  });

  it('at least 25 active cities exist', () => {
    if (!dbAvailable) return;
    expect(cities.length).toBeGreaterThanOrEqual(25);
  });

  // ── Section coverage ──────────────────────────────────────────────────────

  it('each city with a guide covers all 7 sections', () => {
    if (!dbAvailable) return;
    const failures: string[] = [];

    for (const city of cities) {
      if (city.steps.length === 0) continue;
      const present = new Set(city.steps.map((s) => s.section));
      const missing = GUIDE_SECTIONS.filter((s) => !present.has(s));
      if (missing.length > 0) {
        failures.push(`  ${city.nameDE ?? city.slug}: missing sections [${missing.join(', ')}]`);
      }
    }

    expect(failures, `\nSection coverage failures:\n${failures.join('\n')}`).toHaveLength(0);
  });

  it('each city with a guide has at least 25 steps', () => {
    if (!dbAvailable) return;
    const failures: string[] = [];

    for (const city of cities) {
      if (city.steps.length === 0) continue;
      if (city.steps.length < 25) {
        failures.push(`  ${city.nameDE ?? city.slug}: ${city.steps.length} steps (min 25)`);
      }
    }

    expect(failures, `\nStep count failures:\n${failures.join('\n')}`).toHaveLength(0);
  });

  // ── High-risk source requirements ─────────────────────────────────────────

  it('all high-risk steps have sourceUrl and sourceLabel', () => {
    if (!dbAvailable) return;
    const failures: string[] = [];

    for (const city of cities) {
      for (const step of city.steps) {
        if (step.riskLevel !== 'high') continue;
        if (!step.sourceUrl || !step.sourceLabel) {
          failures.push(
            `  ${city.nameDE ?? city.slug} — "${step.titleDE}": ` +
            `sourceUrl=${!!step.sourceUrl} sourceLabel=${!!step.sourceLabel}`,
          );
        }
      }
    }

    expect(failures, `\nMissing sources on high-risk steps:\n${failures.join('\n')}`).toHaveLength(0);
  });

  it('all high-risk steps have requiresLegalAdvice: true', () => {
    if (!dbAvailable) return;
    const failures: string[] = [];

    for (const city of cities) {
      for (const step of city.steps) {
        if (step.riskLevel === 'high' && !step.requiresLegalAdvice) {
          failures.push(`  ${city.nameDE ?? city.slug} — "${step.titleDE}"`);
        }
      }
    }

    expect(
      failures,
      `\nHigh-risk steps missing requiresLegalAdvice:\n${failures.join('\n')}`,
    ).toHaveLength(0);
  });

  // ── Language completeness ─────────────────────────────────────────────────

  it('all steps have both DE and EN title and timing', () => {
    if (!dbAvailable) return;
    const failures: string[] = [];

    for (const city of cities) {
      for (const step of city.steps) {
        const missingEN = !step.titleEN || !step.timingEN;
        if (missingEN) {
          failures.push(
            `  ${city.nameDE ?? city.slug} — "${step.titleDE}": ` +
            `titleEN=${!!step.titleEN} timingEN=${!!step.timingEN}`,
          );
        }
      }
    }

    expect(failures, `\nMissing EN content:\n${failures.join('\n')}`).toHaveLength(0);
  });

  // ── Non-EU risk classification ────────────────────────────────────────────

  it('non-EU cities: at least 1 high-risk tax_planning step exists', () => {
    if (!dbAvailable) return;
    const failures: string[] = [];

    for (const city of cities) {
      if (!NON_EU_CITY_SLUGS.has(city.slug)) continue;
      const taxSteps = city.steps.filter((s) => s.section === 'tax_planning');
      if (taxSteps.length === 0) continue;
      const hasHighRisk = taxSteps.some((s) => s.riskLevel === 'high');
      if (!hasHighRisk) {
        failures.push(`  ${city.nameDE ?? city.slug}: no high-risk tax_planning step found`);
      }
    }

    expect(
      failures,
      `\nNon-EU cities missing a high-risk tax_planning step:\n${failures.join('\n')}`,
    ).toHaveLength(0);
  });

  it('cities without DBA: at least half of tax_planning steps are high risk', () => {
    if (!dbAvailable) return;
    const failures: string[] = [];

    for (const city of cities) {
      if (!NO_DBA_CITY_SLUGS.has(city.slug)) continue;
      const taxSteps = city.steps.filter((s) => s.section === 'tax_planning');
      if (taxSteps.length === 0) continue;
      const highCount = taxSteps.filter((s) => s.riskLevel === 'high').length;
      const ratio = highCount / taxSteps.length;
      if (ratio < 0.5) {
        failures.push(
          `  ${city.nameDE ?? city.slug}: only ${highCount}/${taxSteps.length} tax_planning steps are high risk (need ≥ 50%)`,
        );
      }
    }

    expect(
      failures,
      `\nNo-DBA cities with insufficient high-risk coverage:\n${failures.join('\n')}`,
    ).toHaveLength(0);
  });
});
