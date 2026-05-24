# scripts/data-import

One-shot and recurring data importers for the PayMap database. All scripts are
idempotent (safe to re-run), support `--dry-run`, and log structured output.

## Scripts

### Data importers

| Command | Script | Source | Target models |
|---|---|---|---|
| `npm run wherenext` | `import-wherenext.ts` | getwherenext.com (CC BY 4.0) | `CostOfLivingItem`, `CountrySalaryBenchmark`, `output/wherenext-visa-reference.json` |
| `npm run weather` | `import-weather.ts` | Open-Meteo Archive API (free) | `CityWeather` |
| `npm run pois` | `import-pois.ts` | Overpass / OpenStreetMap (ODbL) | `CityLifestyle` (counts), `CityPOI` (named) |
| `npm run visa` | `import-visa-csv.ts` | Hand-maintained CSV | `VisaRule` |
| `npm run generate-template` | `generate-visa-template.ts` | DB countries | `data/visa-rules-template.csv` |

### Score importers

| Command | Script | Source | Frequency |
|---|---|---|---|
| `npm run crime-index` | `import-crime-index.ts` | UNODC + Global Peace Index 2025 | yearly |
| `npm run compute-derived` | `compute-derived-scores.ts` | DB data + Tax Engine + manual tables | after every data change |

`compute-derived` computes 6 score categories:

| Category | Source |
|---|---|
| `cost_of_living_score` | `CostOfLivingItem.total_monthly_estimate` (normalised) |
| `purchasing_power_score` | Salary benchmark minus CoL, via tax engine |
| `tax_burden_score` | Tax engine at 60k EUR, single, childless |
| `naturkatastrophen_resilienz` | World Risk Report 2024 (manual, country-level) |
| `direct_flight_to_germany` | Flightradar24 / IATA schedules (manual, city-level) |
| `healthcare_quality` | WHO HALE + Numbeo Health Care Index 2024 (manual, country-level) |

### Status

| Command | Script | Notes |
|---|---|---|
| `npm run status` | `check-status.ts` | DB read-only; shows coverage per score category |

## Quick start

```bash
# Copy .env from project root (DATABASE_URL must point to your Neon DB)
cd scripts/data-import

# Dry-run any importer before writing
npm run weather -- --dry-run
npm run crime-index -- --dry-run
npm run compute-derived -- --dry-run
npm run compute-derived -- --dry-run --only=tax_burden_score

# Check current DB coverage
npm run status
```

## Full import run (first-time setup)

Run in this order to satisfy data dependencies:

```bash
# 1. Cost of living + salary benchmarks (needed by compute-derived)
npm run wherenext

# 2. Climate data
npm run weather

# 3. POI counts (coworking, hospitals, consulates, schools)
npm run pois

# 4. Score categories from external sources
npm run crime-index

# 5. Derived scores (depends on CoL from step 1 and tax engine)
npm run compute-derived

# 6. Verify coverage
npm run status
```

## Annual update schedule

| Quarter | Tasks |
|---|---|
| Q1 | Exchange rates (continuous cron), air quality update, internet speed update |
| Q2 | `npm run wherenext` (salary + CoL refresh), `npm run compute-derived` |
| Q3 | `npm run wherenext` (salary + CoL refresh), `npm run compute-derived` |
| Q4 | Check tax law changes for next year, `npm run crime-index`, EF EPI update (english_proficiency), Freedom House update (political_stability + political_freedom), `npm run compute-derived` |

## Per-script notes

### import-wherenext.ts
- `--years=N` (default 30) — unused for CoL, affects log header only
- Writes 10 `CostOfLivingItem` rows per city: `total_monthly_estimate` + 4 derived categories + 5 raw indices
- Tax cross-check: compares WhereNext effective rate against `@paymap/tax-engine`; warns on >5 pp divergence
- Visa reference: writes `output/wherenext-visa-reference.json` for manual review (not imported to DB)

### import-weather.ts
- `--years=N` (default 30) — historical window for 30-year climate averages
- Rate limit: Open-Meteo allows ~2 req/45 s. Script uses 3 s inter-city delay + 60 s retry on 429 + 2-pass retry queue
- Big-diff warnings (>30 %) are expected when replacing hand-seeded data; review but do not be alarmed

### import-pois.ts
- Radius: 15 km around city lat/lng
- Queries: coworking, hospitals, German consulates, German schools
- Named POIs replaced wholesale per city + type on each run

### import-crime-index.ts
- Country base scores from UNODC homicide rates 2023 + GPI 2025 (inverted, rescaled to 0-100)
- City modifiers reflect large-city crime premium/discount vs national average
- `--dry-run` prints computed scores without writing

### compute-derived-scores.ts
- `--dry-run` — preview without DB writes
- `--only=<category>` — run a single score type (e.g. `--only=tax_burden_score`)
- `tax_burden_score` must run before `purchasing_power_score` (effective rate reused)

### import-visa-csv.ts
- Input: `data/visa-rules.csv` (gitignored) or `--file=path/to/file.csv`
- Unique key: `(country_slug, from_nationality, visa_type)` — safe to re-run

## Rate limits & re-runs

| API | Limit | Mitigation |
|---|---|---|
| Open-Meteo Archive | ~2 req / 45 s | 3 s delay + 60 s retry + 120 s cool-down pass |
| Overpass | ~1–2 req / 10 s | 3 s delay + exponential backoff (30 → 120 s) |
| getwherenext.com | None observed | 500 ms delay |

If a run ends with skipped cities, simply re-run — the script will skip already-written rows and only fetch the missing ones.

## Attribution

| Source | Licence |
|---|---|
| WhereNext / getwherenext.com | CC BY 4.0 |
| Open-Meteo | CC BY 4.0 |
| OpenStreetMap / Overpass | ODbL 1.0 |
| Frankfurter (ECB data) | Public domain |
| UNODC Statistics | Public domain |
| Global Peace Index (IEP) | CC BY 4.0 |
| WHO HALE | CC BY-NC-SA 3.0 IGO |
| World Risk Report | CC BY 4.0 |
