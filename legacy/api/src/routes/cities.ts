import { Router } from "express";
import prisma from "../lib/prisma";

const router = Router();

router.get("/", async (req, res) => {
  const locale = (req.query.locale as string) ?? "de";

  const cities = await prisma.city.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    include: {
      translations: true,
      col: true,
      regimes: {
        orderBy: { sortOrder: "asc" },
        include: { translations: true },
      },
      details: true,
    },
  });

  function mapCity(city: (typeof cities)[0]) {
    const t = city.translations.find((x) => x.locale === locale) ??
              city.translations.find((x) => x.locale === "de") ??
              city.translations[0];
    return {
      id: city.id,
      slug: city.slug,
      flag: city.flag,
      isHomeCity: city.isHomeCity,
      sortOrder: city.sortOrder,
      name: t?.name ?? city.slug,
      country: t?.country ?? "",
      col: city.col
        ? { rent: city.col.rent, food: city.col.food, transport: city.col.transport }
        : null,
      regimes: city.regimes.map((r) => {
        const rt = r.translations.find((x) => x.locale === locale) ??
                   r.translations.find((x) => x.locale === "de") ??
                   r.translations[0];
        return {
          id: r.id,
          slug: r.slug,
          label: rt?.label ?? r.slug,
          incomeRate: r.incomeRate,
          socialRate: r.socialRate,
          exemptFrac: r.exemptFrac,
          isDefault: r.isDefault,
          sortOrder: r.sortOrder,
        };
      }),
      details: city.details
        .filter((d) => d.locale === locale || locale !== "de")
        .reduce(
          (acc, d) => {
            if (d.locale === locale) acc[d.section] = d.items;
            return acc;
          },
          {} as Record<string, string[]>
        ),
    };
  }

  const homeCities = cities.filter((c) => c.isHomeCity).map(mapCity);
  const targetCities = cities.filter((c) => !c.isHomeCity).map(mapCity);

  res.json({ homeCities, targetCities });
});

export default router;
