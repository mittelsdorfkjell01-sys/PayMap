import { config } from 'dotenv';
import path from 'path';

// Load env from monorepo root
config({ path: path.resolve(process.cwd(), '../../.env.local') });
config({ path: path.resolve(process.cwd(), '../../.env') });

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const GUIDE_SECTIONS = [
  'bureaucracy', 'tax_planning', 'banking',
  'insurance', 'housing', 'practical', 'social',
] as const;

const COL_WIDTH = { name: 22, steps: 7, sections: 10, highPct: 10, issues: 20 };

function pad(s: string | number, w: number): string {
  return String(s).padEnd(w).slice(0, w);
}

async function main() {
  const cities = await prisma.city.findMany({
    where: { isActive: true },
    select: {
      slug: true,
      nameDE: true,
      movingGuides: {
        where: { isActive: true },
        select: {
          section: true,
          riskLevel: true,
          requiresLegalAdvice: true,
          sourceUrl: true,
          sourceLabel: true,
          titleDE: true,
          titleEN: true,
        },
      },
    },
    orderBy: { sortOrder: 'asc' },
  });

  const citiesWithGuide = cities.filter((c) => c.movingGuides.length > 0);

  console.log('\n=== PayMap Auswanderungs-Guide — Status Report ===\n');
  console.log(
    pad('Stadt', COL_WIDTH.name) +
    pad('Steps', COL_WIDTH.steps) +
    pad('Sektionen', COL_WIDTH.sections) +
    pad('High-Risk%', COL_WIDTH.highPct) +
    'Probleme',
  );
  console.log('─'.repeat(80));

  let totalSteps = 0;
  let totalHighWithSource = 0;
  let totalHighMissingSource = 0;
  let totalMissingEN = 0;
  const citiesBelow25: string[] = [];
  const citiesMissingSections: string[] = [];

  for (const city of citiesWithGuide) {
    const steps = city.movingGuides;
    const presentSections = new Set(steps.map((s) => s.section));
    const missingSections = GUIDE_SECTIONS.filter((s) => !presentSections.has(s));
    const highSteps = steps.filter((s) => s.riskLevel === 'high');
    const highWithSource = highSteps.filter((s) => s.sourceUrl && s.sourceLabel);
    const highMissingSource = highSteps.filter((s) => !s.sourceUrl || !s.sourceLabel);
    const missingEN = steps.filter((s) => !s.titleEN);
    const highPct = steps.length > 0 ? Math.round((highSteps.length / steps.length) * 100) : 0;

    const issues: string[] = [];
    if (steps.length < 25) { issues.push(`<25 Steps`); citiesBelow25.push(city.nameDE ?? city.slug); }
    if (missingSections.length > 0) { issues.push(`fehlt: ${missingSections.join(',')}`); citiesMissingSections.push(city.nameDE ?? city.slug); }
    if (highMissingSource.length > 0) issues.push(`${highMissingSource.length}× high ohne Quelle`);
    if (missingEN.length > 0) issues.push(`${missingEN.length}× EN fehlt`);

    const statusIcon = issues.length === 0 ? '✓' : '✗';

    console.log(
      `${statusIcon} ` +
      pad(city.nameDE ?? city.slug, COL_WIDTH.name - 2) + ' ' +
      pad(steps.length, COL_WIDTH.steps) +
      pad(`${presentSections.size}/7`, COL_WIDTH.sections) +
      pad(`${highPct}%`, COL_WIDTH.highPct) +
      (issues.length > 0 ? issues.join('; ') : '—'),
    );

    totalSteps += steps.length;
    totalHighWithSource += highWithSource.length;
    totalHighMissingSource += highMissingSource.length;
    totalMissingEN += missingEN.length;
  }

  console.log('─'.repeat(80));

  const allHighSteps = totalHighWithSource + totalHighMissingSource;
  const sourceCoverage = allHighSteps > 0
    ? Math.round((totalHighWithSource / allHighSteps) * 100)
    : 100;

  console.log(`\n=== Zusammenfassung ===`);
  console.log(`Städte mit Guide:      ${citiesWithGuide.length} / ${cities.length}`);
  console.log(`Guide-Steps gesamt:    ${totalSteps}`);
  console.log(`DE+EN Coverage:        ${totalMissingEN === 0 ? '100%' : `${totalMissingEN} Steps ohne EN`}`);
  console.log(`High-Risk mit Quelle:  ${totalHighWithSource} / ${allHighSteps} (${sourceCoverage}%)`);

  if (citiesBelow25.length > 0) {
    console.log(`\n⚠  Unter 25 Steps: ${citiesBelow25.join(', ')}`);
  }
  if (citiesMissingSections.length > 0) {
    console.log(`⚠  Fehlende Sektionen: ${citiesMissingSections.join(', ')}`);
  }
  if (totalHighMissingSource > 0) {
    console.log(`⚠  ${totalHighMissingSource} High-Risk-Steps ohne Quellen-URL — vor Deployment prüfen!`);
  }
  if (totalMissingEN > 0) {
    console.log(`⚠  ${totalMissingEN} Steps ohne englischen Titel`);
  }
  if (citiesBelow25.length === 0 && citiesMissingSections.length === 0 && totalHighMissingSource === 0 && totalMissingEN === 0) {
    console.log(`\n✓  Alle Integritätsprüfungen bestanden.`);
  }

  console.log();
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
