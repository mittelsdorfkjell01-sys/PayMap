import { CountryModule, TaxOptions, SocialContributions, SpecialRegimeInfo, TaxData } from '../types';
import { getDefaultTaxData } from '../data/countries';
import { bracketsFor, progressiveTax, socialAmount } from '../data/helpers';

const r = (x: number) => Math.round(x * 100) / 100;

export const ie: CountryModule = {
  countryCode: 'ie',

  calculateIncomeTax(taxable: number, opts: TaxOptions, taxData?: TaxData): number {
    const data = taxData ?? getDefaultTaxData('ie', opts.year);
    const paye = progressiveTax(taxable, bracketsFor(data, 'employed'));
    const usc = progressiveTax(taxable, bracketsFor(data, 'usc'));
    return r(paye + usc);
  },

  getSocialContributions(gross: number, opts: TaxOptions, taxData?: TaxData): SocialContributions {
    const data = taxData ?? getDefaultTaxData('ie', opts.year);
    // PRSI modeled as a flat contribution under pension.
    const pension = r(socialAmount(data, 'prsi', gross));
    return { health: 0, pension, unemployment: 0, care: 0, total: pension };
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
      return 'Ireland 2025. Includes PAYE and USC. PRSI modeled as a flat contribution. Tax credits (personal, PAYE) not applied — actual net will be higher. Not tax advice.';
    }
    return 'Irland 2025. Beinhaltet PAYE und USC. PRSI als Pauschalabgabe modelliert. Steuergutschriften (Personal Credit, PAYE Credit) nicht abgezogen — tatsächliches Netto höher. Keine Steuerberatung.';
  },
};

export default ie;
