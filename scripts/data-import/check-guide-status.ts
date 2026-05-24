import { prisma } from './_lib/prisma';

const SECTIONS = ['bureaucracy', 'tax_planning', 'banking', 'insurance', 'housing', 'practical', 'social'];
const NON_EU = new Set(['zuerich', 'london', 'dubai', 'tbilisi', 'bangkok', 'chiang-mai', 'bali', 'singapur', 'kapstadt', 'mexico-city', 'buenos-aires', 'medellin', 'miami', 'new-york']);

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
          titleDE: true,
          titleEN: true,
          timingEN: true,
        },
      },
    },
    orderBy: { sortOrder: 'asc' },
  });

  const citiesWithGuides = cities.filter(c => c.movingGuides.length > 0);
  let totalSteps = 0;
  let totalHigh = 0;
  const issueList: string[] = [];

  console.log('\n─────────────────────────────────────────────────────────────────────');
  console.log(' PayMap Auswanderungs-Guide Status');
  console.log('─────────────────────────────────────────────────────────────────────');
  console.log(`${'Stadt'.padEnd(20)} ${'Steps'.padStart(5)} ${'Sektionen'.padStart(9)} ${'High-Risk'.padStart(9)} ${'Issues'}`);
  console.log('─────────────────────────────────────────────────────────────────────');

  for (const city of citiesWithGuides) {
    const steps = city.movingGuides;
    const stepCount = steps.length;
    const sections = new Set(steps.map(s => s.section));
    const sectionCount = SECTIONS.filter(s => sections.has(s)).length;
    const highSteps = steps.filter(s => s.riskLevel === 'high');
    const highPct = stepCount > 0 ? Math.round((highSteps.length / stepCount) * 100) : 0;

    totalSteps += stepCount;
    totalHigh += highSteps.length;

    const issues: string[] = [];
    if (stepCount < 25) issues.push(`<25 steps (${stepCount})`);
    if (sectionCount < 7) {
      const missing = SECTIONS.filter(s => !sections.has(s));
      issues.push(`missing: ${missing.join(', ')}`);
    }
    const highWithoutSource = highSteps.filter(s => !s.sourceUrl || !s.requiresLegalAdvice);
    if (highWithoutSource.length > 0) issues.push(`${highWithoutSource.length} high w/o source`);
    const missingEN = steps.filter(s => !s.titleEN || !s.timingEN);
    if (missingEN.length > 0) issues.push(`${missingEN.length} steps missing EN`);
    if (NON_EU.has(city.slug)) {
      const taxHigh = steps.filter(s => s.section === 'tax_planning' && s.riskLevel === 'high');
      if (taxHigh.length === 0) issues.push('non-EU: 0 high tax_planning');
    }

    const name = (city.nameDE ?? city.slug).slice(0, 18);
    const issueStr = issues.length > 0 ? `⚠  ${issues.join('; ')}` : '✓';
    console.log(`${name.padEnd(20)} ${String(stepCount).padStart(5)} ${`${sectionCount}/7`.padStart(9)} ${`${highPct}%`.padStart(9)}  ${issueStr}`);

    if (issues.length > 0) issueList.push(`${city.nameDE ?? city.slug}: ${issues.join('; ')}`);
  }

  console.log('─────────────────────────────────────────────────────────────────────');
  console.log(`${'TOTAL'.padEnd(20)} ${String(totalSteps).padStart(5)} ${`${citiesWithGuides.length} Städte`.padStart(9)} ${`${totalHigh} high`.padStart(9)}`);
  console.log('─────────────────────────────────────────────────────────────────────\n');

  if (issueList.length > 0) {
    console.log('⚠  Offene Probleme:');
    for (const issue of issueList) console.log(`   • ${issue}`);
    console.log('');
  } else {
    console.log('✓  Alle Guides erfüllen die Qualitäts-Anforderungen.\n');
  }

  console.log(`Zusammenfassung: ${citiesWithGuides.length} Städte mit Guide · ${totalSteps} Steps gesamt · ${cities.length - citiesWithGuides.length} Städte ohne Guide`);
  console.log('');

  await prisma.$disconnect();
}

main().catch(err => {
  console.error(String(err));
  prisma.$disconnect().catch(() => undefined);
  process.exit(1);
});
