import { CountryModule, TaxOptions, SocialContributions, SpecialRegimeInfo, TaxData } from '../types';
import { getDefaultTaxData } from '../data/countries';
import { bracketsFor, progressiveTax, socialAmount } from '../data/helpers';

const r = (x: number) => Math.round(x * 100) / 100;

export const hu: CountryModule = {
  countryCode: 'hu',

  calculateIncomeTax(taxable: number, opts: TaxOptions, taxData?: TaxData): number {
    const data = taxData ?? getDefaultTaxData('hu', opts.year);
    return r(progressiveTax(taxable, bracketsFor(data, 'employed')));
  },

  getSocialContributions(gross: number, opts: TaxOptions, taxData?: TaxData): SocialContributions {
    const data = taxData ?? getDefaultTaxData('hu', opts.year);
    const pension = r(socialAmount(data, 'pension', gross));
    const health = r(socialAmount(data, 'health', gross));
    const unemployment = r(socialAmount(data, 'unemployment', gross));
    const total = r(pension + health + unemployment);
    return { health, pension, unemployment, care: 0, total };
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
      return 'Hungary 2025 (HUF). 15% flat income tax. Family tax benefits not included. Not tax advice.';
    }
    return 'Ungarn 2025 (HUF). 15% Flat Tax. Familiensteuervorteile nicht berücksichtigt. Keine Steuerberatung.';
  },
};

export default hu;
