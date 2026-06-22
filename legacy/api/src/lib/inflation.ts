import prisma from "./prisma";

// Live inflation from the Eurostat HICP API (annual rate of change, monthly).
// Free, no API key. Cached per country in CountryIndicator and refreshed when the
// cache is older than STALE_DAYS — so the value stays current automatically
// (HICP releases monthly) without any manual 4-month check.

const STALE_DAYS = 7;
// prc_hicp_manr = HICP annual rate of change (monthly). Eurostat marks it
// "discontinued" in favour of prc_hicp_minr, but minr currently rejects the
// query (HTTP 400) while manr still serves up-to-date data — switch once minr's
// parameter set is confirmed.
const DATASET = "prc_hicp_manr";
const BASE = "https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data";

/** Our country slug → Eurostat geo code (mostly ISO-2 upper; UK is special). */
function geoForSlug(slug: string): string | null {
  if (slug === "gb") return "UK";
  const EUROSTAT = new Set(["de", "pt", "es", "nl", "at", "ch", "fr", "it", "ie", "ee", "pl", "cz", "hu", "ro", "mt"]);
  return EUROSTAT.has(slug) ? slug.toUpperCase() : null;
}

export interface InflationDTO {
  current: number | null;
  trend: string | null; // "up" | "down" | "flat"
  period: string | null;
  forecast: number | null;
  forecastYear: number | null;
}

interface JsonStat {
  value: Record<string, number>;
  id: string[];
  size: number[];
  dimension: Record<string, { category: { index: Record<string, number> } }>;
}

/** Compute the flat index of a JSON-stat cell from per-dimension coordinates. */
function flatIndex(stat: JsonStat, coords: Record<string, number>): number {
  const strides: number[] = [];
  let s = 1;
  for (let i = stat.id.length - 1; i >= 0; i--) {
    strides[i] = s;
    s *= stat.size[i];
  }
  return stat.id.reduce((acc, dim, i) => acc + (coords[dim] ?? 0) * strides[i], 0);
}

/** Fetch the latest two months for a single geo; derive current + trend. */
async function fetchEurostat(geo: string): Promise<{ current: number; prev: number | null; period: string } | null> {
  const url = `${BASE}/${DATASET}?format=JSON&coicop=CP00&geo=${geo}&lastTimePeriod=2`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const stat = (await res.json()) as JsonStat;
  const timeIdx = stat.dimension.time?.category.index ?? {};
  const geoIdx = stat.dimension.geo?.category.index ?? {};
  const periods = Object.keys(timeIdx).sort(); // ascending → last = latest
  const latest = periods[periods.length - 1];
  const prevP = periods[periods.length - 2];
  if (latest == null || geoIdx[geo] == null) return null;

  const valAt = (period: string): number | null => {
    const fi = flatIndex(stat, { geo: geoIdx[geo], time: timeIdx[period] });
    const v = stat.value[String(fi)];
    return typeof v === "number" ? v : null;
  };
  const current = valAt(latest);
  if (current == null) return null;
  return { current, prev: prevP ? valAt(prevP) : null, period: latest };
}

function trendOf(current: number, prev: number | null): string | null {
  if (prev == null) return null;
  if (current > prev + 0.05) return "up";
  if (current < prev - 0.05) return "down";
  return "flat";
}

/** Inflation for a country slug — cached, stale-checked, with a live refresh. */
export async function getInflation(countrySlug: string): Promise<InflationDTO> {
  const country = await prisma.country.findUnique({
    where: { slug: countrySlug },
    select: { id: true, indicator: true },
  });
  if (!country) return { current: null, trend: null, period: null, forecast: null, forecastYear: null };

  const ind = country.indicator;
  const fresh =
    ind?.fetchedAt != null &&
    ind.inflationCurrent != null &&
    Date.now() - new Date(ind.fetchedAt).getTime() < STALE_DAYS * 86_400_000;

  if (!fresh) {
    const geo = geoForSlug(countrySlug);
    if (geo) {
      try {
        const data = await fetchEurostat(geo);
        if (data) {
          await prisma.countryIndicator.upsert({
            where: { countryId: country.id },
            update: {
              inflationCurrent: data.current,
              inflationPrev: data.prev,
              inflationTrend: trendOf(data.current, data.prev),
              period: data.period,
              source: `Eurostat ${DATASET}`,
              fetchedAt: new Date(),
            },
            create: {
              countryId: country.id,
              inflationCurrent: data.current,
              inflationPrev: data.prev,
              inflationTrend: trendOf(data.current, data.prev),
              period: data.period,
              source: `Eurostat ${DATASET}`,
              fetchedAt: new Date(),
            },
          });
        }
      } catch {
        // Network/parse error → keep whatever is cached (may be null).
      }
    }
  }

  const row = await prisma.countryIndicator.findUnique({ where: { countryId: country.id } });
  return {
    current: row?.inflationCurrent ?? null,
    trend: row?.inflationTrend ?? null,
    period: row?.period ?? null,
    forecast: row?.forecastValue ?? null,
    forecastYear: row?.forecastYear ?? null,
  };
}
