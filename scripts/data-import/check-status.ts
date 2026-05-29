import { prisma } from './_lib/prisma';
import { printSummary } from './_lib/logger';

const PREMIUM_CITY_SLUGS = [
  'lissabon', 'porto', 'madrid', 'barcelona', 'rom',
  'amsterdam', 'wien', 'paris', 'prag', 'budapest',
  'zuerich', 'dubai', 'bangkok',
] as const;

const SCORE_CATEGORIES = [
  'crime_index',
  'political_stability',
  'water_drinkable',
  'air_quality_pm25',
  'internet_speed_combined',
  'english_proficiency',
  'lgbtq_acceptance',
  'healthcare_quality',
  'naturkatastrophen_resilienz',
  'direct_flight_to_germany',
  'cost_of_living_score',
  'purchasing_power_score',
  'tax_burden_score',
  'climate_comfort_score',
];

async function main() {
  const [
    cities,
    colItems,
    colCities,
    weatherRows,
    weatherCities,
    poiRows,
    lifestyleOsm,
    countrySalary,
    visaRules,
    exchangeRates,
  ] = await Promise.all([
    prisma.city.count({ where: { isActive: true } }),
    prisma.costOfLivingItem.count(),
    prisma.costOfLivingItem.findMany({ select: { cityId: true }, distinct: ['cityId'] }).then(r => r.length),
    prisma.cityWeather.count(),
    prisma.cityWeather.findMany({ select: { cityId: true } }).then(r => r.length),
    prisma.cityPOI.count(),
    prisma.cityLifestyle.count({ where: { source: 'overpass-osm' } }),
    prisma.countrySalaryBenchmark.count(),
    prisma.visaRule.count(),
    prisma.exchangeRate.count(),
  ]);

  const weatherMissing = cities - weatherCities;
  const colMissing     = cities - colCities;

  printSummary('PayMap Data Import Status', [
    { label: 'Active cities',               value: cities },
    { label: 'CostOfLivingItem rows',       value: colItems },
    { label: '  → cities covered',          value: `${colCities} / ${cities}${colMissing ? ` (⚠ ${colMissing} missing)` : ' ✓'}` },
    { label: 'CityWeather rows',            value: `${weatherRows} / ${cities}${weatherMissing ? ` (⚠ ${weatherMissing} missing)` : ' ✓'}` },
    { label: 'CityLifestyle (POI counts)',  value: lifestyleOsm },
    { label: 'CityPOI (named)',             value: poiRows },
    { label: 'CountrySalaryBenchmark rows', value: countrySalary },
    { label: 'VisaRule rows',               value: visaRules },
    { label: 'ExchangeRate rows',           value: exchangeRates },
  ]);

  // ── Score Coverage ────────────────────────────────────────────────────────────

  const coverageRows = await Promise.all(
    SCORE_CATEGORIES.map(async (cat) => {
      const rows = await prisma.cityLifestyle.findMany({
        where: { category: cat },
        select: { confidence: true },
      });
      const count   = rows.length;
      const avgConf = count > 0 ? Math.round(rows.reduce((s, r) => s + r.confidence, 0) / count) : 0;
      const pct     = cities > 0 ? Math.round((count / cities) * 100) : 0;
      const flag    = count < cities ? ' ⚠' : ' ✓';
      return { label: cat, value: `${count}/${cities}${flag}  avg confidence ${avgConf}  (${pct}%)` };
    }),
  );

  const total    = SCORE_CATEGORIES.length * cities;
  const present  = coverageRows.reduce((s, r) => s + parseInt(String(r.value).split('/')[0]), 0);
  const coverage = total > 0 ? ((present / total) * 100).toFixed(1) : '0.0';

  printSummary('Score Categories Coverage', [
    ...coverageRows,
    { label: '─'.repeat(30), value: '' },
    { label: 'Total entries',  value: `${present} / ${total} (${coverage}%)` },
  ]);

  // ── Premium Coverage ──────────────────────────────────────────────────────────

  const premiumCities = await prisma.city.findMany({
    where: { slug: { in: [...PREMIUM_CITY_SLUGS] } },
    select: {
      slug: true,
      nameDE: true,
      _count: {
        select: {
          districts: true,
          narratives: true,
          tools: true,
          resources: true,
          testimonials: true,
        },
      },
    },
    orderBy: { sortOrder: 'asc' },
  });

  const slugsFound = new Set(premiumCities.map(c => c.slug));
  const missingSlugs = PREMIUM_CITY_SLUGS.filter(s => !slugsFound.has(s));

  const premiumRows = premiumCities.map(c => {
    const { districts, narratives, tools, resources, testimonials } = c._count;
    const ok = districts >= 8 && narratives >= 5 && tools >= 2 && resources >= 5 && testimonials >= 3;
    const parts = [
      `${districts >= 8 ? '✓' : '⚠'} ${districts}d`,
      `${narratives >= 5 ? '✓' : '⚠'} ${narratives}n`,
      `${tools >= 2 ? '✓' : '⚠'} ${tools}t`,
      `${resources >= 5 ? '✓' : '⚠'} ${resources}r`,
      `${testimonials >= 3 ? '✓' : '⚠'} ${testimonials}te`,
    ];
    return {
      label: `  ${(c.nameDE ?? c.slug).padEnd(12)} (${c.slug})`,
      value: `${ok ? '✓' : '⚠ INCOMPLETE'}  [${parts.join('  ')}]`,
    };
  });

  const totalComplete = premiumCities.filter(c =>
    c._count.districts >= 8 && c._count.narratives >= 5 &&
    c._count.tools >= 2 && c._count.resources >= 5 && c._count.testimonials >= 3
  ).length;

  printSummary('Premium City Coverage (d=districts n=narratives t=tools r=resources te=testimonials)', [
    ...premiumRows,
    ...(missingSlugs.length > 0 ? [{ label: '⚠ Missing in DB', value: missingSlugs.join(', ') }] : []),
    { label: '─'.repeat(30), value: '' },
    { label: 'Complete cities', value: `${totalComplete} / ${PREMIUM_CITY_SLUGS.length}` },
  ]);

  await prisma.$disconnect();
}

main().catch(err => {
  console.error(String(err));
  prisma.$disconnect().catch(() => undefined);
  process.exit(1);
});
