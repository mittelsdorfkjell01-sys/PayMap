import { Router } from "express";
import { z } from "zod";
import prisma from "../../lib/prisma";
import { requireAuth } from "../../middleware/auth";

// Admin CRUD for City and its CostOfLivingItem rows, against the v3 schema
// (nameDE/EN inline, country/region by relation, COL as key-value items).
// Mounted at /api/admin.

const router = Router();
router.use(requireAuth);

const isoDate = z.string().refine((s) => !Number.isNaN(Date.parse(s)), "Invalid date");

const citySchema = z.object({
  slug: z.string().min(1),
  flag: z.string().min(1),
  nameDE: z.string().min(1),
  nameEN: z.string().min(1),
  currency: z.string().min(1),
  countrySlug: z.string().min(1),
  regionSlug: z.string().nullish(),
  lat: z.number().nullish(),
  lng: z.number().nullish(),
  timezone: z.string().nullish(),
  isCapital: z.boolean().default(false),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

const colItemSchema = z.object({
  category: z.string().min(1),
  value: z.number().min(0),
  currency: z.string().min(1),
  source: z.string().min(1),
  confidence: z.number().int().min(0).max(100),
  periodStart: isoDate,
  periodEnd: isoDate.nullish(),
});

/** Resolve a country slug to id, and an optional region slug to id (must belong
 *  to that country). Throws on unknown slugs. */
async function resolveRefs(countrySlug: string, regionSlug?: string | null) {
  const country = await prisma.country.findUnique({
    where: { slug: countrySlug },
    include: { regions: { select: { id: true, slug: true } } },
  });
  if (!country) throw new Error(`Unknown country "${countrySlug}"`);
  let regionId: string | null = null;
  if (regionSlug) {
    const region = country.regions.find((r) => r.slug === regionSlug);
    if (!region) throw new Error(`Region "${regionSlug}" does not belong to ${countrySlug}`);
    regionId = region.id;
  }
  return { countryId: country.id, regionId };
}

// ─── Meta (countries + their regions for the form) ──────────────────────────
router.get("/cities/meta", async (_req, res) => {
  const countries = await prisma.country.findMany({
    orderBy: { nameDE: "asc" },
    select: { slug: true, nameDE: true, regions: { select: { slug: true, nameDE: true } } },
  });
  res.json({ countries });
});

// ─── City ────────────────────────────────────────────────────────────────────
router.get("/cities", async (_req, res) => {
  const cities = await prisma.city.findMany({
    orderBy: { sortOrder: "asc" },
    include: { country: { select: { slug: true } }, region: { select: { slug: true } } },
  });
  res.json(
    cities.map((c) => ({
      id: c.id, slug: c.slug, flag: c.flag, nameDE: c.nameDE, nameEN: c.nameEN, currency: c.currency,
      countrySlug: c.country?.slug ?? null, regionSlug: c.region?.slug ?? null,
      lat: c.lat, lng: c.lng, timezone: c.timezone, isCapital: c.isCapital, isActive: c.isActive, sortOrder: c.sortOrder,
    })),
  );
});

router.post("/cities", async (req, res) => {
  const parsed = citySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
    return;
  }
  if (await prisma.city.findUnique({ where: { slug: parsed.data.slug } })) {
    res.status(409).json({ error: `City slug "${parsed.data.slug}" already exists` });
    return;
  }
  let refs;
  try { refs = await resolveRefs(parsed.data.countrySlug, parsed.data.regionSlug); }
  catch (e) { res.status(400).json({ error: e instanceof Error ? e.message : "Invalid refs" }); return; }

  const { countrySlug: _c, regionSlug: _r, ...rest } = parsed.data;
  const created = await prisma.city.create({ data: { ...rest, ...refs } });
  res.status(201).json(created);
});

router.put("/cities/:id", async (req, res) => {
  const parsed = citySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
    return;
  }
  const existing = await prisma.city.findUnique({ where: { id: req.params.id } });
  if (!existing) {
    res.status(404).json({ error: "City not found" });
    return;
  }
  const dup = await prisma.city.findFirst({ where: { slug: parsed.data.slug, id: { not: req.params.id } } });
  if (dup) {
    res.status(409).json({ error: `City slug "${parsed.data.slug}" already exists` });
    return;
  }
  let refs;
  try { refs = await resolveRefs(parsed.data.countrySlug, parsed.data.regionSlug); }
  catch (e) { res.status(400).json({ error: e instanceof Error ? e.message : "Invalid refs" }); return; }

  const { countrySlug: _c, regionSlug: _r, ...rest } = parsed.data;
  const updated = await prisma.city.update({ where: { id: req.params.id }, data: { ...rest, ...refs } });
  res.json(updated);
});

router.delete("/cities/:id", async (req, res) => {
  const existing = await prisma.city.findUnique({ where: { id: req.params.id } });
  if (!existing) {
    res.status(404).json({ error: "City not found" });
    return;
  }
  try {
    await prisma.city.delete({ where: { id: req.params.id } });
  } catch {
    // FK constraint: the city still has dependent rows (guides, COL, …).
    res.status(409).json({ error: "City has dependent data (guides/COL/…). Set isActive=false instead, or remove dependents first." });
    return;
  }
  res.status(204).send();
});

// ─── CostOfLivingItem (per city; replace-all) ───────────────────────────────
router.get("/cities/:id/col", async (req, res) => {
  const city = await prisma.city.findUnique({ where: { id: req.params.id }, select: { id: true } });
  if (!city) {
    res.status(404).json({ error: "City not found" });
    return;
  }
  const items = await prisma.costOfLivingItem.findMany({
    where: { cityId: req.params.id },
    orderBy: { category: "asc" },
    select: { category: true, value: true, currency: true, source: true, confidence: true, periodStart: true, periodEnd: true },
  });
  res.json(items.map((i) => ({ ...i, periodStart: i.periodStart.toISOString().slice(0, 10), periodEnd: i.periodEnd ? i.periodEnd.toISOString().slice(0, 10) : null })));
});

router.put("/cities/:id/col", async (req, res) => {
  const parsed = z.array(colItemSchema).safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
    return;
  }
  const city = await prisma.city.findUnique({ where: { id: req.params.id }, select: { id: true } });
  if (!city) {
    res.status(404).json({ error: "City not found" });
    return;
  }
  // Guard duplicate (category, periodStart) — the table's unique key.
  const seen = new Set<string>();
  for (const it of parsed.data) {
    const key = `${it.category}|${it.periodStart}`;
    if (seen.has(key)) {
      res.status(400).json({ error: `Duplicate item (category "${it.category}", periodStart ${it.periodStart})` });
      return;
    }
    seen.add(key);
  }
  await prisma.$transaction([
    prisma.costOfLivingItem.deleteMany({ where: { cityId: req.params.id } }),
    prisma.costOfLivingItem.createMany({
      data: parsed.data.map((i) => ({
        cityId: req.params.id, category: i.category, value: i.value, currency: i.currency,
        source: i.source, confidence: i.confidence,
        periodStart: new Date(i.periodStart), periodEnd: i.periodEnd ? new Date(i.periodEnd) : null,
      })),
    }),
  ]);
  res.json({ ok: true, count: parsed.data.length });
});

export default router;
