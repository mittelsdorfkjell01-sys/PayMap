/**
 * Argentina — Impuesto a las Ganancias 4ª categoría 2025
 * Source: https://www.afip.gob.ar/
 *
 * ⚠ HIGH UNCERTAINTY: Brackets and MNI are adjusted quarterly for inflation (AFIP).
 * Values below reflect approximate Q1 2025 figures.
 * Use a high variance factor (0.35) and treat results as rough estimates only.
 *
 * MNI (mínimo no imponible): ~ARS 38,400,000/year for single person (Q1 2025 approx.)
 *
 * Social contributions (employee):
 *   Jubilación (ANSES): 11%
 *   PAMI (INSSJP): 3%
 *   Obra Social: 3%
 *   Total: 17%
 */

import { CountryModule, TaxOptions, SocialContributions, SpecialRegimeInfo } from '../types';

const r = (x: number) => Math.round(x * 100) / 100;

// ⚠ Approximate Q1 2025 — adjusted quarterly by AFIP
const MNI = 38_400_000;

const AR_BRACKETS = [
  { from:           0, to:   8_000_000, rate: 0.05 },
  { from:   8_000_000, to:  16_000_000, rate: 0.09 },
  { from:  16_000_000, to:  24_000_000, rate: 0.12 },
  { from:  24_000_000, to:  32_000_000, rate: 0.15 },
  { from:  32_000_000, to:  48_000_000, rate: 0.19 },
  { from:  48_000_000, to:  64_000_000, rate: 0.23 },
  { from:  64_000_000, to:  96_000_000, rate: 0.27 },
  { from:  96_000_000, to: 128_000_000, rate: 0.31 },
  { from: 128_000_000, to:    Infinity, rate: 0.35 },
];

function calcIncomeTax(pkp: number): number {
  let tax = 0;
  for (const b of AR_BRACKETS) {
    if (pkp <= b.from) break;
    tax += (Math.min(pkp, b.to) - b.from) * b.rate;
  }
  return r(tax);
}

export const ar: CountryModule = {
  countryCode: 'ar',

  calculateIncomeTax(taxable: number, _opts: TaxOptions): number {
    return calcIncomeTax(taxable);
  },

  getSocialContributions(gross: number, _opts: TaxOptions): SocialContributions {
    const pension = r(gross * 0.11);
    const health  = r(gross * 0.06); // PAMI 3% + obra social 3%
    return { health, pension, unemployment: 0, care: 0, total: r(health + pension) };
  },

  getDeductions(gross: number, _opts: TaxOptions): number {
    return Math.min(gross, MNI);
  },

  getAvailableRegimes(): SpecialRegimeInfo[] {
    return [];
  },

  applySpecialRegime(gross: number, _regimeId: string, _opts: TaxOptions): number {
    return calcIncomeTax(Math.max(0, gross - MNI));
  },

  getDisclaimer(locale: string): string {
    if (locale === 'en') {
      return '⚠ Argentina Ganancias 2025 — APPROXIMATE. Brackets and MNI are updated quarterly for inflation (AFIP). MNI ~ARS 38.4M/year (Q1 2025). Social: jubilación 11% + PAMI 3% + obra social 3%. High uncertainty — not tax advice.';
    }
    return '⚠ Argentinien Ganancias 2025 — NÄHERUNGSWERT. Brackets und MNI werden quartalsweise für Inflation angepasst (AFIP). MNI ~ARS 38,4 Mio./Jahr (Q1 2025). Sozialabgaben: Jubilación 11 % + PAMI 3 % + Obra Social 3 %. Hohe Unsicherheit — keine Steuerberatung.';
  },
};

export default ar;
