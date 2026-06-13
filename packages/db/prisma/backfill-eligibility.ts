/**
 * PayMap — Backfill für SpecialRegime.eligibilityCriteria + regimeEffect.
 *
 * Liest die kuratierte Konstante aus eligibility-backfill.ts und schreibt sie
 * idempotent (per slug) in die DB. Setzt voraus, dass schema.prisma die Felder
 * `eligibilityCriteria Json?` und `regimeEffect String?` auf SpecialRegime hat
 * und die Migration eingespielt ist.
 *
 *   npx tsx packages/db/prisma/backfill-eligibility.ts
 *   (oder: ts-node / über das vorhandene Seed-Setup)
 */
import { PrismaClient } from '@prisma/client';
import { ELIGIBILITY_BACKFILL, REGIME_EFFECT } from './eligibility-backfill';

const prisma = new PrismaClient();

async function main() {
  const slugs = Object.keys(ELIGIBILITY_BACKFILL);
  let updated = 0;
  let missing: string[] = [];

  for (const slug of slugs) {
    const rules = ELIGIBILITY_BACKFILL[slug];
    const effect = REGIME_EFFECT[slug] ?? null;

    const regime = await prisma.specialRegime.findFirst({ where: { slug } });
    if (!regime) {
      missing.push(slug);
      continue;
    }

    await prisma.specialRegime.update({
      where: { id: regime.id },
      data: {
        eligibilityCriteria: rules as unknown as object,
        regimeEffect: effect,
      },
    });
    updated++;
  }

  console.log(`eligibility backfill: ${updated}/${slugs.length} Regimes aktualisiert.`);
  if (missing.length) {
    console.warn(`Nicht in der DB gefunden (übersprungen): ${missing.join(', ')}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
