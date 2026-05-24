import { prisma } from './_lib/prisma';
import { printSummary } from './_lib/logger';

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

  await prisma.$disconnect();
}

main().catch(err => {
  console.error(String(err));
  prisma.$disconnect().catch(() => undefined);
  process.exit(1);
});
