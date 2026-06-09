import { CountryModule, TaxOptions, SocialContributions, SpecialRegimeInfo, TaxData } from '../types';
import { getDefaultTaxData } from '../data/countries';
import { bracketsFor, progressiveTax, socialAmount, deductionAmount } from '../data/helpers';

const r = (x: number) => Math.round(x * 100) / 100;

export const cz: CountryModule = {
  countryCode: 'cz',

  calculateIncomeTax(taxable: number, opts: TaxOptions, taxData?: TaxData): number {
    const data = taxData ?? getDefaultTaxData('cz', opts.year);
    // Sleva na poplatníka: non-refundable taxpayer credit, floored at 0.
    const sleva = deductionAmount(data, 'sleva_poplatnik');
    const tax = progressiveTax(taxable, bracketsFor(data, 'employed'));
    return r(Math.max(0, tax - sleva));
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
      return 'Czech Republic 2025 (CZK). Approximate calculation including the basic taxpayer credit (sleva na poplatníka, 30.840 CZK/year). Not tax advice.';
    }
    return 'Tschechien 2025 (CZK). Näherungsrechnung inkl. Steuerfreibetrag (Základní sleva 30.840 CZK/Jahr). Keine Steuerberatung.';
  },
};

export default cz;
