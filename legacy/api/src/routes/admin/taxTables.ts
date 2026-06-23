import { Router } from "express";
import { z } from "zod";
import prisma from "../../lib/prisma";
import { requireAuth } from "../../middleware/auth";

// Admin editing of the year-versioned tax tables that feed loadTaxData
// (TaxBracket / SocialContribution / Deduction / Surcharge / FixedAmount). This
// is the "DB is the source of truth, no code release needed" path. Edits are
// scoped to a single country + year and replace just those rows.
//
// Regions are referenced by SLUG (not the DB cuid) so the JSON is human-editable;
// we translate slug<->id and validate that the region belongs to the country.

const router = Router();
router.use(requireAuth);

const rate = z.number().min(0).max(1);
const money = z.number().min(0);

const bracketSchema = z.object({
  regionSlug: z.string().nullish(),
  filingStatus: z.string().nullish(),
  fromAmount: money,
  toAmount: money.nullish(),
  rate,
  employmentType: z.string().min(1),
  sourceUrl: z.string().nullish(),
});
const socialSchema = z.object({
  type: z.string().min(1),
  rate,
  ceiling: money.nullish(),
  employeeSide: z.boolean(),
  sourceUrl: z.string().nullish(),
});
const deductionSchema = z.object({
  type: z.string().min(1),
  amount: money.nullish(),
  percentage: rate.nullish(),
  condition: z.string().nullish(),
  sourceUrl: z.string().nullish(),
});
const surchargeSchema = z.object({
  regionSlug: z.string().nullish(),
  cityScope: z.string().nullish(),
  type: z.string().min(1),
  baseType: z.enum(["income_tax", "taxable_income"]),
  rate: rate.nullish(),
  brackets: z.any().nullish(),
  allowance: money.nullish(),
  variantKey: z.string().nullish(),
  sourceUrl: z.string().min(1),
});
const fixedAmountSchema = z.object({
  regionSlug: z.string().nullish(),
  type: z.string().min(1),
  amount: money,
  period: z.enum(["monthly", "yearly"]),
  sourceUrl: z.string().min(1),
});

const putSchema = z.object({
  brackets: z.array(bracketSchema),
  social: z.array(socialSchema),
  deductions: z.array(deductionSchema),
  surcharges: z.array(surchargeSchema),
  fixedAmounts: z.array(fixedAmountSchema),
});

/** Brackets must be non-overlapping and ascending within each scale group. */
function validateBrackets(rows: z.infer<typeof bracketSchema>[]): string | null {
  const groups = new Map<string, z.infer<typeof bracketSchema>[]>();
  for (const b of rows) {
    const key = `${b.employmentType}|${b.filingStatus ?? ""}|${b.regionSlug ?? ""}`;
    (groups.get(key) ?? groups.set(key, []).get(key)!).push(b);
  }
  for (const [key, g] of groups) {
    const sorted = [...g].sort((a, b) => a.fromAmount - b.fromAmount);
    for (let i = 0; i < sorted.length; i++) {
      const cur = sorted[i];
      if (cur.toAmount != null && cur.toAmount <= cur.fromAmount) {
        return `Bracket group "${key}": toAmount must be > fromAmount (at ${cur.fromAmount}).`;
      }
      const next = sorted[i + 1];
      if (next) {
        if (cur.toAmount == null) return `Bracket group "${key}": only the last bracket may be open-ended (toAmount null).`;
        if (next.fromAmount < cur.toAmount) return `Bracket group "${key}": overlap at ${next.fromAmount}.`;
      }
    }
  }
  return null;
}

// GET /api/admin/tax-tables/countries — selector data: countries + their years.
router.get("/countries", async (_req, res) => {
  const countries = await prisma.country.findMany({
    orderBy: { nameDE: "asc" },
    select: { slug: true, nameDE: true, taxBrackets: { select: { year: true } }, socialContribs: { select: { year: true } } },
  });
  const out = countries.map((c) => {
    const years = new Set<number>();
    c.taxBrackets.forEach((b) => years.add(b.year));
    c.socialContribs.forEach((s) => years.add(s.year));
    return { slug: c.slug, nameDE: c.nameDE, years: [...years].sort((a, b) => b - a) };
  });
  res.json(out);
});

// GET /api/admin/tax-tables/:countrySlug/:year — all five tables for editing.
router.get("/:countrySlug/:year", async (req, res) => {
  const year = Number(req.params.year);
  if (!Number.isInteger(year)) {
    res.status(400).json({ error: "Invalid year" });
    return;
  }
  const country = await prisma.country.findUnique({
    where: { slug: req.params.countrySlug },
    include: {
      regions: { select: { id: true, slug: true } },
      taxBrackets: { where: { year } },
      socialContribs: { where: { year } },
      deductions: { where: { year } },
      surcharges: { where: { year } },
      fixedAmounts: { where: { year } },
    },
  });
  if (!country) {
    res.status(404).json({ error: "Country not found" });
    return;
  }
  const slugOf = new Map(country.regions.map((r) => [r.id, r.slug]));
  const reg = (id: string | null) => (id ? slugOf.get(id) ?? null : null);

  res.json({
    country: { slug: country.slug, nameDE: country.nameDE },
    year,
    regions: country.regions.map((r) => r.slug),
    brackets: country.taxBrackets.map((b) => ({
      regionSlug: reg(b.regionId), filingStatus: b.filingStatus, fromAmount: b.fromAmount,
      toAmount: b.toAmount, rate: b.rate, employmentType: b.employmentType, sourceUrl: b.sourceUrl,
    })),
    social: country.socialContribs.map((s) => ({
      type: s.type, rate: s.rate, ceiling: s.ceiling, employeeSide: s.employeeSide, sourceUrl: s.sourceUrl,
    })),
    deductions: country.deductions.map((d) => ({
      type: d.type, amount: d.amount, percentage: d.percentage, condition: d.condition, sourceUrl: d.sourceUrl,
    })),
    surcharges: country.surcharges.map((s) => ({
      regionSlug: reg(s.regionId), cityScope: s.cityScope, type: s.type, baseType: s.baseType,
      rate: s.rate, brackets: s.brackets, allowance: s.allowance, variantKey: s.variantKey, sourceUrl: s.sourceUrl,
    })),
    fixedAmounts: country.fixedAmounts.map((f) => ({
      regionSlug: reg(f.regionId), type: f.type, amount: f.amount, period: f.period, sourceUrl: f.sourceUrl,
    })),
  });
});

// PUT /api/admin/tax-tables/:countrySlug/:year — replace all five tables for
// this country+year. Bounded delete + recreate inside a transaction.
router.put("/:countrySlug/:year", async (req, res) => {
  const year = Number(req.params.year);
  if (!Number.isInteger(year)) {
    res.status(400).json({ error: "Invalid year" });
    return;
  }
  const parsed = putSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
    return;
  }
  const data = parsed.data;

  const bracketErr = validateBrackets(data.brackets);
  if (bracketErr) {
    res.status(400).json({ error: bracketErr });
    return;
  }

  const country = await prisma.country.findUnique({
    where: { slug: req.params.countrySlug },
    include: { regions: { select: { id: true, slug: true } } },
  });
  if (!country) {
    res.status(404).json({ error: "Country not found" });
    return;
  }
  const idOf = new Map(country.regions.map((r) => [r.slug, r.id]));
  // Resolve every regionSlug used → id; reject unknown slugs.
  const resolveRegion = (slug: string | null | undefined): string | null | undefined => {
    if (slug == null) return null;
    const id = idOf.get(slug);
    if (!id) throw new Error(`Unknown region "${slug}" for ${country.slug}`);
    return id;
  };

  try {
    await prisma.$transaction([
      prisma.taxBracket.deleteMany({ where: { countryId: country.id, year } }),
      prisma.socialContribution.deleteMany({ where: { countryId: country.id, year } }),
      prisma.deduction.deleteMany({ where: { countryId: country.id, year } }),
      prisma.surcharge.deleteMany({ where: { countryId: country.id, year } }),
      prisma.fixedAmount.deleteMany({ where: { countryId: country.id, year } }),
      prisma.taxBracket.createMany({
        data: data.brackets.map((b) => ({
          countryId: country.id, regionId: resolveRegion(b.regionSlug) ?? null, filingStatus: b.filingStatus ?? null,
          fromAmount: b.fromAmount, toAmount: b.toAmount ?? null, rate: b.rate, year, employmentType: b.employmentType,
          sourceUrl: b.sourceUrl ?? null,
        })),
      }),
      prisma.socialContribution.createMany({
        data: data.social.map((s) => ({
          countryId: country.id, type: s.type, rate: s.rate, ceiling: s.ceiling ?? null,
          employeeSide: s.employeeSide, year, sourceUrl: s.sourceUrl ?? null,
        })),
      }),
      prisma.deduction.createMany({
        data: data.deductions.map((d) => ({
          countryId: country.id, type: d.type, amount: d.amount ?? null, percentage: d.percentage ?? null,
          condition: d.condition ?? null, year, sourceUrl: d.sourceUrl ?? null,
        })),
      }),
      prisma.surcharge.createMany({
        data: data.surcharges.map((s) => ({
          countryId: country.id, regionId: resolveRegion(s.regionSlug) ?? null, cityScope: s.cityScope ?? null,
          type: s.type, baseType: s.baseType, rate: s.rate ?? null, brackets: s.brackets ?? undefined,
          allowance: s.allowance ?? null, variantKey: s.variantKey ?? null, year, sourceUrl: s.sourceUrl,
        })),
      }),
      prisma.fixedAmount.createMany({
        data: data.fixedAmounts.map((f) => ({
          countryId: country.id, regionId: resolveRegion(f.regionSlug) ?? null, type: f.type,
          amount: f.amount, period: f.period, year, sourceUrl: f.sourceUrl,
        })),
      }),
    ]);
  } catch (e) {
    res.status(400).json({ error: e instanceof Error ? e.message : "Save failed" });
    return;
  }

  res.json({ ok: true, counts: {
    brackets: data.brackets.length, social: data.social.length, deductions: data.deductions.length,
    surcharges: data.surcharges.length, fixedAmounts: data.fixedAmounts.length,
  } });
});

export default router;
