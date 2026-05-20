import { CountryModule, TaxOptions, SocialContributions, SpecialRegimeInfo } from '../types';

const r = (x: number) => Math.round(x * 100) / 100;

/**
 * Schweiz 2025 — Approximation Kanton Zürich
 * Effektiver Gesamtsteuersatz (Bund + Kanton + Gemeinde) vereinfacht.
 */
function getEffectiveRate(gross: number): number {
  if (gross <= 30000) return 0.10;
  if (gross <= 60000) return 0.15;
  if (gross <= 100000) return 0.20;
  if (gross <= 200000) return 0.25;
  return 0.30;
}

export const ch: CountryModule = {
  countryCode: 'ch',

  calculateIncomeTax(taxable: number, _opts: TaxOptions): number {
    const rate = getEffectiveRate(taxable);
    return r(taxable * rate);
  },

  getSocialContributions(gross: number, _opts: TaxOptions): SocialContributions {
    // AHV/IV/EO (AN): 5.30%
    const pension = r(gross * 0.053);
    // ALV: 1.10% bis 88.200 CHF
    const unemployment = r(Math.min(gross, 88200) * 0.011);
    const total = r(pension + unemployment);
    return { health: 0, pension, unemployment, care: 0, total };
  },

  getDeductions(_gross: number, _opts: TaxOptions): number {
    return 0;
  },

  getAvailableRegimes(): SpecialRegimeInfo[] {
    return [];
  },

  applySpecialRegime(_gross: number, _regimeId: string, _opts: TaxOptions): number {
    return 0;
  },

  getDisclaimer(locale: string): string {
    if (locale === 'en') {
      return 'Switzerland 2025. Calculation based on Canton Zurich (approximation). Cantonal deviations possible. Mandatory health insurance premiums not included. Not tax advice.';
    }
    return 'Schweiz 2025. Berechnung auf Basis Kanton Zürich (Approximation). Kantonale Abweichungen möglich. Obligatorische Krankenkassenprämien nicht berücksichtigt. Keine Steuerberatung.';
  },
};

export default ch;
