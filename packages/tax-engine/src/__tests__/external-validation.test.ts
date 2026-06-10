/**
 * External reference validation (PR5 of the accuracy sprint).
 *
 * Unlike the per-country tests (whose goldens are engine-derived), these pin the
 * engine against INDEPENDENT references — third-party net calculators or the tax
 * authority's own published parameters — at a ±3% tolerance. They are the safety
 * net that catches systematic over/under-taxation. Each golden carries its
 * source and retrieval date (2026-06-09).
 *
 * Anchor basis per country:
 *  • DE, ES — pinned to third-party calculators that compute the (near-)final
 *    liability, so they match the engine's annual basis directly.
 *  • NL, PT — pinned to values computed from the authority's own published
 *    parameters (belastingdienst.nl scales + heffingskortingen; Art. 25 CIRS).
 *    The fetchable third-party NL/PT tools use monthly withholding-table bases
 *    that differ structurally from the annual settlement this engine models
 *    (e.g. PT talent.com retention basis ≈ €32.4k vs. annual settlement ≈
 *    €36.8k @60k — a year-end refund effect, not an engine error), so they are
 *    deliberately not used as goldens here.
 *
 * Coverage (see docs/accuracy-audit.md for the full matrix):
 *  • Externally confirmed below: DE, ES, NL, PT.
 *  • Trivial-exact: UAE (0% tax → net = gross).
 *  • Authority-parametric (values from official brackets/rates, cited in the
 *    country tests; not yet pinned to a third-party calculator): AT, CH, FR, IT,
 *    IE, EE, PL, CZ, HU, RO, TH, GB, MT, GE, SG, ID, CO, MX, AR, ZA, US.
 *
 * IMPORTANT — why those 21 are not pinned here: the one broadly-available
 * fetchable third-party calculator (talent.com) proved UNRELIABLE on a spot
 * check — e.g. IE 80k it reports ~€39,844 vs. the correct ~€54,005 because it
 * omits the personal/employee tax credits (hand-check confirms the engine, not
 * talent.com). AT/FR pages returned inconsistent figures. Encoding those as
 * goldens would pin the engine to wrong values, so they are deliberately NOT
 * added. Reliable per-country verification needs an interactive official
 * calculator (not server-fetchable) or a user-approved reference — flagged.
 */
import { describe, it, expect } from 'vitest';
import { calculate } from '../calculate';
import type { TaxOptions } from '../types';

const TOLERANCE = 0.03; // ±3% — allowances/phase-outs preclude an exact ±0 match

function withinTolerance(actual: number, expected: number): boolean {
  return Math.abs(actual - expected) / expected <= TOLERANCE;
}

function opts(gross: number, currency: string, overrides: Partial<TaxOptions> = {}): TaxOptions {
  return {
    gross,
    currency,
    employment: 'employed',
    familyStatus: 'single',
    children: 0,
    kvType: 'statutory',
    year: 2026,
    ...overrides,
  };
}

// ─── Germany ─────────────────────────────────────────────────────────────────
// External (StKl I, kinderlos, ohne Kirche, GKV, 2026), retrieved 2026-06-09:
//   lohntastik.de/gns/gross-net-salary-calculator/2/5000/1/0 → 3.130 €/mo
//   smart-rechner.de / netto-check.de → 3.139 €/mo (Lohnsteuer 803,67 + SV 1.057,50)
describe('DE — external (brutto-netto calculators)', () => {
  it('60k single ≈ 3.130 €/mo (±3%)', () => {
    const result = calculate('de', opts(60000, 'EUR'));
    expect(withinTolerance(result.netMonthly, 3130)).toBe(true);
    expect(withinTolerance(result.netMonthly, 3139)).toBe(true); // second source
  });
});

// ─── Spain ───────────────────────────────────────────────────────────────────
// External: es.talent.com/tax-calculator (Comunidad de Madrid, single, 2026),
// retrieved 2026-06-09.
describe('ES — external (talent.com, Madrid)', () => {
  it('60k Madrid ≈ 42.209 €/yr (±3%)', () => {
    // talent.com: net 42.209 €/yr (3.517 €/mo). Engine 42.367 €/yr.
    const result = calculate('es', opts(60000, 'EUR', { region: 'comunidad-madrid' }));
    expect(withinTolerance(result.netAnnual, 42209)).toBe(true);
  });

  it('80k Madrid ≈ 53.713 €/yr (±3%)', () => {
    // talent.com: net 53.713 €/yr (4.476 €/mo). Engine 54.079 €/yr.
    const result = calculate('es', opts(80000, 'EUR', { region: 'comunidad-madrid' }));
    expect(withinTolerance(result.netAnnual, 53713)).toBe(true);
  });
});

// ─── Netherlands ───────────────────────────────────────────────────────────────
// Authority basis: belastingdienst.nl box-1 scale 2025 (35,82/37,48/49,50) +
// algemene heffingskorting (€3.068, taper 6,337% > €28.406) + arbeidskorting
// (max €5.599). Net @60k = box-1 21.849,88 − AHK 1.065,87 − arbeidskorting
// 4.496,83 = tax 16.287,18 → 43.712,82 €/yr (official target corridor 43–44k).
describe('NL — external (belastingdienst parameters)', () => {
  it('60k single ≈ 43.713 €/yr (±3%)', () => {
    const result = calculate('nl', opts(60000, 'EUR', { year: 2025 }));
    expect(withinTolerance(result.netAnnual, 43713)).toBe(true);
    expect(result.netAnnual).toBeGreaterThan(43000);
    expect(result.netAnnual).toBeLessThan(44000);
  });
});

// ─── Portugal ─────────────────────────────────────────────────────────────────
// Authority basis (annual settlement / colecta): brackets 2025 on base = gross −
// dedução específica (Art. 25 CIRS = max(€4.462,15, SS 11%)). @60k: base 53.400,
// colecta 16.629,55, SS 6.600 → 36.770,45 €/yr. NB: monthly retention-table
// calculators show a lower in-year net (over-withholding refunded at settlement).
describe('PT — external (Art. 25 CIRS, annual settlement)', () => {
  it('60k single ≈ 36.770 €/yr (±3%)', () => {
    const result = calculate('pt', opts(60000, 'EUR', { year: 2025 }));
    expect(withinTolerance(result.netAnnual, 36770)).toBe(true);
  });
});
