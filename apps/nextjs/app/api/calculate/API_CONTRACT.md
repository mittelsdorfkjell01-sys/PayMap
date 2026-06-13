# `POST /api/calculate` — API contract

The calculator backend is **precise-only**. The approximate mode and its
`netMonthlyMin/Max` range were removed. The three precise fields are **required**;
a missing one returns `400` by design (the UI must always send them — there is no
default fallback).

## Request body (JSON)

| Field              | Type                        | Req. | Notes |
|--------------------|-----------------------------|------|-------|
| `fromCity`         | string                      | ✓    | slug / name; resolved via `findCity` |
| `toCity`           | string                      | ✓    | slug / name |
| `grossSalary`      | number (EUR/yr, >0)         | ✓    | input is in EUR; converted to each city's currency before the engine runs |
| `employment`       | `employed\|freelancer\|founder\|passive` | ✓ | |
| `familyStatus`     | `single\|married\|divorced` | ✓    | |
| `children`         | int 0–20                    | ✓    | |
| `kvType`           | `statutory\|private`        | –    | DE health-insurance type |
| `privateKvPremium` | number (monthly)            | –    | DE PKV premium when `kvType='private'` |
| `specialRegimeId`  | string                      | –    | overrides the auto-picked to-country regime in the engine calc |
| `partnerGross`     | number                      | –    | DE Ehegatten-Splitting |
| `churchMember`     | boolean                     | –    | DE church tax |
| `bundesland`       | string                      | –    | DE church-tax rate variant |
| `moveYear`         | int 2000–2100               | –    | feeds derived eligibility rules (residency-start year) |
| `attestations`     | `Record<string, boolean>`   | –    | answers to attested eligibility rules, keyed by rule `id` |
| `year`             | int 2020–2030               | –    | defaults to the current year |
| `locale`           | `de\|en` (default `de`)     | –    | |
| `persistShare`     | boolean                     | –    | force-save the calculation for sharing |

## Response body (200)

```ts
{
  isApproximate: false,                       // always false
  fromCity: { id, slug, nameDE, nameEN, flag, currency, countrySlug },
  toCity:   { id, slug, nameDE, nameEN, flag, currency, countrySlug },
  from: TaxResult & { netMonthlyEUR: number | null },
  to:   TaxResult & { netMonthlyEUR: number | null },
  monthlyDifference: number,                  // EUR, to-net − from-net (rounded)
  equivalenceSalary: number | null,           // gross in fromCity matching to-net

  // Category-aligned, EUR/month. Order: income_tax, surcharge, church_tax,
  // social_health, social_pension, social_unemployment, social_care.
  // A category present on only one side → null on the other; diffEUR = toEUR − fromEUR.
  taxBreakdown: Array<{
    category: BreakdownCategory,
    labelDE: string, labelEN: string,
    fromEUR: number | null, toEUR: number | null, diffEUR: number,
  }>,

  // null sides when the city has no `index_cost` cost-of-living item.
  costOfLiving: {
    from: { indexCost: number, indexRent: number | null } | null,
    to:   { indexCost: number, indexRent: number | null } | null,
  },

  // null unless both cities have index_cost and from-net is known.
  // toNetInHomeCostEUR = round(toNetMonthlyEUR * fromIndexCost / toIndexCost)
  // diffEUR = toNetInHomeCostEUR − round(fromNetMonthlyEUR)
  // ratio   = round((toNetInHomeCostEUR / fromNetEUR) * 100) / 100
  purchasingPower: {
    fromNetEUR: number, toNetEUR: number,
    toNetInHomeCostEUR: number, diffEUR: number, ratio: number,
  } | null,

  // null when the to-country has no special regime.
  eligibility: {
    regimeSlug: string, regimeNameDE: string, regimeNameEN: string,
    verdict: 'eligible' | 'likely' | 'not_eligible' | 'needs_input',
    rules: Array<{ rule: EligibilityRule, status: 'pass'|'fail'|'unknown'|'advisory' }>,
    riskLevel: string, requiresLegalAdvice: boolean,
    regimeEffect: string | null, sourceUrl: string | null,
  } | null,

  lifestyle: { from: Record<string, number>, to: Record<string, number> },

  // Regime net is recomputed ONLY when regimeEffect ∈ {replaces_income_tax,
  // reduces_taxable_base}. For all other effects hasEffect=false and the net
  // mirrors the normal tariff (no misleading number).
  taxWithRegime: {
    netMonthly: number, netMonthlyEUR: number | null, netAnnual: number,
    effectiveRate: number, regimeId: string, regimeSlug: string,
    regimeNameDE: string, regimeNameEN: string, conditionsDE: string | null,
    flatRate: number | null, savings: number, hasEffect: boolean,
  } | null,

  fxStale: boolean,
  shareToken: string,
}
```

## Error responses

| Status | When |
|--------|------|
| `400`  | invalid JSON, or a missing/invalid required field (`fromCity`, `toCity`, `grossSalary`, `employment`, `familyStatus`, `children`) |
| `404`  | `{ code: 'CITY_NOT_FOUND' }` — from/to city not resolvable |
| `503`  | `{ code: 'FX_RATE_UNAVAILABLE' }` — no exchange rate for a non-EUR city |
| `429`  | rate limit (via `checkRateLimit`) |

## Graceful degradation

Without seeded `CostOfLivingItem` rows or backfilled `eligibilityCriteria`, the
endpoint returns `costOfLiving: { from: null, to: null }`, `purchasingPower: null`,
and (when no regime exists) `eligibility: null` — never a crash. A regime with no
backfilled criteria yields `eligibility.verdict = 'eligible'` with an empty
`rules` array.
