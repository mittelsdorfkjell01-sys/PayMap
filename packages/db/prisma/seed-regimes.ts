/**
 * Targeted re-seed for SpecialRegime + ExitRule only.
 *
 * Idempotent upsert-by-slug using the shared definitions in ./regime-data —
 * the EXACT same logic the full seed (seed.ts) runs, but touching ONLY the
 * specialRegime and exitRule tables. No other tables are read or written.
 *
 * Run: npm run seed:regimes
 */
import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";
import * as path from "path";
import { regimeDefs, exitRuleDefs } from "./regime-data";
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const prisma = new PrismaClient();

async function main() {
  const now = new Date();

  // Resolve country slug → id from the DB (countries are not modified here).
  const countries = await prisma.country.findMany({ select: { id: true, slug: true } });
  const countryMap = new Map(countries.map((c) => [c.slug, c.id]));
  const slugToCountryId = (slug: string) => {
    const id = countryMap.get(slug);
    if (!id) throw new Error(`Country slug "${slug}" not found — seed countries first.`);
    return id;
  };

  // ─── SpecialRegimes ──────────────────────────────────────────────────────
  for (const { countrySlug, ...regime } of regimeDefs) {
    const data = { ...regime, countryId: slugToCountryId(countrySlug), updatedAt: now };
    const existing = await prisma.specialRegime.findFirst({ where: { slug: regime.slug } });
    if (!existing) {
      await prisma.specialRegime.create({ data });
      console.log(`  + regime ${regime.slug}`);
    } else {
      await prisma.specialRegime.update({ where: { id: existing.id }, data });
      console.log(`  ~ regime ${regime.slug}`);
    }
  }

  // ─── ExitRules (Säule B) ───────────────────────────────────────────────────
  for (const rule of exitRuleDefs) {
    const existing = await prisma.exitRule.findUnique({ where: { slug: rule.slug } });
    if (!existing) {
      await prisma.exitRule.create({ data: { ...rule, updatedAt: now } });
      console.log(`  + exitRule ${rule.slug}`);
    } else {
      await prisma.exitRule.update({ where: { id: existing.id }, data: { ...rule, updatedAt: now } });
      console.log(`  ~ exitRule ${rule.slug}`);
    }
  }

  const [regimeCount, exitCount] = await Promise.all([
    prisma.specialRegime.count(),
    prisma.exitRule.count(),
  ]);
  console.log(`✅ Regime re-seed done. specialRegime=${regimeCount}, exitRule=${exitCount}`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
