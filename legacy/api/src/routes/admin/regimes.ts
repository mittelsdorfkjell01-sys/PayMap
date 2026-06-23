import { Router } from "express";
import { z } from "zod";
import prisma from "../../lib/prisma";
import { requireAuth } from "../../middleware/auth";

// Admin CRUD for the v3 SpecialRegime catalog (per country) and the German
// ExitRule catalog. Anti-hallucination: this only stores what the admin enters
// — it never auto-fills legal content. Mounted at /api/admin.

const router = Router();
router.use(requireAuth);

const RISK = ["low", "medium", "high"] as const;
const REGIME_EFFECTS = [
  "replaces_income_tax",
  "reduces_taxable_base",
  "foreign_income_only",
  "not_applicable_to_salary",
  "partial_not_quantifiable",
] as const;

const isoDate = z.string().refine((s) => !Number.isNaN(Date.parse(s)), "Invalid date");

const regimeSchema = z.object({
  countrySlug: z.string().min(1),
  slug: z.string().min(1),
  nameDE: z.string().min(1),
  nameEN: z.string().min(1),
  flatRate: z.number().min(0).max(1),
  durationYears: z.number().int().positive(),
  qualifications: z.array(z.string()),
  eligibilityCriteria: z.any().nullish(),
  regimeEffect: z.enum(REGIME_EFFECTS).nullish(),
  conditionsDE: z.string().min(1),
  conditionsEN: z.string().min(1),
  validFrom: isoDate,
  validTo: isoDate.nullish(),
  sourceUrl: z.string().min(1),
  sourceDE: z.string().min(1),
  riskLevel: z.enum(RISK),
  requiresLegalAdvice: z.boolean(),
  disclaimerDE: z.string().nullish(),
  disclaimerEN: z.string().nullish(),
  descriptionDE: z.string().nullish(),
  descriptionEN: z.string().nullish(),
  backgroundDE: z.string().nullish(),
  backgroundEN: z.string().nullish(),
});

const exitRuleSchema = z.object({
  slug: z.string().min(1),
  ruleType: z.string().min(1),
  legalRef: z.string().nullish(),
  nameDE: z.string().min(1),
  nameEN: z.string().min(1),
  descriptionDE: z.string().min(1),
  descriptionEN: z.string().min(1),
  affectedDE: z.string().min(1),
  affectedEN: z.string().min(1),
  backgroundDE: z.string().nullish(),
  backgroundEN: z.string().nullish(),
  sourceUrl: z.string().min(1),
  sourceDE: z.string().min(1),
  riskLevel: z.enum(RISK),
  requiresLegalAdvice: z.boolean(),
  disclaimerDE: z.string().nullish(),
  disclaimerEN: z.string().nullish(),
  sortOrder: z.number().int().default(0),
});

/** Map a validated regime body to a Prisma create/update payload. */
function regimeData(d: z.infer<typeof regimeSchema>, countryId: string) {
  return {
    countryId,
    slug: d.slug,
    nameDE: d.nameDE,
    nameEN: d.nameEN,
    flatRate: d.flatRate,
    durationYears: d.durationYears,
    qualifications: d.qualifications,
    eligibilityCriteria: d.eligibilityCriteria ?? undefined,
    regimeEffect: d.regimeEffect ?? null,
    conditionsDE: d.conditionsDE,
    conditionsEN: d.conditionsEN,
    validFrom: new Date(d.validFrom),
    validTo: d.validTo ? new Date(d.validTo) : null,
    sourceUrl: d.sourceUrl,
    sourceDE: d.sourceDE,
    riskLevel: d.riskLevel,
    requiresLegalAdvice: d.requiresLegalAdvice,
    disclaimerDE: d.disclaimerDE ?? null,
    disclaimerEN: d.disclaimerEN ?? null,
    descriptionDE: d.descriptionDE ?? null,
    descriptionEN: d.descriptionEN ?? null,
    backgroundDE: d.backgroundDE ?? null,
    backgroundEN: d.backgroundEN ?? null,
  };
}

// ─── Meta (country list for the create form) ───────────────────────────────
router.get("/regimes/meta", async (_req, res) => {
  const countries = await prisma.country.findMany({
    orderBy: { nameDE: "asc" },
    select: { slug: true, nameDE: true },
  });
  res.json({ countries, riskLevels: RISK, regimeEffects: REGIME_EFFECTS });
});

// ─── SpecialRegime ──────────────────────────────────────────────────────────
router.get("/regimes", async (_req, res) => {
  const regimes = await prisma.specialRegime.findMany({
    orderBy: [{ country: { nameDE: "asc" } }, { slug: "asc" }],
    include: { country: { select: { slug: true, nameDE: true } } },
  });
  res.json(regimes);
});

router.post("/regimes", async (req, res) => {
  const parsed = regimeSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
    return;
  }
  const country = await prisma.country.findUnique({ where: { slug: parsed.data.countrySlug }, select: { id: true } });
  if (!country) {
    res.status(400).json({ error: `Unknown country "${parsed.data.countrySlug}"` });
    return;
  }
  if (await prisma.specialRegime.findFirst({ where: { slug: parsed.data.slug } })) {
    res.status(409).json({ error: `Regime slug "${parsed.data.slug}" already exists` });
    return;
  }
  const created = await prisma.specialRegime.create({ data: regimeData(parsed.data, country.id) });
  res.status(201).json(created);
});

router.put("/regimes/:id", async (req, res) => {
  const parsed = regimeSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
    return;
  }
  const existing = await prisma.specialRegime.findUnique({ where: { id: req.params.id } });
  if (!existing) {
    res.status(404).json({ error: "Regime not found" });
    return;
  }
  const country = await prisma.country.findUnique({ where: { slug: parsed.data.countrySlug }, select: { id: true } });
  if (!country) {
    res.status(400).json({ error: `Unknown country "${parsed.data.countrySlug}"` });
    return;
  }
  const dup = await prisma.specialRegime.findFirst({ where: { slug: parsed.data.slug, id: { not: req.params.id } } });
  if (dup) {
    res.status(409).json({ error: `Regime slug "${parsed.data.slug}" already exists` });
    return;
  }
  const updated = await prisma.specialRegime.update({ where: { id: req.params.id }, data: regimeData(parsed.data, country.id) });
  res.json(updated);
});

router.delete("/regimes/:id", async (req, res) => {
  const existing = await prisma.specialRegime.findUnique({ where: { id: req.params.id } });
  if (!existing) {
    res.status(404).json({ error: "Regime not found" });
    return;
  }
  await prisma.specialRegime.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

// ─── ExitRule ───────────────────────────────────────────────────────────────
router.get("/exit-rules", async (_req, res) => {
  const rules = await prisma.exitRule.findMany({ orderBy: { sortOrder: "asc" } });
  res.json(rules);
});

router.post("/exit-rules", async (req, res) => {
  const parsed = exitRuleSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
    return;
  }
  if (await prisma.exitRule.findUnique({ where: { slug: parsed.data.slug } })) {
    res.status(409).json({ error: `Exit-rule slug "${parsed.data.slug}" already exists` });
    return;
  }
  const created = await prisma.exitRule.create({
    data: { ...parsed.data, legalRef: parsed.data.legalRef ?? null },
  });
  res.status(201).json(created);
});

router.put("/exit-rules/:id", async (req, res) => {
  const parsed = exitRuleSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
    return;
  }
  const existing = await prisma.exitRule.findUnique({ where: { id: req.params.id } });
  if (!existing) {
    res.status(404).json({ error: "Exit-rule not found" });
    return;
  }
  const dup = await prisma.exitRule.findFirst({ where: { slug: parsed.data.slug, id: { not: req.params.id } } });
  if (dup) {
    res.status(409).json({ error: `Exit-rule slug "${parsed.data.slug}" already exists` });
    return;
  }
  const updated = await prisma.exitRule.update({
    where: { id: req.params.id },
    data: { ...parsed.data, legalRef: parsed.data.legalRef ?? null },
  });
  res.json(updated);
});

router.delete("/exit-rules/:id", async (req, res) => {
  const existing = await prisma.exitRule.findUnique({ where: { id: req.params.id } });
  if (!existing) {
    res.status(404).json({ error: "Exit-rule not found" });
    return;
  }
  await prisma.exitRule.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

export default router;
