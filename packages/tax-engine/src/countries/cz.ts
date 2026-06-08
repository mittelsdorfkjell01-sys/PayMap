import { CountryModule, TaxOptions, SocialContributions, SpecialRegimeInfo, TaxData } from '../types';
import { getDefaultTaxData } from '../data/countries';
import { bracketsFor, progressiveTax, socialAmount } from '../data/helpers';

const r = (x: number) => Math.round(x * 100) / 100;

export const cz: CountryModule = {
  countryCode: 'cz',

  calculateIncomeTax(taxable: number, opts: TaxOptions, taxData?: TaxData): number {
    const data = taxData ?? getDefaultTaxData('cz', opts.year);
    return r(progressiveTax(taxable, bracketsFor(data, 'employed')));
  },

  getSocialContributions(gross: number, opts: TaxOptions, taxData?: TaxData): SocialContributions {
    const data = taxData ?? getDefaultTaxData('cz', opts.year);
    const pension = r(socialAmount(data, 'pension', gross));
    const health = r(socialAmount(data, 'health', gross));
    return { health, pension, unemployment: 0, care: 0, total: r(pension + health) };
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
