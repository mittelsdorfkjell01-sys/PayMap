import { CountryModule, TaxOptions, SocialContributions, SpecialRegimeInfo, TaxData } from '../types';
import { getDefaultTaxData } from '../data/countries';
import { socialAmount } from '../data/helpers';

const r = (x: number) => Math.round(x * 100) / 100;

/**
 * Switzerland 2025 — Canton Zurich approximation.
 *
 * The income tax is an EFFECTIVE-RATE APPROXIMATION (Bund + Kanton + Gemeinde
 * combined), NOT the exact Staatssteuer × Steuerfuss × Gemeindesteuerfuss
 * calculation. This is a deliberate, documented simplification (see Anhang A);
 * the rate tiers are part of that approximation logic and stay in code.
 */
function getEffectiveRate(gross: number): number {
  if (gross <= 30000) return 0.1;
  if (gross <= 60000) return 0.15;
  if (gross <= 100000) return 0.2;
  if (gross <= 200000) return 0.25;
  return 0.3;
}

export const ch: CountryModule = {
  countryCode: 'ch',

  calculateIncomeTax(taxable: number, _opts: TaxOptions): number {
    const rate = getEffectiveRate(taxable);
    return r(taxable * rate);
  },

  getSocialContributions(gross: number, opts: TaxOptions, taxData?: TaxData): SocialContributions {
    const data = taxData ?? getDefaultTaxData('ch', opts.year);
    const pension = r(socialAmount(data, 'pension', gross)); // AHV/IV/EO
    const unemployment = r(socialAmount(data, 'unemployment', gross)); // ALV
    const total = r(pension + unemployment);
    // Mandatory KVG health premium (fixed amount) is added in fix A.2.
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
