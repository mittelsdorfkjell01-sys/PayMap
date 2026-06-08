/**
 * Fixture-based tests for the regional mechanisms (A.1 ES, A.3 US, A.4 IT).
 * These use synthetic TaxData (NOT real tax rates) to prove the engine sums
 * state/federal + regional + city layers correctly. Real 2026 values are seeded
 * and golden-tested separately once confirmed.
 */
import { describe, it, expect } from 'vitest';
import { calculate } from '../calculate';
import type { TaxData, TaxOptions } from '../types';

function opts(overrides: Partial<TaxOptions> = {}): TaxOptions {
  return {
    gross: 60000,
    currency: 'EUR',
    employment: 'employed',
    familyStatus: 'single',
    children: 0,
    kvType: 'statutory',
    year: 2026,
    ...overrides,
  };
}

// ─── A.1 — Spain: state + regional scale ──────────────────────────────────────
describe('ES regional (A.1) — Madrid ≠ Barcelona ≠ no-region', () => {
  const esData: TaxData = {
    countryCode: 'es',
    year: 2026,
    brackets: [
      // state scale (regionId null)
      { from: 0, to: 20000, rate: 0.1 },
      { from: 20000, to: null, rate: 0.2 },
      // Madrid (lower) regional scale
      { from: 0, to: 20000, rate: 0.08, regionId: 'comunidad-madrid' },
      { from: 20000, to: null, rate: 0.18, regionId: 'comunidad-madrid' },
      // Cataluña (higher) regional scale
      { from: 0, to: 20000, rate: 0.12, regionId: 'cataluna' },
      { from: 20000, to: null, rate: 0.25, regionId: 'cataluna' },
    ],
    social: [{ type: 'pension', rate: 0.0635, ceiling: 60000 }],
    deductions: [],
    surcharges: [],
    fixedAmounts: [],
  };

  it('regional scale is added on top of the state scale', () => {
    const madrid = calculate('es', opts({ region: 'comunidad-madrid' }), esData);
    const barcelona = calculate('es', opts({ region: 'cataluna' }), esData);
    const stateOnly = calculate('es', opts(), esData);

    expect(stateOnly.incomeTax).toBeGreaterThan(0);
    expect(madrid.incomeTax).toBeGreaterThan(stateOnly.incomeTax); // + Madrid regional
    expect(barcelona.incomeTax).toBeGreaterThan(madrid.incomeTax); // Cataluña higher than Madrid
    expect(madrid.netMonthly).toBeGreaterThan(barcelona.netMonthly);
  });

  it('Beckham regime ignores the region (flat state scale)', () => {
    const withBeckham = { ...esData, brackets: [...esData.brackets, { from: 0, to: null, rate: 0.24, employmentType: 'beckham' }] };
    const madrid = calculate('es', opts({ region: 'comunidad-madrid', specialRegimeId: 'beckham-es' }), withBeckham);
    const barcelona = calculate('es', opts({ region: 'cataluna', specialRegimeId: 'beckham-es' }), withBeckham);
    expect(madrid.incomeTax).toBe(barcelona.incomeTax); // region irrelevant under Beckham
  });
});

// ─── A.3 — USA: federal + state + NYC city tax ────────────────────────────────
describe('US regional (A.3) — New York (incl. NYC) vs Florida (0%)', () => {
  const usData: TaxData = {
    countryCode: 'us',
    year: 2026,
    brackets: [
      // federal single
      { from: 0, to: 50000, rate: 0.12, filingStatus: 'single' },
      { from: 50000, to: null, rate: 0.22, filingStatus: 'single' },
      // NY state single
      { from: 0, to: 30000, rate: 0.04, filingStatus: 'single', regionId: 'us-ny' },
      { from: 30000, to: null, rate: 0.06, filingStatus: 'single', regionId: 'us-ny' },
      // Florida: no state brackets at all
    ],
    social: [
      { type: 'social_security', rate: 0.062, ceiling: 168600 },
      { type: 'medicare', rate: 0.0145, ceiling: null },
    ],
    deductions: [
      { type: 'standard', amount: 14600, condition: 'single' }, // federal
      { type: 'standard_state', amount: 8000, condition: 'us-ny:single' }, // NY
    ],
    surcharges: [
      { type: 'nyc_city', baseType: 'taxable_income', cityScope: 'new-york', rate: 0.03 },
    ],
    fixedAmounts: [],
  };

  it('Florida = federal only; New York = federal + state; NYC adds city tax', () => {
    const florida = calculate('us', opts({ gross: 80000, region: 'us-fl', cityScope: 'miami' }), usData);
    const nyNoCity = calculate('us', opts({ gross: 80000, region: 'us-ny', cityScope: 'albany' }), usData);
    const nyc = calculate('us', opts({ gross: 80000, region: 'us-ny', cityScope: 'new-york' }), usData);

    expect(nyNoCity.incomeTax).toBeGreaterThan(florida.incomeTax); // + NY state layer
    expect(nyc.incomeTax).toBeGreaterThan(nyNoCity.incomeTax); // + NYC city tax
    expect(florida.netMonthly).toBeGreaterThan(nyc.netMonthly);
  });
});

// ─── A.4 — Italy: IRPEF + addizionale regionale + comunale ────────────────────
describe('IT regional (A.4) — Rom/Lazio vs Mailand/Lombardia vs IRPEF-only', () => {
  const itData: TaxData = {
    countryCode: 'it',
    year: 2026,
    brackets: [
      { from: 0, to: 28000, rate: 0.23 },
      { from: 28000, to: 50000, rate: 0.35 },
      { from: 50000, to: null, rate: 0.43 },
    ],
    social: [{ type: 'pension', rate: 0.0919, ceiling: 120000 }],
    deductions: [],
    surcharges: [
      // Lazio regionale (progressive) + Roma comunale (flat)
      { type: 'addizionale_regionale', baseType: 'taxable_income', regionId: 'lazio', brackets: [{ from: 0, to: 28000, rate: 0.0173 }, { from: 28000, to: null, rate: 0.0333 }] },
      { type: 'addizionale_comunale', baseType: 'taxable_income', cityScope: 'rom', rate: 0.009 },
      // Lombardia regionale (lower)
      { type: 'addizionale_regionale', baseType: 'taxable_income', regionId: 'lombardia', brackets: [{ from: 0, to: null, rate: 0.0123 }] },
      { type: 'addizionale_comunale', baseType: 'taxable_income', cityScope: 'mailand', rate: 0.008 },
    ],
    fixedAmounts: [],
  };

  it('addizionale regionale + comunale add to IRPEF', () => {
    const irpefOnly = calculate('it', opts({ gross: 60000 }), itData);
    const roma = calculate('it', opts({ gross: 60000, region: 'lazio', cityScope: 'rom' }), itData);
    const milano = calculate('it', opts({ gross: 60000, region: 'lombardia', cityScope: 'mailand' }), itData);

    expect(roma.incomeTax).toBeGreaterThan(irpefOnly.incomeTax); // + Lazio + Roma
    expect(milano.incomeTax).toBeGreaterThan(irpefOnly.incomeTax); // + Lombardia + Milano
    expect(roma.incomeTax).toBeGreaterThan(milano.incomeTax); // Lazio (piano di rientro) higher
    expect(milano.netMonthly).toBeGreaterThan(roma.netMonthly);
  });
});
