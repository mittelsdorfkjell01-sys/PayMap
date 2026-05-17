import { Router } from "express";
import { z } from "zod";
import prisma from "../../lib/prisma";
import { requireAuth } from "../../middleware/auth";

const router = Router();
router.use(requireAuth);

router.get("/", async (_req, res) => {
  const configs = await prisma.homeTaxConfig.findMany();
  res.json(configs);
});

router.get("/:countrySlug", async (req, res) => {
  const config = await prisma.homeTaxConfig.findUnique({
    where: { countrySlug: req.params.countrySlug },
  });
  if (!config) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(config);
});

const configSchema = z.object({
  label: z.string().optional(),
  brackets: z.array(z.record(z.unknown())),
  social: z.array(z.record(z.unknown())),
});

router.put("/:countrySlug", async (req, res) => {
  const parsed = configSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
    return;
  }

  const config = await prisma.homeTaxConfig.upsert({
    where: { countrySlug: req.params.countrySlug },
    update: {
      brackets: parsed.data.brackets,
      social: parsed.data.social,
      ...(parsed.data.label ? { label: parsed.data.label } : {}),
    },
    create: {
      countrySlug: req.params.countrySlug,
      label: parsed.data.label ?? req.params.countrySlug,
      brackets: parsed.data.brackets,
      social: parsed.data.social,
    },
  });
  res.json(config);
});

export default router;
