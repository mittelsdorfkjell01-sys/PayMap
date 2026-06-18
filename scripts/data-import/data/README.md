# data/

This directory holds hand-maintained CSV files that feed the `import-visa-csv.ts` importer.

## Files

| File | Purpose |
|---|---|
| `visa-rules-template.csv` | Generated template — one row per active country (all fields empty). Run `npm run generate-template` to regenerate. |
| `visa-rules.csv` | The live file read by `import-visa-csv.ts`. Not committed — copy from template and fill in. |
| `visa-rules.sample.csv` | Five example rows (PT D8, PT NHR, ES Freelance, GE visa-free, TH exempt) for reference. |

## Columns

| Column | Type | Notes |
|---|---|---|
| `country_slug` | string | Must match a slug in the `Country` table (e.g. `pt`, `de`, `th`) |
| `from_nationality` | string | ISO 3166-1 alpha-2 (e.g. `DE`, `AT`, `CH`) |
| `visa_type` | string | Snake-case identifier (e.g. `digital_nomad`, `tourist_visa_exempt`) |
| `name_de` | string | German display name |
| `name_en` | string | English display name |
| `requirements_de` | string | Full requirements text in German |
| `requirements_en` | string | Full requirements text in English |
| `processing_days` | string | Human-readable (e.g. `30-60 Werktage`); not a number |
| `cost_eur` | int \| empty | Application fee in EUR; leave empty if none |
| `min_income_eur` | int \| empty | Minimum monthly income in EUR; leave empty if not required |
| `duration_months` | int \| empty | Max duration of single grant; leave empty if unlimited |
| `renewable` | `true`/`false` | Whether the visa/permit can be renewed |
| `path_citizenship_years` | int \| empty | Years until citizenship path opens; leave empty if not applicable |
| `source_url` | string | Official government URL (required) |

## Workflow

```bash
# 1. Generate a fresh template from the current DB countries
npm run generate-template

# 2. Copy template to the live file and fill in data
cp data/visa-rules-template.csv data/visa-rules.csv
# … edit visa-rules.csv in Excel / Google Sheets …

# 3. Dry-run to verify
npm run visa -- --dry-run

# 4. Live import
npm run visa
```

The importer is **idempotent**: re-running overwrites existing rows matched by
`(country_slug, from_nationality, visa_type)`.

## Notes

- Fields with commas, quotes, or line-breaks must be wrapped in double-quotes per RFC 4180.
- `visa-rules.csv` is gitignored — it may contain sensitive source URLs or draft content.


noch offen: Die Migrationen sind committet aber nicht deployed. Vor Wirksamkeit auf prod Neon DB: prisma migrate deploy + npm run db:seed (mirror-t Engine-Werte inkl. Region/Surcharge/FixedAmount in die DB). Ich habe nichts an der Prod-DB ausgeführt.

