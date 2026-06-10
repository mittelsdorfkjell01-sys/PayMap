/**
 * import-trends-timezone.ts
 * Populates CityLifestyle.timezone_overlap_cet for every active city.
 *
 * This score is OBJECTIVELY COMPUTED — no external data source. It measures how
 * many of a remote worker's local core hours (09:00–17:00 local) overlap with
 * the German/CET core working window (09:00–17:00 CET = 08:00–16:00 UTC), as a
 * share of the 8-hour window → 0–100. 100 = full overlap (same as CET).
 *
 * Offsets are the STANDARD (non-DST) UTC offsets from the IANA tz database.
 * DST is deliberately NOT modelled: it shifts by ±1h seasonally and would make
 * the score non-deterministic across the year. This is documented honestly in
 * the stored sourceFootnote.
 *
 * Run (only after review — NOT executed automatically):
 *   npx tsx packages/db/scripts/import-trends-timezone.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const CATEGORY = 'timezone_overlap_cet';
const SOURCE = 'computed:tz-offset-vs-cet-core';
const CONFIDENCE = 100;

// Standard (winter / non-DST) UTC offset in hours per IANA timezone present in
// the dataset. Source: IANA tz database. Kept explicit so the computation is
// fully auditable and deterministic.
const TZ_OFFSET: Record<string, number> = {
  'Europe/Berlin': 1,
  'Europe/Lisbon': 0,
  'Europe/Madrid': 1,
  'Europe/Amsterdam': 1,
  'Europe/Vienna': 1,
  'Europe/Zurich': 1,
  'Europe/Rome': 1,
  'Europe/Paris': 1,
  'Europe/Dublin': 0,
  'Europe/London': 0,
  'Europe/Tallinn': 2,
  'Europe/Warsaw': 1,
  'Europe/Prague': 1,
  'Europe/Budapest': 1,
  'Europe/Bucharest': 2,
  'Europe/Malta': 1,
  'Asia/Tbilisi': 4,
  'Asia/Dubai': 4,
  'Asia/Bangkok': 7,
  'Asia/Makassar': 8,
  'America/Bogota': -5,
  'America/Mexico_City': -6,
  'America/Argentina/Buenos_Aires': -3,
  'America/New_York': -5,
  'Asia/Singapore': 8,
  'Africa/Johannesburg': 2,
};

// CET core working window in UTC: 09–17 CET == 08–16 UTC.
const CET_START_UTC = 8;
const CET_END_UTC = 16;
const WINDOW_HOURS = CET_END_UTC - CET_START_UTC; // 8

function intersect(a1: number, a2: number, b1: number, b2: number): number {
  return Math.max(0, Math.min(a2, b2) - Math.max(a1, b1));
}

/** Overlap (0–100) of local 09–17 with CET core, accounting for 24h wrap. */
export function timezoneOverlapScore(offset: number): number {
  const ls = 9 - offset;  // local 09:00 expressed in UTC
  const le = 17 - offset; // local 17:00 expressed in UTC
  const overlap = Math.max(
    intersect(ls, le, CET_START_UTC, CET_END_UTC),
    intersect(ls - 24, le - 24, CET_START_UTC, CET_END_UTC),
    intersect(ls + 24, le + 24, CET_START_UTC, CET_END_UTC),
  );
  return Math.round((overlap / WINDOW_HOURS) * 100);
}

async function main() {
  const cities = await prisma.city.findMany({
    where: { isActive: true },
    select: { id: true, slug: true, timezone: true },
  });

  let inserted = 0;
  let updated = 0;
  let skipped = 0;
  const now = new Date();

  for (const city of cities) {
    const tz = city.timezone;
    if (!tz || !(tz in TZ_OFFSET)) {
      console.warn(`  ⚠ no offset mapping for ${city.slug} (tz=${tz ?? 'null'}) — skipped`);
      skipped++;
      continue;
    }
    const offset = TZ_OFFSET[tz];
    const score = timezoneOverlapScore(offset);
    const sourceFootnote = `Computed: local 09–17 (${tz}, UTC${offset >= 0 ? '+' : ''}${offset}, standard time) vs CET core 09–17; ${score}% of the 8h window overlaps. DST not modelled.`;

    const existing = await prisma.cityLifestyle.findFirst({
      where: { cityId: city.id, category: CATEGORY },
    });
    const payload = {
      cityId: city.id,
      category: CATEGORY,
      score,
      source: SOURCE,
      confidence: CONFIDENCE,
      sourceFootnote,
      updatedAt: now,
    };
    if (existing) {
      await prisma.cityLifestyle.update({ where: { id: existing.id }, data: payload });
      updated++;
    } else {
      await prisma.cityLifestyle.create({ data: payload });
      inserted++;
    }
    console.log(`  ✓ ${city.slug.padEnd(16)} ${String(score).padStart(3)}`);
  }

  console.log(`\nDone: ${inserted} inserted, ${updated} updated, ${skipped} skipped`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
