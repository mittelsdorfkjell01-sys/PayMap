// Cluster-based ranking aggregation.
// Sits alongside lib/ranking.ts (per-category weights) and adds a cluster
// breakdown view, country-level fallback, and usedFallback / missingCategories tracking.
//
// SINGLE SOURCE OF TRUTH: clusters, their category members and the default
// weights all come from lib/score-categories.ts. This file must never define a
// second list — it only re-exports and consumes the canonical definitions.

import {
  CLUSTER_KEYS,
  type ClusterKey,
  CLUSTER_CATEGORIES,
  DEFAULT_CLUSTER_WEIGHTS,
} from './score-categories';

// Re-export the canonical pieces so existing importers keep working.
export { CLUSTER_CATEGORIES, DEFAULT_CLUSTER_WEIGHTS, CLUSTER_KEYS };
export type { ClusterKey };

/** Cluster weights keyed by the canonical ClusterKey (all 7 clusters). */
export type ClusterWeights = Record<ClusterKey, number>;

export interface ClusterScoreResult {
  total:             number;
  breakdown:         Record<ClusterKey, number>;
  usedFallback:      boolean;
  missingCategories: string[];
}

// Normalise weights so they sum to 1. Returns DEFAULT_CLUSTER_WEIGHTS if total is 0.
export function normalizeClusterWeights(weights: ClusterWeights): ClusterWeights {
  const total = Object.values(weights).reduce((s, v) => s + v, 0);
  if (total === 0) return { ...DEFAULT_CLUSTER_WEIGHTS };
  const out = {} as ClusterWeights;
  for (const k of Object.keys(weights) as ClusterKey[]) {
    out[k] = weights[k] / total;
  }
  return out;
}

/**
 * Compute a 0–100 composite score via weighted clusters.
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
  const breakdown        = {} as Record<ClusterKey, number>;
  const missingCategories: string[] = [];
  let usedFallback       = false;
  let weightedSum        = 0;
  let coveredWeight      = 0;

  for (const cluster of CLUSTER_KEYS) {
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
      // Entire cluster missing — excluded from total (remaining weights re-normalised below).
      // 50 is a neutral display placeholder only; it never feeds the weighted total.
      breakdown[cluster] = 50;
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
  const hasAny = CLUSTER_KEYS.some((k) => params.has(k));
  if (!hasAny) return null;

  const w: ClusterWeights = { ...DEFAULT_CLUSTER_WEIGHTS };
  for (const k of CLUSTER_KEYS) {
    const raw = params.get(k);
    if (raw == null) continue;
    const v = parseFloat(raw);
    if (!isNaN(v) && v >= 0) w[k] = v;
  }
  return w;
}
