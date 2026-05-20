import { CountryModule, TaxOptions, SocialContributions, SpecialRegimeInfo } from '../types';

const r = (x: number) => Math.round(x * 100) / 100;

/**
 * Tschechien 2025 (CZK)
 * Grenze für Spitzensteuersatz: 1.582.812 CZK (36× Durchschnittslohn)
 */
function calcIncomeTax(taxable: number): number {
  const threshold = 1582812;
  let tax = 0;
  if (taxable <= threshold) {
    tax = taxable * 0.15;
  } else {
    tax = threshold * 0.15 + (taxable - threshold) * 0.23;
  }
  return r(tax);
}

export const cz: CountryModule = {
  countryCode: 'cz',

  calculateIncomeTax(taxable: number, _opts: TaxOptions): number {
    return calcIncomeTax(taxable);
  },

  getSocialContributions(gross: number, _opts: TaxOptions): SocialContributions {
    // Sozial AN: 6.5% Pension + 4.5% Kranken = 11%
    const pension = r(gross * 0.065);
    const health = r(gross * 0.045);
    const total = r(pension + health);
    return { health, pension, unemployment: 0, care: 0, total };
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
      return 'Czech Republic 2025 (CZK). Approximate calculation. Tax credits (taxpayer credit 30.840 CZK/year) not applied — actual net will be higher. Not tax advice.';
    }
    return 'Tschechien 2025 (CZK). Näherungsrechnung. Steuerfreibetrag (Základní sleva 30.840 CZK/Jahr) nicht abgezogen — tatsächliches Netto höher. Keine Steuerberatung.';
  },
};

export default cz;
