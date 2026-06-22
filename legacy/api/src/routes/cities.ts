import { Router } from "express";
import prisma from "../lib/prisma";

const router = Router();

// City list for the calculator dropdowns. Home cities are the German baseline
// (country = de); everything else is a comparison target. Uses the current
// schema (nameDE/nameEN + country relation) — no legacy translations/col tables.
router.get("/", async (_req, res) => {
  const cities = await prisma.city.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      slug: true,
      flag: true,
      nameDE: true,
      nameEN: true,
      currency: true,
      country: { select: { slug: true, nameDE: true, nameEN: true } },
    },
  });

  const map = (c: (typeof cities)[number]) => ({
    id: c.id,
    slug: c.slug,
    flag: c.flag,
    nameDE: c.nameDE ?? c.slug,
    nameEN: c.nameEN ?? c.slug,
    currency: c.currency ?? "EUR",
    countrySlug: c.country?.slug ?? null,
    countryDE: c.country?.nameDE ?? "",
    countryEN: c.country?.nameEN ?? "",
  });

  const homeCities = cities.filter((c) => c.country?.slug === "de").map(map);
  const targetCities = cities.filter((c) => c.country?.slug !== "de").map(map);

  res.json({ homeCities, targetCities });
});

export default router;
