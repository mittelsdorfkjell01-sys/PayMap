/**
 * import-crime-index.ts
 * Populates CityLifestyle.crime_index for all active cities.
 *
 * Methodology: Country-level base score derived from UNODC Statistics (homicide rates 2023)
 * and Global Peace Index 2025, adjusted by city-specific large-city modifiers.
 * Scale: 0 = very dangerous, 100 = very safe.
 *
 * Run: tsx import-crime-index.ts [--dry-run]
 */

import { prisma } from './_lib/prisma';
import { log, warn, printSummary } from './_lib/logger';
import { cityMapping } from './_lib/city-mapping';

const DRY_RUN = process.argv.includes('--dry-run');
const TASK     = 'crime-index';
const CATEGORY = 'crime_index';
const SOURCE   = 'unodc-gpi-2025';
const FOOTNOTE =
  'Crime Index basiert auf UNODC Statistics (Homizidrate 2023) + Global Peace Index 2025 ' +
  '(Land-Ebene), korrigiert durch stadt-spezifische Modifier für Großstadt-Effekte. ' +
  'Skala: 100 = sehr sicher (Wien, Zürich, Singapur), 50 = mittel, 0 = sehr unsicher. ' +
  'Höher = sicherer.';

// ─── Country base scores (higher = safer) ─────────────────────────────────────
// Sources: UNODC 2023 homicide rates + GPI 2025 composite (inverted + rescaled)
const COUNTRY_BASE: Record<string, number> = {
  de: 82, at: 88, ch: 92, nl: 85, pt: 80,
  es: 75, fr: 70, it: 70, ie: 82, gb: 75,
  mt: 85, ee: 86, pl: 78, cz: 80, hu: 75,
  ro: 68, ge: 65, uae: 78, th: 60, us: 55,
  sg: 95, id: 60, co: 35, mx: 38, ar: 50,
  za: 30,
};

// ─── City modifiers ────────────────────────────────────────────────────────────
// Reflects large-city premium/discount vs national average
const CITY_MODIFIER: Record<string, number> = {
  berlin:       -10,
  hamburg:       -5,
  muenchen:      +2,
  lissabon:      -3,
  porto:          0,
  barcelona:     -8,
  madrid:        -5,
  valencia:       0,
  amsterdam:     -5,
  rotterdam:     -3,
  wien:          +2,
  zuerich:       +1,
  mailand:       -3,
  paris:        -10,
  dublin:         0,
  london:       -10,
  tallinn:        0,
  warschau:       0,
  prag:           0,
  budapest:       0,
  bukarest:       0,
  valletta:       0,
  tbilisi:        0,
  dubai:         +2,
  bangkok:      -10,
  'chiang-mai':  +5,
  bali:           0,
  medellin:       0,
  'mexiko-city':  0,
  'buenos-aires': 0,
  'new-york':    -5,
  miami:         -5,
  singapur:       0,
  kapstadt:       0,
};

// Capitals / major hubs with good statistical coverage → higher confidence
const HIGH_CONF = new Set([
  'berlin', 'wien', 'paris', 'london', 'amsterdam', 'madrid', 'lissabon',
  'dublin', 'budapest', 'prag', 'bukarest', 'warschau', 'tallinn', 'singapur',
  'dubai', 'new-york', 'tbilisi', 'bangkok', 'buenos-aires', 'mexiko-city',
  'kapstadt', 'medellin',
]);

function clamp(v: number): number {
  return Math.max(0, Math.min(100, Math.round(v)));
}

async function main() {
  if (DRY_RUN) console.log('\nDRY RUN — no DB writes\n');

  let inserted = 0;
  let updated  = 0;
  let skipped  = 0;
  const missing: string[] = [];

  for (const city of cityMapping) {
    const base = COUNTRY_BASE[city.countrySlug];
    if (base === undefined) {
      warn(TASK, 'no-base-score', `${city.ourSlug} (country: ${city.countrySlug})`);
      missing.push(city.ourSlug);
      continue;
    }

    const modifier   = CITY_MODIFIER[city.ourSlug] ?? 0;
    const score      = clamp(base + modifier);
    const confidence = HIGH_CONF.has(city.ourSlug) ? 75 : 60;

    log(TASK, 'score', `${city.ourSlug.padEnd(14)} base=${base} mod=${modifier >= 0 ? '+' : ''}${modifier} → ${score} (conf=${confidence})`);

    if (DRY_RUN) continue;

    const dbCity = await prisma.city.findFirst({ where: { slug: city.ourSlug, isActive: true } });
    if (!dbCity) {
      warn(TASK, 'city-not-found', city.ourSlug);
      skipped++;
      continue;
    }

    const existing = await prisma.cityLifestyle.findFirst({
      where: { cityId: dbCity.id, category: CATEGORY },
    });

    const payload = {
      cityId:         dbCity.id,
      category:       CATEGORY,
      score,
      source:         SOURCE,
      confidence,
      sourceFootnote: FOOTNOTE,
      updatedAt:      new Date(),
    };

    if (existing) {
      await prisma.cityLifestyle.update({ where: { id: existing.id }, data: payload });
      updated++;
    } else {
      await prisma.cityLifestyle.create({ data: payload });
      inserted++;
    }
  }

  printSummary('Crime Index Import', [
    { label: 'Mode',               value: DRY_RUN ? 'dry-run (no writes)' : 'live' },
    { label: 'Inserted',           value: DRY_RUN ? 'n/a' : inserted },
    { label: 'Updated',            value: DRY_RUN ? 'n/a' : updated  },
    { label: 'Skipped (no city)',  value: skipped  },
    { label: 'Missing base score', value: missing.length > 0 ? missing.join(', ') : 'none' },
  ]);

  await prisma.$disconnect();
}

main().catch(err => {
  console.error(String(err));
  prisma.$disconnect().catch(() => undefined);
  process.exit(1);
});
