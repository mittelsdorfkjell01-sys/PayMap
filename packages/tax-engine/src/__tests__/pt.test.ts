import { describe, it, expect } from 'vitest';
import { calculate } from '../calculate';
import type { TaxOptions } from '../types';

function opts(overrides: Partial<TaxOptions> = {}): TaxOptions {
  return {
    gross: 66000,
    currency: 'EUR',
    employment: 'employed',
    familyStatus: 'single',
    children: 0,
    year: 2026,
    ...overrides,
  };
}

describe('PT — IFICI special regime', () => {
  it('"ifici" applies a 20% flat tax on the gross', () => {
    const r = calculate('pt', opts({ specialRegimeId: 'ifici' }));
    expect(r.incomeTax).toBeCloseTo(66000 * 0.2, 0); // 13.200
  });

  it('"ifici-pt" (canonical id) behaves identically to the "ifici" alias', () => {
    const alias = calculate('pt', opts({ specialRegimeId: 'ifici' }));
    const canonical = calculate('pt', opts({ specialRegimeId: 'ifici-pt' }));
    expect(canonical.incomeTax).toBe(alias.incomeTax);
  });

  it('IFICI nets more than the standard progressive calc (its whole point)', () => {
    const standard = calculate('pt', opts());
    const ifici = calculate('pt', opts({ specialRegimeId: 'ifici' }));
    expect(ifici.netMonthly).toBeGreaterThan(standard.netMonthly);
  });

  it('unknown regimeId falls back to the standard calc (no gross-overtaxation)', () => {
    const standard = calculate('pt', opts());
    const unknown = calculate('pt', opts({ specialRegimeId: 'does-not-exist' }));
    // Must equal the standard taxable-income result, NOT progressiveTax(gross).
    expect(unknown.incomeTax).toBeCloseTo(standard.incomeTax, 0);
  });
});
