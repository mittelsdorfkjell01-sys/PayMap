import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  SCORE_CAT,
  CATEGORY_META,
  CLUSTER_META,
  CLUSTER_KEYS,
  CLUSTER_CATEGORIES,
  DEFAULT_CLUSTER_WEIGHTS,
  ALL_CATEGORY_KEYS,
  type ScoreCategoryValue,
} from '../lib/score-categories';

const LIB = join(__dirname, '..', 'lib');
const COMPONENTS = join(__dirname, '..', 'components');

const CANONICAL = new Set<string>(Object.values(SCORE_CAT));

// ─── Invariant 1: SCORE_CAT ⇔ CATEGORY_META are the exact same key set ─────────

describe('canonical list — SCORE_CAT ⇔ CATEGORY_META', () => {
  it('every SCORE_CAT value has a CATEGORY_META entry', () => {
    for (const key of Object.values(SCORE_CAT)) {
      expect(CATEGORY_META[key], `missing meta for ${key}`).toBeDefined();
    }
  });

  it('CATEGORY_META has no key outside SCORE_CAT', () => {
    for (const key of Object.keys(CATEGORY_META)) {
      expect(CANONICAL.has(key), `${key} not in SCORE_CAT`).toBe(true);
    }
  });

  it('every category carries its own key consistently', () => {
    for (const [key, meta] of Object.entries(CATEGORY_META)) {
      expect(meta.key).toBe(key);
    }
  });
});

// ─── Invariant 2: each category assigned to exactly one valid cluster ──────────

describe('canonical list — cluster assignment', () => {
  it('every category is assigned to a valid cluster', () => {
    for (const key of ALL_CATEGORY_KEYS) {
      expect(CLUSTER_KEYS).toContain(CATEGORY_META[key].cluster);
    }
  });

  it('CLUSTER_CATEGORIES partitions all categories (each in exactly one cluster)', () => {
    const seen = new Map<ScoreCategoryValue, number>();
    for (const cluster of CLUSTER_KEYS) {
      for (const key of CLUSTER_CATEGORIES[cluster]) {
        seen.set(key, (seen.get(key) ?? 0) + 1);
      }
    }
    // Every canonical key appears exactly once across all clusters
    for (const key of ALL_CATEGORY_KEYS) {
      expect(seen.get(key), `${key} should appear in exactly one cluster`).toBe(1);
    }
    // No extra keys leaked in
    expect(seen.size).toBe(ALL_CATEGORY_KEYS.length);
  });

  it('no cluster is empty', () => {
    for (const cluster of CLUSTER_KEYS) {
      expect(CLUSTER_CATEGORIES[cluster].length, `${cluster} is empty`).toBeGreaterThan(0);
    }
  });
});

// ─── Invariant 3: default cluster weights sum to 1 ────────────────────────────

describe('canonical list — cluster weights', () => {
  it('default cluster weights sum to 1', () => {
    const sum = CLUSTER_KEYS.reduce((s, k) => s + CLUSTER_META[k].defaultWeight, 0);
    expect(sum).toBeCloseTo(1, 6);
  });

  it('DEFAULT_CLUSTER_WEIGHTS mirrors CLUSTER_META', () => {
    for (const k of CLUSTER_KEYS) {
      expect(DEFAULT_CLUSTER_WEIGHTS[k]).toBe(CLUSTER_META[k].defaultWeight);
    }
  });
});

// ─── Invariant 4: ranking-score re-exports the canonical definitions ──────────
// Guards against reintroducing a second hand-maintained list.

describe('single source of truth — ranking-score derives from canonical', () => {
  it('ranking-score re-exports the identical cluster objects', async () => {
    const rs = await import('../lib/ranking-score');
    expect(rs.CLUSTER_CATEGORIES).toBe(CLUSTER_CATEGORIES);
    expect(rs.DEFAULT_CLUSTER_WEIGHTS).toBe(DEFAULT_CLUSTER_WEIGHTS);
  });

  it('ranking-score.ts does not declare its own cluster/weight object literals', () => {
    const src = readFileSync(join(LIB, 'ranking-score.ts'), 'utf8');
    // It may re-export, but must not assign a fresh object literal.
    expect(/const\s+CLUSTER_CATEGORIES\s*[:=]\s*\{/.test(src)).toBe(false);
    expect(/const\s+DEFAULT_CLUSTER_WEIGHTS\s*[:=]\s*\{/.test(src)).toBe(false);
    expect(src.includes("from './score-categories'")).toBe(true);
  });
});

// ─── Invariant 5: no category key used outside the canonical list ─────────────
// Static scan: any 'snake_case_score-ish' string literal in consumer files that
// LOOKS like a category key must be a real canonical key. We check the known
// consumer files that historically held divergent copies.

describe('static scan — no category key outside the canonical list', () => {
  // Files that consume category keys. Each is scanned for hard-coded keys.
  const consumers = [
    join(COMPONENTS, 'ranking', 'RankingPage.tsx'),
    join(LIB, 'ranking.ts'),
  ];

  // The canonical keys we explicitly look for as bare string literals.
  // (Matching every snake_case token would be noisy; we assert the inverse:
  //  every canonical-looking literal present is in CANONICAL.)
  const KEY_LITERAL = /'([a-z]+(?:_[a-z0-9]+){1,})'/g;
  // Suffixes that strongly indicate a score-category literal rather than some
  // unrelated identifier.
  const LOOKS_LIKE_CATEGORY = /(_score|_index|_pm25|_combined|_proficiency|_acceptance|_quality|_community|_stability|_freedom|_resilienz|_to_germany|_drinkable|_friendliness|_accessibility|_overlap_cet)$/;

  for (const file of consumers) {
    it(`every category-like literal in ${file.split(/[\\/]/).pop()} is canonical`, () => {
      const src = readFileSync(file, 'utf8');
      const offenders: string[] = [];
      let m: RegExpExecArray | null;
      while ((m = KEY_LITERAL.exec(src)) !== null) {
        const lit = m[1];
        if (LOOKS_LIKE_CATEGORY.test(lit) && !CANONICAL.has(lit)) {
          offenders.push(lit);
        }
      }
      expect(offenders, `non-canonical category keys: ${offenders.join(', ')}`).toEqual([]);
    });
  }
});
