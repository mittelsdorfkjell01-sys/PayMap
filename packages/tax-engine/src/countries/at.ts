import { CountryModule, TaxOptions, SocialContributions, SpecialRegimeInfo, TaxData } from '../types';
import { getDefaultTaxData } from '../data/countries';
import { bracketsFor, progressiveTax, socialAmount } from '../data/helpers';

const r = (x: number) => Math.round(x * 100) / 100;

export const at: CountryModule = {
  countryCode: 'at',

  calculateIncomeTax(taxable: number, opts: TaxOptions, taxData?: TaxData): number {
    const data = taxData ?? getDefaultTaxData('at', opts.year);
    // NB: 13th/14th salary (Jahressechstel) handling: see fix A.8.
    return r(progressiveTax(taxable, bracketsFor(data, 'employed')));
  },

  getSocialContributions(gross: number, opts: TaxOptions, taxData?: TaxData): SocialContributions {
    const data = taxData ?? getDefaultTaxData('at', opts.year);
    const pension = r(socialAmount(data, 'pension', gross));
    const health = r(socialAmount(data, 'health', gross));
    const unemployment = r(socialAmount(data, 'unemployment', gross));
    const care = r(socialAmount(data, 'care', gross));
    const total = r(pension + health + unemployment + care);
    return { health, pension, unemployment, care, total };
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
      return 'Austria 2025. Approximate calculation. Church tax, individual deductions, and special payments (13th/14th salary at reduced rate) not fully considered. Not tax advice.';
    }
    return 'Österreich 2025. Näherungsrechnung. Kirchenbeitrag, individuelle Freibeträge und Sonderzahlungen (13./14. Gehalt mit Sondersteuer) nicht vollständig berücksichtigt. Keine Steuerberatung.';
  },
};

export default at;
