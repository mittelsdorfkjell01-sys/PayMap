import { Router } from "express";
import { z } from "zod";
import prisma from "../../lib/prisma";
import { requireAuth } from "../../middleware/auth";

const router = Router();
router.use(requireAuth);

router.get("/", async (_req, res) => {
  const cities = await prisma.city.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      translations: true,
      col: true,
      regimes: { include: { translations: true }, orderBy: { sortOrder: "asc" } },
      details: true,
    },
  });
  res.json(cities);
});

const citySchema = z.object({
  slug: z.string().min(1),
  flag: z.string().min(1),
  isHomeCity: z.boolean(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
  nameDE: z.string().min(1),
  nameEN: z.string().min(1),
  countryDE: z.string().min(1),
  countryEN: z.string().min(1),
});

router.post("/", async (req, res) => {
  const parsed = citySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
    return;
  }
  const { slug, flag, isHomeCity, isActive, sortOrder, nameDE, nameEN, countryDE, countryEN } = parsed.data;

  const city = await prisma.city.create({
    data: {
      slug,
      flag,
      isHomeCity,
      isActive,
      sortOrder,
      translations: {
        create: [
          { locale: "de", name: nameDE, country: countryDE },
          { locale: "en", name: nameEN, country: countryEN },
        ],
      },
    },
    include: { translations: true, col: true, regimes: { include: { translations: true } }, details: true },
  });
  res.status(201).json(city);
});

router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const parsed = citySchema.partial().safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const { nameDE, nameEN, countryDE, countryEN, ...rest } = parsed.data;

  await prisma.city.update({ where: { id }, data: rest });

  if (nameDE !== undefined || countryDE !== undefined) {
    await prisma.cityTranslation.upsert({
      where: { cityId_locale: { cityId: id, locale: "de" } },
      update: { name: nameDE ?? "", country: countryDE ?? "" },
      create: { cityId: id, locale: "de", name: nameDE ?? "", country: countryDE ?? "" },
    });
  }
  if (nameEN !== undefined || countryEN !== undefined) {
    await prisma.cityTranslation.upsert({
      where: { cityId_locale: { cityId: id, locale: "en" } },
      update: { name: nameEN ?? "", country: countryEN ?? "" },
      create: { cityId: id, locale: "en", name: nameEN ?? "", country: countryEN ?? "" },
    });
  }

  const city = await prisma.city.findUnique({
    where: { id },
    include: { translations: true, col: true, regimes: { include: { translations: true } }, details: true },
  });
  res.json(city);
});

router.delete("/:id", async (req, res) => {
  await prisma.city.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

router.put("/:id/col", async (req, res) => {
  const schema = z.object({
    rent: z.number().int().positive(),
    food: z.number().int().positive(),
    transport: z.number().int().positive(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const col = await prisma.costOfLiving.upsert({
    where: { cityId: req.params.id },
    update: parsed.data,
    create: { cityId: req.params.id, ...parsed.data },
  });
  res.json(col);
});

router.put("/:id/details", async (req, res) => {
  const sectionsSchema = z.record(z.array(z.string()));
  const bodySchema = z.object({
    de: sectionsSchema.optional(),
    en: sectionsSchema.optional(),
  });
  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }

  const cityId = req.params.id;
  const results = [];
  for (const locale of ["de", "en"] as const) {
    const sections = parsed.data[locale];
    if (!sections) continue;
    for (const [section, items] of Object.entries(sections)) {
      const detail = await prisma.cityDetail.upsert({
        where: { cityId_section_locale: { cityId, section, locale } },
        update: { items },
        create: { cityId, section, locale, items },
      });
      results.push(detail);
    }
  }
  res.json(results);
});

router.patch("/:id/order", async (req, res) => {
  const schema = z.object({ sortOrder: z.number().int() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const city = await prisma.city.update({
    where: { id: req.params.id },
    data: { sortOrder: parsed.data.sortOrder },
  });
  res.json(city);
});

export default router;
