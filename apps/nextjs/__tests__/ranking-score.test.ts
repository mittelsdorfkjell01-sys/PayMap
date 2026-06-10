import { describe, it, expect } from 'vitest';
import {
  computeClusterScore,
  normalizeClusterWeights,
  DEFAULT_CLUSTER_WEIGHTS,
  type ClusterWeights,
} from '../lib/ranking-score';

// ─── Mock city scores ─────────────────────────────────────────────────────────

const WIEN: Record<string, number> = {
  // finance cluster
  tax_burden_score: 57, cost_of_living_score: 49, purchasing_power_score: 68,
  // safety cluster
  crime_index: 90, political_stability: 85, naturkatastrophen_resilienz: 80,
  // health cluster
  healthcare_quality: 82, water_drinkable: 90, air_quality_pm25: 72,
  // climate cluster
  climate_comfort_score: 62,
  // infrastructure cluster
  internet_speed_combined: 75, direct_flight_to_germany: 100,
  // social cluster
  english_proficiency: 70, lgbtq_acceptance: 78, expat_community: 70,
};

const DUBAI: Record<string, number> = {
  tax_burden_score: 100, cost_of_living_score: 47, purchasing_power_score: 78,
  crime_index: 80, political_stability: 62, naturkatastrophen_resilienz: 80,
  healthcare_quality: 75, water_drinkable: 72, air_quality_pm25: 55,
  climate_comfort_score: 60,
  internet_speed_combined: 72, direct_flight_to_germany: 100,
  english_proficiency: 80, lgbtq_acceptance: 10, expat_community: 95,
};

const LISSABON: Record<string, number> = {
  tax_burden_score: 65, cost_of_living_score: 65, purchasing_power_score: 55,
  crime_index: 77, political_stability: 78, naturkatastrophen_resilienz: 65,
  healthcare_quality: 75, water_drinkable: 82, air_quality_pm25: 80,
  climate_comfort_score: 88,  // sunny / warm
  internet_speed_combined: 68, direct_flight_to_germany: 100,
  english_proficiency: 65, lgbtq_acceptance: 72, expat_community: 80,
};

const MEXIKO_CITY: Record<string, number> = {
  tax_burden_score: 70, cost_of_living_score: 73, purchasing_power_score: 40,
  crime_index: 38, political_stability: 50, naturkatastrophen_resilienz: 45,
  healthcare_quality: 55, water_drinkable: 55, air_quality_pm25: 45,
  climate_comfort_score: 72,
  internet_speed_combined: 55, direct_flight_to_germany: 60,
  english_proficiency: 35, lgbtq_acceptance: 55, expat_community: 50,
};

// ─── Test 1: Default weights → plausible ordering ─────────────────────────────

describe('computeClusterScore — default weights', () => {
  it('Wien ranks higher than Mexiko City overall', () => {
    const wien    = computeClusterScore(WIEN);
    const mexico  = computeClusterScore(MEXIKO_CITY);
    expect(wien.total).toBeGreaterThan(mexico.total);
  });

  it('returns all 7 cluster breakdown keys', () => {
    const result = computeClusterScore(WIEN);
    const keys = Object.keys(result.breakdown);
    expect(keys).toContain('finance');
    expect(keys).toContain('safety');
    expect(keys).toContain('health');
    expect(keys).toContain('climate');
    expect(keys).toContain('infrastructure');
    expect(keys).toContain('social');
    expect(keys).toContain('access');
  });

  it('total is between 0 and 100', () => {
    for (const city of [WIEN, DUBAI, LISSABON, MEXIKO_CITY]) {
      const { total } = computeClusterScore(city);
      expect(total).toBeGreaterThanOrEqual(0);
      expect(total).toBeLessThanOrEqual(100);
    }
  });
});

// ─── Test 2: finance:1 → Dubai/UAE wins (0% tax) ─────────────────────────────

describe('computeClusterScore — finance:1 weights', () => {
  const financeWeights: ClusterWeights = {
    finance: 1, safety: 0, health: 0, climate: 0, infrastructure: 0, social: 0, access: 0,
  };

  it('Dubai ranks higher than Wien on pure finance', () => {
    const dubai = computeClusterScore(DUBAI, financeWeights);
    const wien  = computeClusterScore(WIEN,  financeWeights);
    expect(dubai.total).toBeGreaterThan(wien.total);
  });

  it('breakdown.finance equals the finance cluster average', () => {
    const { breakdown } = computeClusterScore(DUBAI, financeWeights);
    const expected = Math.round((DUBAI.tax_burden_score + DUBAI.cost_of_living_score + DUBAI.purchasing_power_score) / 3);
    expect(breakdown.finance).toBe(expected);
  });
});

// ─── Test 3: safety:1 → Wien wins ────────────────────────────────────────────

describe('computeClusterScore — safety:1 weights', () => {
  const safetyWeights: ClusterWeights = {
    finance: 0, safety: 1, health: 0, climate: 0, infrastructure: 0, social: 0, access: 0,
  };

  it('Wien ranks higher than Dubai on pure safety', () => {
    const wien  = computeClusterScore(WIEN,  safetyWeights);
    const dubai = computeClusterScore(DUBAI, safetyWeights);
    expect(wien.total).toBeGreaterThan(dubai.total);
  });
});

// ─── Test 4: climate:1 → sunny Lissabon wins ─────────────────────────────────

describe('computeClusterScore — climate:1 weights', () => {
  const climateWeights: ClusterWeights = {
    finance: 0, safety: 0, health: 0, climate: 1, infrastructure: 0, social: 0, access: 0,
  };

  it('Lissabon (high climate_comfort_score) beats Wien', () => {
    const lisbon = computeClusterScore(LISSABON, climateWeights);
    const wien   = computeClusterScore(WIEN,     climateWeights);
    expect(lisbon.total).toBeGreaterThan(wien.total);
  });
});

// ─── Test 5: missing data → usedFallback + missingCategories ─────────────────

describe('computeClusterScore — missing data', () => {
  const SPARSE: Record<string, number> = {
    tax_burden_score: 70,
    crime_index: 75,
    // everything else missing
  };

  it('sets usedFallback=true when fallback is used', () => {
    const fallback = { political_stability: 72, naturkatastrophen_resilienz: 68 };
    const { usedFallback } = computeClusterScore(SPARSE, undefined, fallback);
    expect(usedFallback).toBe(true);
  });

  it('lists missing categories', () => {
    const { missingCategories } = computeClusterScore(SPARSE);
    expect(missingCategories).toContain('purchasing_power_score');
    expect(missingCategories).toContain('cost_of_living_score');
    expect(missingCategories).toContain('healthcare_quality');
  });

  it('usedFallback=false when no fallback provided', () => {
    const { usedFallback } = computeClusterScore(SPARSE);
    expect(usedFallback).toBe(false);
  });

  it('still produces a valid total for sparse data', () => {
    const { total } = computeClusterScore(SPARSE);
    expect(total).toBeGreaterThanOrEqual(0);
    expect(total).toBeLessThanOrEqual(100);
  });
});

// ─── Test 6: non-normalised weights are correctly normalised ──────────────────

describe('normalizeClusterWeights', () => {
  it('normalises weights summing to 2 to sum to 1', () => {
    const raw: ClusterWeights = {
      finance: 0.6, safety: 0.4, health: 0.2, climate: 0.3, infrastructure: 0.2, social: 0.3, access: 0.1,
    };
    const norm = normalizeClusterWeights(raw);
    const total = Object.values(norm).reduce((s, v) => s + v, 0);
    expect(total).toBeCloseTo(1, 5);
  });

  it('falls back to DEFAULT_CLUSTER_WEIGHTS when all zeros', () => {
    const raw: ClusterWeights = { finance: 0, safety: 0, health: 0, climate: 0, infrastructure: 0, social: 0, access: 0 };
    const norm = normalizeClusterWeights(raw);
    expect(norm).toEqual(DEFAULT_CLUSTER_WEIGHTS);
  });

  it('computeClusterScore applies non-normalised weights correctly via internal normalisation', () => {
    const doubleWeights: ClusterWeights = {
      finance: 0.60, safety: 0.40, health: 0.20, climate: 0.30, infrastructure: 0.20, social: 0.30, access: 0.10,
    };
    const r1 = computeClusterScore(WIEN);
    const r2 = computeClusterScore(WIEN, doubleWeights);
    expect(r1.total).toBe(r2.total);
  });
});
