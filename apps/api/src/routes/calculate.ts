import { Router } from "express";
import { z } from "zod";
import prisma from "../lib/prisma";
import { calcHomeTax, calcTargetTax } from "../lib/taxCalculator";

const router = Router();

const schema = z.object({
  gross: z.number().positive(),
  homeCitySlug: z.string(),
  targetCitySlug: z.string(),
  regimeSlug: z.string(),
  locale: z.string().default("de"),
});

router.post("/", async (req, res) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
    return;
  }
  const { gross, homeCitySlug, targetCitySlug, regimeSlug, locale } = parsed.data;

  const [homeCity, targetCity] = await Promise.all([
    prisma.city.findUnique({
      where: { slug: homeCitySlug },
      include: { col: true, translations: true },
    }),
    prisma.city.findUnique({
      where: { slug: targetCitySlug },
      include: {
        col: true,
        translations: true,
        regimes: {
          include: { translations: true },
        },
      },
    }),
  ]);

  if (!homeCity || !targetCity) {
    res.status(404).json({ error: "City not found" });
    return;
  }

  const homeCountrySlug = "de";
  const homeTaxConfig = await prisma.homeTaxConfig.findUnique({
    where: { countrySlug: homeCountrySlug },
  });

  if (!homeTaxConfig) {
    res.status(500).json({ error: "Home tax config missing" });
    return;
  }

  const regime = targetCity.regimes.find((r) => r.slug === regimeSlug) ??
                 targetCity.regimes.find((r) => r.isDefault) ??
                 targetCity.regimes[0];

  if (!regime) {
    res.status(404).json({ error: "Tax regime not found" });
    return;
  }

  const regimeLabelT = regime.translations.find((t) => t.locale === locale) ??
                        regime.translations[0];

  const home = calcHomeTax(
    gross,
    homeTaxConfig.brackets as Parameters<typeof calcHomeTax>[1],
    homeTaxConfig.social as Parameters<typeof calcHomeTax>[2]
  );

  const target = calcTargetTax(
    gross,
    regime.incomeRate,
    regime.socialRate,
    regime.exemptFrac,
    regime.translations.find((t) => t.locale === "de")?.label,
    regime.translations.find((t) => t.locale === "en")?.label
  );

  const deltaMonthly = target.monthly - home.monthly;
  const deltaPercent = home.monthly > 0 ? Math.round((deltaMonthly / home.monthly) * 100) : 0;
  const effectiveTarget = gross > 0 ? Math.round(((gross - (target.netto)) / gross) * 100) : 0;

  const homeCol = homeCity.col;
  const targetCol = targetCity.col;

  const homeColTotal = homeCol ? homeCol.rent + homeCol.food + homeCol.transport : 0;
  const targetColTotal = targetCol ? targetCol.rent + targetCol.food + targetCol.transport : 0;
  const colDiff = targetColTotal - homeColTotal;

  res.json({
    home: {
      netto: home.netto,
      monthly: home.monthly,
      breakdown: home.breakdown,
    },
    target: {
      netto: target.netto,
      monthly: target.monthly,
      breakdown: target.breakdown,
    },
    delta: {
      monthly: deltaMonthly,
      percent: deltaPercent,
      effective: effectiveTarget,
      annual: deltaMonthly * 12,
    },
    col: {
      home: homeCol
        ? { rent: homeCol.rent, food: homeCol.food, transport: homeCol.transport, total: homeColTotal }
        : null,
      target: targetCol
        ? { rent: targetCol.rent, food: targetCol.food, transport: targetCol.transport, total: targetColTotal }
        : null,
      diff: colDiff,
    },
  });
});

export default router;
