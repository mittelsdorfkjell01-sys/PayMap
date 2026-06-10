# Trends data coverage report (PR5)

Honest snapshot of which of the 21 canonical categories have real data for the
34 cities, vs. "Daten ausstehend". Generated 2026-06-10.

Legend: ✅ live now · ⏳ ready once the PR3 seed script is run · ⛔ no source (outstanding)

| Category | Cluster | Source | Coverage |
|---|---|---|---|
| tax_burden_score | Finanzen | tax-engine (live) + import-derived-scores | ✅ 34/34 |
| cost_of_living_score | Finanzen | Numbeo 2024 (import-derived-scores) | ✅ 34/34 |
| purchasing_power_score | Finanzen | Numbeo LPP (live + import-derived-scores) | ✅ 34/34 |
| currency_stability | Finanzen | World Bank CPI 2024 + FX regime (import-trends-currency) | ⏳ 34/34 |
| crime_index | Sicherheit | seed | ✅ 34/34 |
| political_stability | Sicherheit | seed | ✅ 34/34 |
| political_freedom | Sicherheit | seed | ✅ 34/34 |
| naturkatastrophen_resilienz | Sicherheit | seed | ✅ 34/34 |
| healthcare_quality | Gesundheit | seed | ✅ 34/34 |
| healthcare_access_cost | Gesundheit | — | ⛔ 0/34 |
| water_drinkable | Gesundheit | seed | ✅ 34/34 |
| air_quality_pm25 | Gesundheit | seed | ✅ 34/34 |
| climate_comfort_score | **Klima** | — | ⛔ 0/34 |
| internet_speed_combined | Infrastruktur | seed | ✅ 34/34 |
| direct_flight_to_germany | Infrastruktur | seed | ✅ 34/34 |
| timezone_overlap_cet | Infrastruktur | computed (import-trends-timezone) | ⏳ 34/34 |
| english_proficiency | Soziales | seed | ✅ 34/34 |
| lgbtq_acceptance | Soziales | seed | ✅ 34/34 |
| expat_community | Soziales | seed | ✅ 34/34 |
| family_friendliness | Soziales | — | ⛔ 0/34 |
| visa_accessibility | **Zugang** | — | ⛔ 0/34 |

**Totals:** 14 categories live now · 2 ready after the seed scripts run
(`currency_stability`, `timezone_overlap_cet`) · 4 outstanding with no source.

## Two clusters are entirely empty — surface this honestly

- **Klima** has exactly one category (`climate_comfort_score`) and it has **no
  data source anywhere** (only the canonical list + a test mock). The Klima
  column shows "—" for every city and contributes nothing to the weighted total
  (fallback excludes it). Recommended follow-up: derive `climate_comfort_score`
  from the existing `CityWeather` model (sunshine/rain/temp/humidity) as a
  computed score — the same honest pattern as `timezone_overlap_cet`. Not done
  here to avoid silent invention.
- **Zugang & Aufenthalt** has exactly one category (`visa_accessibility`) and no
  source → the whole cluster is empty too. The DBA/EU-EEA/Nomad-Visa **filters**
  (PR2/PR3) cover the practical "access" intent in the meantime.

## Outstanding categories (no reliable single index — never invented)

`healthcare_access_cost`, `family_friendliness`, `visa_accessibility`,
`climate_comfort_score`. These render greyed in the Trends UI and are excluded
from cluster averages and the total.

## To activate the ⏳ data (owner, after review)

1. Deploy migration `20260610000000_add_country_filter_flags` to prod Neon.
2. Run the PR3 seed scripts:
   - `npx tsx packages/db/scripts/import-trends-timezone.ts`
   - `npx tsx packages/db/scripts/import-trends-currency.ts`
   - `npx tsx packages/db/scripts/import-trends-filters.ts`
