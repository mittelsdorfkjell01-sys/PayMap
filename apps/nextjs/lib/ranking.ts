import { SCORE_CAT, type ScoreCategoryValue } from './score-categories';

// ─── Weights ─────────────────────────────────────────────────────────────────

/** Weights keyed by SCORE_CAT value strings (e.g. 'tax_burden_score'). */
export type RankingWeights = Partial<Record<ScoreCategoryValue, number>>;

/** Sensible defaults — must sum to 1.0 (enforced at runtime via normalizeWeights). */
export const DEFAULT_WEIGHTS: RankingWeights = {
  [SCORE_CAT.TAX_BURDEN_SCORE]:        0.25,
  [SCORE_CAT.COST_OF_LIVING_SCORE]:    0.20,
  [SCORE_CAT.CRIME_INDEX]:             0.12,
  [SCORE_CAT.PURCHASING_POWER_SCORE]:  0.12,
  [SCORE_CAT.POLITICAL_STABILITY]:     0.08,
  [SCORE_CAT.HEALTHCARE_QUALITY]:      0.07,
  [SCORE_CAT.AIR_QUALITY_PM25]:        0.06,
  [SCORE_CAT.LGBTQ_ACCEPTANCE]:        0.04,
  [SCORE_CAT.ENGLISH_PROFICIENCY]:     0.03,
  [SCORE_CAT.INTERNET_SPEED_COMBINED]: 0.02,
  [SCORE_CAT.DIRECT_FLIGHT_DE]:        0.01,
};

/**
 * Returns a copy of `weights` where values sum to 1.
 * Entries with weight ≤ 0 are dropped.
 */
export function normalizeWeights(weights: RankingWeights): Record<string, number> {
  const positive = Object.entries(weights).filter(([, w]) => w != null && w > 0) as [string, number][];
  const total = positive.reduce((s, [, w]) => s + w, 0);
  if (total === 0) return normalizeWeights(DEFAULT_WEIGHTS);
  const out: Record<string, number> = {};
  for (const [k, w] of positive) out[k] = w / total;
  return out;
}

/**
 * Computes a 0–100 composite score for a city.
 *
 * @param cityScores  Map of category → score (0–100). Missing categories are skipped.
 * @param weights     Already-normalised weights (call normalizeWeights first).
 *
 * When a city is missing a weighted category the remaining weights are
 * re-normalised on the fly so the result is never dragged down by absent data.
 */
export function computeWeightedScore(
  cityScores: Record<string, number>,
  weights: Record<string, number>,
): number {
  let weightedSum = 0;
  let coveredWeight = 0;

  for (const [category, w] of Object.entries(weights)) {
    const score = cityScores[category];
    if (score == null) continue;
    weightedSum  += score * w;
    coveredWeight += w;
  }

  if (coveredWeight === 0) return 50;
  return Math.round(weightedSum / coveredWeight);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Maps a sorted array of numbers to 0–100 (min → 0, max → 100). */
export function normalizeToScale(values: number[]): number[] {
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (max === min) return values.map(() => 50);
  return values.map((v) => Math.round(((v - min) / (max - min)) * 100));
}

/**
 * Parses a JSON weights string from a query parameter.
 * Falls back to DEFAULT_WEIGHTS on any parse/validation error.
 */
export function parseWeightsParam(raw: string | null): RankingWeights {
  if (!raw) return DEFAULT_WEIGHTS;
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return DEFAULT_WEIGHTS;
    // Validate: only known SCORE_CAT values and numeric weights
    const validCats = new Set<string>(Object.values(SCORE_CAT));
    const weights: RankingWeights = {};
    for (const [k, v] of Object.entries(parsed)) {
      if (validCats.has(k) && typeof v === 'number' && v >= 0) {
        (weights as Record<string, number>)[k] = v;
      }
    }
    return Object.keys(weights).length > 0 ? weights : DEFAULT_WEIGHTS;
  } catch {
    return DEFAULT_WEIGHTS;
  }
}
