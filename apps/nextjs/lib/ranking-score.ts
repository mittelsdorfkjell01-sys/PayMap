// Cluster-based ranking aggregation.
// Sits alongside lib/ranking.ts (per-category weights) and adds a 6-cluster
// breakdown view, country-level fallback, and usedFallback / missingCategories tracking.

export interface ClusterWeights {
  finance:        number;
  safety:         number;
  health:         number;
  climate:        number;
  infrastructure: number;
  social:         number;
}

export const DEFAULT_CLUSTER_WEIGHTS: ClusterWeights = {
  finance:        0.30,
  safety:         0.20,
  health:         0.10,
  climate:        0.15,
  infrastructure: 0.10,
  social:         0.15,
};

export const CLUSTER_CATEGORIES: Record<keyof ClusterWeights, string[]> = {
  finance:        ['tax_burden_score', 'purchasing_power_score', 'cost_of_living_score'],
  safety:         ['crime_index', 'political_stability', 'naturkatastrophen_resilienz'],
  health:         ['healthcare_quality', 'water_drinkable', 'air_quality_pm25'],
  climate:        ['climate_comfort_score'],
  infrastructure: ['internet_speed_combined', 'direct_flight_to_germany'],
  social:         ['english_proficiency', 'lgbtq_acceptance', 'expat_community'],
};

export interface ClusterScoreResult {
  total:             number;
  breakdown:         Record<keyof ClusterWeights, number>;
  usedFallback:      boolean;
  missingCategories: string[];
}

// Normalise weights so they sum to 1. Returns DEFAULT_CLUSTER_WEIGHTS if total is 0.
export function normalizeClusterWeights(weights: ClusterWeights): ClusterWeights {
  const total = Object.values(weights).reduce((s, v) => s + v, 0);
  if (total === 0) return { ...DEFAULT_CLUSTER_WEIGHTS };
  const out = {} as ClusterWeights;
  for (const k of Object.keys(weights) as (keyof ClusterWeights)[]) {
    out[k] = weights[k] / total;
  }
  return out;
}

/**
 * Compute a 0–100 composite score via 6 weighted clusters.
 *
 * @param cityScores   Full category→score map for the city.
 * @param weights      Cluster weights (will be normalised; defaults to DEFAULT_CLUSTER_WEIGHTS).
 * @param fallback     Optional country-level scores used when a city category is missing.
 */
export function computeClusterScore(
  cityScores: Record<string, number>,
  weights: ClusterWeights = DEFAULT_CLUSTER_WEIGHTS,
  fallback?: Record<string, number>,
): ClusterScoreResult {
  const norm             = normalizeClusterWeights(weights);
  const breakdown        = {} as Record<keyof ClusterWeights, number>;
  const missingCategories: string[] = [];
  let usedFallback       = false;
  let weightedSum        = 0;
  let coveredWeight      = 0;

  for (const cluster of Object.keys(CLUSTER_CATEGORIES) as (keyof ClusterWeights)[]) {
    const cats = CLUSTER_CATEGORIES[cluster];
    let sum    = 0;
    let count  = 0;

    for (const cat of cats) {
      let score = cityScores[cat];

      if (score == null && fallback) {
        score = fallback[cat];
        if (score != null) usedFallback = true;
      }

      if (score == null) {
        missingCategories.push(cat);
        continue;
      }

      sum += score;
      count++;
    }

    if (count === 0) {
      // Entire cluster missing — excluded from total (remaining weights re-normalised below)
      breakdown[cluster] = 50; // neutral placeholder for display
      continue;
    }

    const clusterScore    = Math.round(sum / count);
    breakdown[cluster]    = clusterScore;
    weightedSum          += clusterScore * norm[cluster];
    coveredWeight        += norm[cluster];
  }

  const total = coveredWeight === 0
    ? 50
    : Math.round(weightedSum / coveredWeight);

  return { total, breakdown, usedFallback, missingCategories };
}

/**
 * Parse cluster weights from URL search params.
 * Returns null when no cluster params are present (caller should use defaults).
 * Silently ignores unknown keys and negative values.
 */
export function parseClusterWeightsFromParams(params: URLSearchParams): ClusterWeights | null {
  const keys: (keyof ClusterWeights)[] = [
    'finance', 'safety', 'health', 'climate', 'infrastructure', 'social',
  ];
  const hasAny = keys.some((k) => params.has(k));
  if (!hasAny) return null;

  const w: ClusterWeights = { ...DEFAULT_CLUSTER_WEIGHTS };
  for (const k of keys) {
    const raw = params.get(k);
    if (raw == null) continue;
    const v = parseFloat(raw);
    if (!isNaN(v) && v >= 0) w[k] = v;
  }
  return w;
}
