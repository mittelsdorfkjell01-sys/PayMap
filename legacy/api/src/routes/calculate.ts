import { Router } from "express";
import { z } from "zod";
import prisma from "../lib/prisma";
import { calculate, type TaxOptions } from "@paymap/tax-engine";
import { loadTaxData } from "@paymap/db/tax-data";
import { getInflation } from "../lib/inflation";

const router = Router();

// Monthly € insurance amounts entered by the user. Each set value overrides the
// auto-computed contribution for that branch and is deducted from the gross
// (Variante B: also lowers taxable income). Only the DE engine module reads
// these; non-DE modules ignore them.
const insuranceSchema = z
  .object({
    health: z.number().nonnegative().optional(),
    care: z.number().nonnegative().optional(),
    pension: z.number().nonnegative().optional(),
    unemployment: z.number().nonnegative().optional(),
  })
  .optional();

const schema = z.object({
  gross: z.number().positive(), // annual gross
  homeCitySlug: z.string(),
  targetCitySlug: z.string(),
  year: z.number().int().default(2026),
  employment: z.enum(["employed", "freelancer", "founder", "passive"]).default("employed"),
  familyStatus: z.enum(["single", "married", "divorced"]).default("single"),
  children: z.number().int().nonnegative().default(0),
  kvType: z.enum(["statutory", "private"]).default("statutory"),
  insuranceOverrides: insuranceSchema,
  specialRegimeId: z.string().optional(),
});

const COL_POSITIONS = [
  "rent_cold_1br",
  "groceries_monthly",
  "transport_monthly",
  "electricity_monthly",
  "water_monthly",
  "gas_monthly",
  "internet_monthly",
  "other_monthly",
  "utilities_monthly",
  "total_monthly_estimate",
] as const;

async function loadCity(slug: string) {
  return prisma.city.findUnique({
    where: { slug },
    include: {
      country: { select: { slug: true } },
      region: { select: { slug: true } },
      costItems: { select: { category: true, value: true, currency: true } },
    },
  });
}

/** Build the cost-of-living breakdown map (category → value) for the UI. */
function colMap(items: { category: string; value: number }[]): Record<string, number> {
  const m: Record<string, number> = {};
  for (const it of items) {
    if ((COL_POSITIONS as readonly string[]).includes(it.category)) m[it.category] = it.value;
  }
  return m;
}

router.post("/", async (req, res) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
    return;
  }
  const p = parsed.data;

  const [homeCity, targetCity] = await Promise.all([loadCity(p.homeCitySlug), loadCity(p.targetCitySlug)]);
  if (!homeCity?.country || !targetCity?.country) {
    res.status(404).json({ error: "City or its country not found" });
    return;
  }

  const homeCountry = homeCity.country.slug;
  const targetCountry = targetCity.country.slug;

  // Tax values come from the DB (loadTaxData); algorithms stay in the engine.
  const [homeData, targetData] = await Promise.all([
    loadTaxData(homeCountry, p.year),
    loadTaxData(targetCountry, p.year),
  ]);

  // Resolve the target country's special regime ONCE, from the DB — used both
  // for the engine calc and the Sonderregime banner, so the displayed regime and
  // the net always agree. Any truthy specialRegimeId from the client means
  // "apply the target's regime"; we forward the canonical DB slug so country
  // modules that match on the exact id (ES beckham-es, PT ifici-pt, IT, …) apply
  // it correctly. Previously the UI sent a bare "ifici" alias that only PT
  // accepted — every other country silently fell back to the standard calc while
  // still showing the banner.
  const targetRegimes = await prisma.specialRegime.findMany({
    where: { country: { slug: targetCountry } },
    orderBy: { slug: "asc" },
    select: { slug: true, nameDE: true, nameEN: true, flatRate: true, durationYears: true, conditionsDE: true },
  });
  const targetRegime =
    targetRegimes.find((rg) => p.specialRegimeId && (rg.slug === p.specialRegimeId || rg.slug.startsWith(p.specialRegimeId))) ??
    targetRegimes[0] ??
    null;
  const appliedRegimeId = p.specialRegimeId ? targetRegime?.slug : undefined;

  const baseOpts = {
    gross: p.gross,
    currency: "EUR",
    employment: p.employment,
    familyStatus: p.familyStatus,
    children: p.children,
    kvType: p.kvType,
    year: p.year,
    // insuranceOverrides are German concepts (KV/PV/RV/AV) → only affect the DE
    // side; the engine ignores them for other countries. Passed to both so the
    // home-DE calc deducts the user's entered amounts from the gross.
    insuranceOverrides: p.insuranceOverrides,
  } satisfies Partial<TaxOptions>;

  const home = calculate(homeCountry, { ...baseOpts, region: homeCity.region?.slug, cityScope: homeCity.slug } as TaxOptions, homeData);

  // Multiple engine runs for the target: a "standard" (no-regime) baseline plus
  // one run per available special regime, so the UI can compare net per regime
  // and switch the headline locally without another request. Most countries have
  // 0–1 regime; Malta has two (GRP vs. HQP).
  const targetBaseOpts = { ...baseOpts, region: targetCity.region?.slug, cityScope: targetCity.slug } as TaxOptions;
  const runTarget = (regimeSlug: string | undefined) => {
    const res = calculate(targetCountry, { ...targetBaseOpts, specialRegimeId: regimeSlug } as TaxOptions, targetData);
    return {
      netAnnual: res.netAnnual,
      netMonthly: res.netMonthly,
      effectiveRate: res.effectiveRate,
      social: res.socialContributions,
      breakdown: res.breakdown,
    };
  };
  const regimeOptions = [
    { regime: null as (typeof targetRegimes)[number] | null, ...runTarget(undefined) },
    ...targetRegimes.map((rg) => ({ regime: rg, ...runTarget(rg.slug) })),
  ];
  // Headline = the applied regime when requested, else the standard baseline.
  const selected =
    (appliedRegimeId ? regimeOptions.find((o) => o.regime?.slug === appliedRegimeId) : undefined) ?? regimeOptions[0];

  const deltaMonthly = selected.netMonthly - home.netMonthly;

  // Live inflation (cached + stale-checked) for each side's country.
  const [homeInflation, targetInflation] = await Promise.all([
    getInflation(homeCountry),
    getInflation(targetCountry),
  ]);

  res.json({
    home: {
      slug: homeCity.slug,
      country: homeCountry,
      netAnnual: home.netAnnual,
      netMonthly: home.netMonthly,
      effectiveRate: home.effectiveRate,
      social: home.socialContributions,
      breakdown: home.breakdown,
      col: colMap(homeCity.costItems),
      inflation: homeInflation,
    },
    target: {
      slug: targetCity.slug,
      country: targetCountry,
      netAnnual: selected.netAnnual,
      netMonthly: selected.netMonthly,
      effectiveRate: selected.effectiveRate,
      social: selected.social,
      breakdown: selected.breakdown,
      col: colMap(targetCity.costItems),
      regime: targetRegime,
      appliedRegimeSlug: selected.regime?.slug ?? null,
      regimeOptions,
      inflation: targetInflation,
    },
    delta: {
      monthly: Math.round(deltaMonthly),
      annual: Math.round(deltaMonthly * 12),
      percent: home.netMonthly > 0 ? Math.round((deltaMonthly / home.netMonthly) * 100) : 0,
    },
  });
});

export default router;
