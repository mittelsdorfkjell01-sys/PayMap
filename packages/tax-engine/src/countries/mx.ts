/**
 * Mexico — ISR (Impuesto sobre la Renta) 2024/2025
 * Source: https://www.sat.gob.mx/
 *
 * Annual ISR brackets (Art. 96 LISR, monthly table × 12, 2024 values —
 * 2025 INPC adjustment is minimal for typical incomes).
 *
 * IMSS employee contributions (simplified, % of SBC):
 *   Enfermedades y Maternidad: ~0.65%
 *   Invalidez y Vida: 0.625%
 *   Cesantía y Vejez (RCV): 1.125%
 *   Total employee share modelled: ~2.4% (health ~1%, pension ~1.4%)
 *   Note: Actual IMSS uses UMA-based tiers; this is an approximation.
 */

import { CountryModule, TaxOptions, SocialContributions, SpecialRegimeInfo } from '../types';

const r = (x: number) => Math.round(x * 100) / 100;

const MX_BRACKETS = [
  { from:             0, to:     107_429.88, rate: 0.0192 },
  { from:    107_429.88, to:     911_814.60, rate: 0.0640 },
  { from:    911_814.60, to:   1_602_432.84, rate: 0.1088 },
  { from:  1_602_432.84, to:   1_862_757.60, rate: 0.1600 },
  { from:  1_862_757.60, to:   2_230_230.84, rate: 0.1792 },
  { from:  2_230_230.84, to:   4_497_954.56, rate: 0.2136 },
  { from:  4_497_954.56, to:   7_089_551.88, rate: 0.2352 },
  { from:  7_089_551.88, to:  13_535_122.08, rate: 0.3000 },
  { from: 13_535_122.08, to:  18_046_829.52, rate: 0.3200 },
  { from: 18_046_829.52, to:  54_140_488.44, rate: 0.3400 },
  { from: 54_140_488.44, to:       Infinity, rate: 0.3500 },
];

function calcIncomeTax(gross: number): number {
  let tax = 0;
  for (const b of MX_BRACKETS) {
    if (gross <= b.from) break;
    tax += (Math.min(gross, b.to) - b.from) * b.rate;
  }
  return r(tax);
}

export const mx: CountryModule = {
  countryCode: 'mx',

  calculateIncomeTax(taxable: number, _opts: TaxOptions): number {
    return calcIncomeTax(taxable);
  },

  getSocialContributions(gross: number, _opts: TaxOptions): SocialContributions {
    const health  = r(gross * 0.010);  // EyM cuota obrera + gastos médicos ≈ 1%
    const pension = r(gross * 0.014);  // RCV + invalidez ≈ 1.4%
    return { health, pension, unemployment: 0, care: 0, total: r(health + pension) };
  },

  getDeductions(_gross: number, _opts: TaxOptions): number {
    return 0;
  },

  getAvailableRegimes(): SpecialRegimeInfo[] {
    return [];
  },

  applySpecialRegime(gross: number, _regimeId: string, _opts: TaxOptions): number {
    return calcIncomeTax(gross);
  },

  getDisclaimer(locale: string): string {
    if (locale === 'en') {
      return 'Mexico ISR 2024/2025. Annual brackets per Art. 96 LISR. IMSS employee contributions simplified (~2.4%); actual IMSS uses UMA-based calculation. Not tax advice.';
    }
    return 'Mexiko ISR 2024/2025. Jahresbrackets gemäß Art. 96 LISR. IMSS-Arbeitnehmeranteil vereinfacht (~2,4 %); tatsächliche IMSS-Berechnung basiert auf UMA. Keine Steuerberatung.';
  },
};

export default mx;
