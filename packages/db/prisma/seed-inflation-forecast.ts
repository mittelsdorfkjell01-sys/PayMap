/**
 * Inflation forecast seed (semi-annual, manual — not auto-fetched). Values from
 * the European Commission Autumn 2025 Economic Forecast (HICP, full-year 2027).
 * The live current/trend fields are managed separately by lib/inflation.ts.
 *
 * Run: npm run seed:inflation:forecast
 * Re-run after each EU Commission forecast (spring/autumn) with updated numbers.
 */
import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";
import * as path from "path";
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const prisma = new PrismaClient();
const SOURCE = "EU-Kommission Herbstprognose 2025";
const YEAR = 2027;

// HICP forecast 2027 (%) — EC Autumn 2025.
const FORECAST: Record<string, number> = { de: 2.7, pt: 2.3 };

async function main() {
  for (const [slug, value] of Object.entries(FORECAST)) {
    const country = await prisma.country.findUnique({ where: { slug }, select: { id: true } });
    if (!country) {
      console.log(`  ⚠ country ${slug} not found — skipped`);
      continue;
    }
    await prisma.countryIndicator.upsert({
      where: { countryId: country.id },
      update: { forecastValue: value, forecastYear: YEAR, forecastSource: SOURCE },
      create: { countryId: country.id, forecastValue: value, forecastYear: YEAR, forecastSource: SOURCE },
    });
    console.log(`  ✓ ${slug.toUpperCase()} forecast ${value} % (${YEAR})`);
  }
  console.log("✅ Inflation forecast seeded.");
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
