// ─────────────────────────────────────────────────────────────────────────────
// THE single source of truth for score categories & clusters.
//
// Category keys, display names (DE/EN), cluster assignment, sort direction and
// the default cluster weights are ALL defined here. Everything else
// (ranking-score.ts clusters, RankingPage weight keys, the ranking API, admin)
// derives from this file — there must never be a second list.
//
// A regression test (__tests__/score-categories.test.ts) fails if any other
// list uses a key that is not defined here, or if a category is not assigned to
// exactly one cluster.
// ─────────────────────────────────────────────────────────────────────────────

// Category value constants used in CityLifestyle.category.
export const SCORE_CAT = {
  // Finanzen
  TAX_BURDEN_SCORE:        'tax_burden_score',
  COST_OF_LIVING_SCORE:    'cost_of_living_score',
  PURCHASING_POWER_SCORE:  'purchasing_power_score',
  CURRENCY_STABILITY:      'currency_stability',
  // Sicherheit & Stabilität
  CRIME_INDEX:             'crime_index',
  POLITICAL_STABILITY:     'political_stability',
  POLITICAL_FREEDOM:       'political_freedom',
  NATURKATASTROPHEN:       'naturkatastrophen_resilienz',
  // Gesundheit & Umwelt
  HEALTHCARE_QUALITY:      'healthcare_quality',
  HEALTHCARE_ACCESS_COST:  'healthcare_access_cost',
  WATER_DRINKABLE:         'water_drinkable',
  AIR_QUALITY_PM25:        'air_quality_pm25',
  // Klima
  CLIMATE_COMFORT_SCORE:   'climate_comfort_score',
  // Infrastruktur & Remote
  INTERNET_SPEED_COMBINED: 'internet_speed_combined',
  DIRECT_FLIGHT_DE:        'direct_flight_to_germany',
  TIMEZONE_OVERLAP_CET:    'timezone_overlap_cet',
  // Soziales & Integration
  ENGLISH_PROFICIENCY:     'english_proficiency',
  LGBTQ_ACCEPTANCE:        'lgbtq_acceptance',
  EXPAT_COMMUNITY:         'expat_community',
  FAMILY_FRIENDLINESS:     'family_friendliness',
  // Zugang & Aufenthalt
  VISA_ACCESSIBILITY:      'visa_accessibility',
} as const;

export type ScoreCategoryKey = keyof typeof SCORE_CAT;
export type ScoreCategoryValue = (typeof SCORE_CAT)[ScoreCategoryKey];

// ─── Clusters ────────────────────────────────────────────────────────────────

export const CLUSTER_KEYS = [
  'finance',
  'safety',
  'health',
  'climate',
  'infrastructure',
  'social',
  'access',
] as const;
export type ClusterKey = (typeof CLUSTER_KEYS)[number];

export interface ClusterMeta {
  nameDE: string;
  nameEN: string;
  // Default weight in the composite score. The seven values sum to 1.
  defaultWeight: number;
}

export const CLUSTER_META: Record<ClusterKey, ClusterMeta> = {
  finance:        { nameDE: 'Finanzen',                 nameEN: 'Finance',                   defaultWeight: 0.28 },
  safety:         { nameDE: 'Sicherheit & Stabilität',  nameEN: 'Safety & Stability',        defaultWeight: 0.18 },
  health:         { nameDE: 'Gesundheit & Umwelt',      nameEN: 'Health & Environment',      defaultWeight: 0.12 },
  climate:        { nameDE: 'Klima',                    nameEN: 'Climate',                   defaultWeight: 0.12 },
  infrastructure: { nameDE: 'Infrastruktur & Remote',   nameEN: 'Infrastructure & Remote',   defaultWeight: 0.10 },
  social:         { nameDE: 'Soziales & Integration',   nameEN: 'Social & Integration',      defaultWeight: 0.12 },
  access:         { nameDE: 'Zugang & Aufenthalt',      nameEN: 'Access & Residency',        defaultWeight: 0.08 },
};

// ─── Categories ──────────────────────────────────────────────────────────────

export interface CategoryMeta {
  key: ScoreCategoryValue;
  nameDE: string;
  nameEN: string;
  cluster: ClusterKey;
  // Every score is normalised to 0–100 with "higher = better" so a single sort
  // direction applies everywhere. Kept explicit so a future inverted metric
  // cannot silently break sorting.
  higherIsBetter: true;
}

export const CATEGORY_META: Record<ScoreCategoryValue, CategoryMeta> = {
  // Finanzen
  [SCORE_CAT.TAX_BURDEN_SCORE]:       { key: SCORE_CAT.TAX_BURDEN_SCORE,       nameDE: 'Steuerlast',            nameEN: 'Tax burden',            cluster: 'finance', higherIsBetter: true },
  [SCORE_CAT.COST_OF_LIVING_SCORE]:   { key: SCORE_CAT.COST_OF_LIVING_SCORE,   nameDE: 'Lebenshaltungskosten',  nameEN: 'Cost of living',        cluster: 'finance', higherIsBetter: true },
  [SCORE_CAT.PURCHASING_POWER_SCORE]: { key: SCORE_CAT.PURCHASING_POWER_SCORE, nameDE: 'Kaufkraft',             nameEN: 'Purchasing power',      cluster: 'finance', higherIsBetter: true },
  [SCORE_CAT.CURRENCY_STABILITY]:     { key: SCORE_CAT.CURRENCY_STABILITY,     nameDE: 'Währungsstabilität',    nameEN: 'Currency stability',    cluster: 'finance', higherIsBetter: true },
  // Sicherheit & Stabilität
  [SCORE_CAT.CRIME_INDEX]:            { key: SCORE_CAT.CRIME_INDEX,            nameDE: 'Sicherheit',            nameEN: 'Safety',                cluster: 'safety', higherIsBetter: true },
  [SCORE_CAT.POLITICAL_STABILITY]:    { key: SCORE_CAT.POLITICAL_STABILITY,    nameDE: 'Politische Stabilität', nameEN: 'Political stability',   cluster: 'safety', higherIsBetter: true },
  [SCORE_CAT.POLITICAL_FREEDOM]:      { key: SCORE_CAT.POLITICAL_FREEDOM,      nameDE: 'Politische Freiheit',   nameEN: 'Political freedom',     cluster: 'safety', higherIsBetter: true },
  [SCORE_CAT.NATURKATASTROPHEN]:      { key: SCORE_CAT.NATURKATASTROPHEN,      nameDE: 'Naturkatastrophen-Resilienz', nameEN: 'Disaster resilience', cluster: 'safety', higherIsBetter: true },
  // Gesundheit & Umwelt
  [SCORE_CAT.HEALTHCARE_QUALITY]:     { key: SCORE_CAT.HEALTHCARE_QUALITY,     nameDE: 'Gesundheitsversorgung', nameEN: 'Healthcare quality',    cluster: 'health', higherIsBetter: true },
  [SCORE_CAT.HEALTHCARE_ACCESS_COST]: { key: SCORE_CAT.HEALTHCARE_ACCESS_COST, nameDE: 'Gesundheit: Zugang & Kosten', nameEN: 'Healthcare access & cost', cluster: 'health', higherIsBetter: true },
  [SCORE_CAT.WATER_DRINKABLE]:        { key: SCORE_CAT.WATER_DRINKABLE,        nameDE: 'Trinkwasser',           nameEN: 'Drinkable water',       cluster: 'health', higherIsBetter: true },
  [SCORE_CAT.AIR_QUALITY_PM25]:       { key: SCORE_CAT.AIR_QUALITY_PM25,       nameDE: 'Luftqualität',          nameEN: 'Air quality',           cluster: 'health', higherIsBetter: true },
  // Klima
  [SCORE_CAT.CLIMATE_COMFORT_SCORE]:  { key: SCORE_CAT.CLIMATE_COMFORT_SCORE,  nameDE: 'Klimakomfort',          nameEN: 'Climate comfort',       cluster: 'climate', higherIsBetter: true },
  // Infrastruktur & Remote
  [SCORE_CAT.INTERNET_SPEED_COMBINED]:{ key: SCORE_CAT.INTERNET_SPEED_COMBINED, nameDE: 'Internet-Geschwindigkeit', nameEN: 'Internet speed',     cluster: 'infrastructure', higherIsBetter: true },
  [SCORE_CAT.DIRECT_FLIGHT_DE]:       { key: SCORE_CAT.DIRECT_FLIGHT_DE,       nameDE: 'Direktflug nach DE',    nameEN: 'Direct flight to Germany', cluster: 'infrastructure', higherIsBetter: true },
  [SCORE_CAT.TIMEZONE_OVERLAP_CET]:   { key: SCORE_CAT.TIMEZONE_OVERLAP_CET,   nameDE: 'Zeitzonen-Überlappung (CET)', nameEN: 'Timezone overlap (CET)', cluster: 'infrastructure', higherIsBetter: true },
  // Soziales & Integration
  [SCORE_CAT.ENGLISH_PROFICIENCY]:    { key: SCORE_CAT.ENGLISH_PROFICIENCY,    nameDE: 'Englischkenntnisse',    nameEN: 'English proficiency',   cluster: 'social', higherIsBetter: true },
  [SCORE_CAT.LGBTQ_ACCEPTANCE]:       { key: SCORE_CAT.LGBTQ_ACCEPTANCE,       nameDE: 'LGBTQ-Akzeptanz',       nameEN: 'LGBTQ acceptance',      cluster: 'social', higherIsBetter: true },
  [SCORE_CAT.EXPAT_COMMUNITY]:        { key: SCORE_CAT.EXPAT_COMMUNITY,        nameDE: 'Expat-Community',       nameEN: 'Expat community',       cluster: 'social', higherIsBetter: true },
  [SCORE_CAT.FAMILY_FRIENDLINESS]:    { key: SCORE_CAT.FAMILY_FRIENDLINESS,    nameDE: 'Familienfreundlichkeit', nameEN: 'Family friendliness',  cluster: 'social', higherIsBetter: true },
  // Zugang & Aufenthalt
  [SCORE_CAT.VISA_ACCESSIBILITY]:     { key: SCORE_CAT.VISA_ACCESSIBILITY,     nameDE: 'Visa-Zugänglichkeit',   nameEN: 'Visa accessibility',    cluster: 'access', higherIsBetter: true },
};

// ─── Derived (do NOT hand-maintain) ──────────────────────────────────────────

export const ALL_CATEGORY_KEYS = Object.keys(CATEGORY_META) as ScoreCategoryValue[];

/** cluster → its category keys, derived from CATEGORY_META. */
export const CLUSTER_CATEGORIES: Record<ClusterKey, ScoreCategoryValue[]> = CLUSTER_KEYS.reduce(
  (acc, cluster) => {
    acc[cluster] = ALL_CATEGORY_KEYS.filter((k) => CATEGORY_META[k].cluster === cluster);
    return acc;
  },
  {} as Record<ClusterKey, ScoreCategoryValue[]>,
);

/** Default cluster weights (sum 1), derived from CLUSTER_META. */
export const DEFAULT_CLUSTER_WEIGHTS: Record<ClusterKey, number> = CLUSTER_KEYS.reduce(
  (acc, cluster) => {
    acc[cluster] = CLUSTER_META[cluster].defaultWeight;
    return acc;
  },
  {} as Record<ClusterKey, number>,
);

/** Localised display name for a category. */
export function categoryName(key: ScoreCategoryValue, locale: string): string {
  const meta = CATEGORY_META[key];
  if (!meta) return key;
  return locale === 'en' ? meta.nameEN : meta.nameDE;
}

/** Localised display name for a cluster. */
export function clusterName(key: ClusterKey, locale: string): string {
  return locale === 'en' ? CLUSTER_META[key].nameEN : CLUSTER_META[key].nameDE;
}

/**
 * Per-category default weights as 0–100 integers summing to 100, obtained by
 * splitting each cluster's default weight equally among its categories. Used by
 * the (legacy) per-category weight UI until cluster weights replace it.
 */
export function defaultCategoryWeights100(): Record<ScoreCategoryValue, number> {
  const raw = ALL_CATEGORY_KEYS.map((k) => {
    const cluster = CATEGORY_META[k].cluster;
    const n = CLUSTER_CATEGORIES[cluster].length;
    return { k, w: (DEFAULT_CLUSTER_WEIGHTS[cluster] / n) * 100 };
  });
  const out = {} as Record<ScoreCategoryValue, number>;
  let distributed = 0;
  raw.forEach(({ k, w }, i) => {
    if (i === raw.length - 1) out[k] = Math.max(0, 100 - distributed);
    else {
      const v = Math.round(w);
      out[k] = v;
      distributed += v;
    }
  });
  return out;
}
