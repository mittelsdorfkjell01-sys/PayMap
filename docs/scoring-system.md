# PayMap Scoring System

## 1. Overview

Each city in PayMap receives scores across 14 categories. These are aggregated
into a single composite score used to rank cities in the ranking page.

The system has two layers:

- **Per-category weights** (`lib/ranking.ts`) — 11 categories each with a direct
  percentage weight; used for fine-grained user customisation in the UI.
- **Cluster aggregation** (`lib/ranking-score.ts`) — the same categories grouped
  into 6 thematic clusters (Finance, Safety, Health, Climate, Infrastructure,
  Social), with one weight per cluster. Used for the breakdown display and
  cluster-weight API params.

Both layers use the same underlying score values from `CityLifestyle`.

---

## 2. Score Categories

| Category | Cluster | Data Source | Scale | Update frequency |
|---|---|---|---|---|
| `tax_burden_score` | Finance | PayMap Tax Engine at 60k EUR | 0–100 (100 = 0% tax) | Yearly (tax law changes) |
| `cost_of_living_score` | Finance | CostOfLivingItem total_monthly_estimate | 0–100 (100 = cheapest) | Quarterly (WhereNext) |
| `purchasing_power_score` | Finance | Salary benchmark − CoL via Tax Engine | 0–100 (100 = €4k+/mo surplus) | Quarterly |
| `crime_index` | Safety | UNODC + Global Peace Index 2025 | 0–100 (100 = very safe) | Yearly |
| `political_stability` | Safety | Freedom House / World Bank PSEI | 0–100 (100 = most stable) | Yearly |
| `naturkatastrophen_resilienz` | Safety | World Risk Report 2024 | 0–100 (100 = least risk) | Yearly |
| `healthcare_quality` | Health | WHO HALE + Numbeo Health Care Index | 0–100 (100 = best) | Yearly |
| `water_drinkable` | Health | WHO/JMP 2023 | 0–100 (100 = fully safe) | Yearly |
| `air_quality_pm25` | Health | IQAir World Air Quality Report | 0–100 (100 = cleanest) | Yearly |
| `climate_comfort_score` | Climate | Open-Meteo (sunshine days, temp avg) | 0–100 (100 = ideal) | Yearly |
| `internet_speed_combined` | Infrastructure | Ookla Speedtest Global Index | 0–100 (100 = fastest) | Quarterly |
| `direct_flight_to_germany` | Infrastructure | Flightradar24 / IATA schedule | 0–100 (100 = daily direct) | Yearly |
| `english_proficiency` | Social | EF English Proficiency Index | 0–100 (100 = native-level) | Yearly |
| `lgbtq_acceptance` | Social | ILGA-Europe Rainbow Index | 0–100 (100 = full equality) | Yearly |

---

## 3. Cluster Aggregation

### Cluster definitions

| Cluster | Categories | Default weight |
|---|---|---|
| Finance | tax_burden_score, cost_of_living_score, purchasing_power_score | 30 % |
| Safety | crime_index, political_stability, naturkatastrophen_resilienz | 20 % |
| Health | healthcare_quality, water_drinkable, air_quality_pm25 | 10 % |
| Climate | climate_comfort_score | 15 % |
| Infrastructure | internet_speed_combined, direct_flight_to_germany | 10 % |
| Social | english_proficiency, lgbtq_acceptance, expat_community | 15 % |

### Computation

```
cluster_score = average of available category scores within that cluster
total_score   = Σ (cluster_score × cluster_weight) / Σ cluster_weights_with_data
```

Weights are normalised to sum to 1 before use. Clusters where all categories are
missing are excluded from the weighted sum (the remaining weights fill the gap).

### Concrete example — Lissabon

Assume the following scores for Lisbon:

| Category | Score |
|---|---|
| tax_burden_score | 65 |
| cost_of_living_score | 65 |
| purchasing_power_score | 55 |
| crime_index | 77 |
| political_stability | 78 |
| naturkatastrophen_resilienz | 65 |
| healthcare_quality | 75 |
| water_drinkable | 82 |
| air_quality_pm25 | 80 |
| climate_comfort_score | 88 |
| internet_speed_combined | 68 |
| direct_flight_to_germany | 100 |
| english_proficiency | 65 |
| lgbtq_acceptance | 72 |
| expat_community | 80 |

**Step 1 — Cluster averages:**

| Cluster | Calculation | Score |
|---|---|---|
| Finance | (65 + 65 + 55) / 3 | 62 |
| Safety | (77 + 78 + 65) / 3 | 73 |
| Health | (75 + 82 + 80) / 3 | 79 |
| Climate | 88 / 1 | 88 |
| Infrastructure | (68 + 100) / 2 | 84 |
| Social | (65 + 72 + 80) / 3 | 72 |

**Step 2 — Weighted sum (default weights):**

```
total = (62×0.30 + 73×0.20 + 79×0.10 + 88×0.15 + 84×0.10 + 72×0.15) / 1.00
      = (18.6 + 14.6 + 7.9 + 13.2 + 8.4 + 10.8) / 1.00
      = 73.5
      ≈ 74
```

Lisbon composite score: **74 / 100**.

---

## 4. Fallback Mechanism

When a city is missing a category score:

1. **Country fallback**: average score for that category across all other cities
   in the same country (if available). `usedFallback: true` is set in the API response.
2. **Cluster partial**: if only some categories in a cluster are missing, the cluster
   average uses only the available ones.
3. **Entire cluster missing**: that cluster is excluded from the weighted sum; the
   remaining cluster weights are re-normalised to sum to 1 (so the total is not
   artificially dragged down).

The API response includes `usedFallback: boolean` and `missingCategories: string[]`
per city so the frontend can indicate data completeness.

---

## 5. Scale and Confidence

### Score scale

All scores are integers in **0–100** where higher = better for the user.
Inverted metrics (e.g. crime rate, cost of living) are transformed before storage.

| Range | Interpretation |
|---|---|
| 90–100 | Excellent |
| 75–89 | Very good |
| 50–74 | Average |
| 25–49 | Below average |
| 0–24 | Poor |

### Confidence levels

| Value | Meaning | Typical sources |
|---|---|---|
| 90 | Verified — official statistics, high sample size | Tax engine (exact calculation) |
| 80 | Reliable — well-documented index | EF EPI, Freedom House, Ookla |
| 75 | Computed — derived from other DB data | cost_of_living_score, tax_burden_score |
| 65 | Estimated — national average applied to city | UNODC, World Risk Report |
| 60 | Low — city-level data sparse or old | Smaller cities, infrequent surveys |
| 30 | Very low — rough approximation | Missing data with placeholder |

Confidence values are stored per `CityLifestyle` row and surfaced in `check-status`.

---

## 6. Update Processes

### Continuous (automated)
- Exchange rates: Cron job syncs ECB rates daily (`/api/cron/sync-exchange-rates`)

### Quarterly
- Cost of living + salary benchmarks: `npm run wherenext`
- Recompute derived scores: `npm run compute-derived`
- Internet speed: `npm run compute-derived -- --only=internet_speed_combined` (manual table update first)

### Yearly (manual review + re-import)
- Tax law changes → update `packages/tax-engine/src/countries/*.ts`, then `npm run compute-derived -- --only=tax_burden_score`
- Crime index: `npm run crime-index` (update `COUNTRY_BASE` if GPI data changed)
- English proficiency (EF EPI): update `import-scores.ts` EPI table
- LGBTQ+ acceptance (ILGA-Europe): update `import-scores.ts` Rainbow Index table
- Political stability (Freedom House): update `import-scores.ts` table
- Healthcare, disaster resilience: update manual tables in `compute-derived-scores.ts`
- Air quality (IQAir annual report): update `import-scores.ts` PM2.5 table

### Full re-import sequence

```bash
cd scripts/data-import
npm run wherenext          # CoL + salary
npm run weather            # climate
npm run pois               # POI counts
npm run crime-index        # crime
npm run compute-derived    # tax, pp, col, disaster, flights, healthcare
npm run status             # verify 32 × 14 = 448 entries at ≥95% coverage
```
