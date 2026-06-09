import { CountryModule, TaxOptions, SocialContributions, SpecialRegimeInfo, TaxData } from '../types';
import { getDefaultTaxData } from '../data/countries';
import { bracketsFor, progressiveTax, socialAmount, deductionAmount } from '../data/helpers';

const r = (x: number) => Math.round(x * 100) / 100;

export const ie: CountryModule = {
  countryCode: 'ie',

  calculateIncomeTax(taxable: number, opts: TaxOptions, taxData?: TaxData): number {
    const data = taxData ?? getDefaultTaxData('ie', opts.year);
    // Personal + employee (PAYE) tax credits are non-refundable and reduce the
    // PAYE income tax only — not the USC. Source: revenue.ie (Budget 2025).
    const credits =
      deductionAmount(data, 'personal_credit') + deductionAmount(data, 'employee_credit');
    const paye = Math.max(0, progressiveTax(taxable, bracketsFor(data, 'employed')) - credits);
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
      return 'Ireland 2025. Includes PAYE and USC, with the personal and employee tax credits applied to the PAYE tax. PRSI modeled as a flat contribution. Not tax advice.';
    }
    return 'Irland 2025. Beinhaltet PAYE und USC inkl. Personal- und Arbeitnehmer-Steuergutschrift (auf die PAYE-Steuer). PRSI als Pauschalabgabe modelliert. Keine Steuerberatung.';
  },
};

export default ie;
