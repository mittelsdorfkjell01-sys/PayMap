import { Router } from "express";
import { z } from "zod";
import prisma from "../../lib/prisma";
import { requireAuth } from "../../middleware/auth";

const router = Router();
router.use(requireAuth);

router.get("/cities/:cityId/regimes", async (req, res) => {
  const regimes = await prisma.taxRegime.findMany({
    where: { cityId: req.params.cityId },
    orderBy: { sortOrder: "asc" },
    include: { translations: true },
  });
  res.json(regimes);
});

const regimeSchema = z.object({
  slug: z.string().min(1),
  labelDE: z.string().min(1),
  labelEN: z.string().min(1),
  incomeRate: z.number().min(0).max(1),
  socialRate: z.number().min(0).max(1),
  exemptFrac: z.number().min(0).max(1).optional().nullable(),
  isDefault: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
});

router.post("/cities/:cityId/regimes", async (req, res) => {
  const parsed = regimeSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
    return;
  }
  const { slug, labelDE, labelEN, incomeRate, socialRate, exemptFrac, isDefault, sortOrder } = parsed.data;

  const regime = await prisma.taxRegime.create({
    data: {
      cityId: req.params.cityId,
      slug,
      incomeRate,
      socialRate,
      exemptFrac,
      isDefault,
      sortOrder,
      translations: {
        create: [
          { locale: "de", label: labelDE },
          { locale: "en", label: labelEN },
        ],
      },
    },
    include: { translations: true },
  });
  res.status(201).json(regime);
});

router.patch("/regimes/:id", async (req, res) => {
  const parsed = regimeSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const { labelDE, labelEN, ...rest } = parsed.data;

  await prisma.taxRegime.update({ where: { id: req.params.id }, data: rest });

  if (labelDE !== undefined) {
    await prisma.taxRegimeTranslation.upsert({
      where: { regimeId_locale: { regimeId: req.params.id, locale: "de" } },
      update: { label: labelDE },
      create: { regimeId: req.params.id, locale: "de", label: labelDE },
    });
  }
  if (labelEN !== undefined) {
    await prisma.taxRegimeTranslation.upsert({
      where: { regimeId_locale: { regimeId: req.params.id, locale: "en" } },
      update: { label: labelEN },
      create: { regimeId: req.params.id, locale: "en", label: labelEN },
    });
  }

  const regime = await prisma.taxRegime.findUnique({
    where: { id: req.params.id },
    include: { translations: true },
  });
  res.json(regime);
});

router.delete("/regimes/:id", async (req, res) => {
  await prisma.taxRegime.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

export default router;
