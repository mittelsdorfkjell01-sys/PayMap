import { CountryModule, TaxOptions, SocialContributions, SpecialRegimeInfo, TaxData } from '../types';
import { getDefaultTaxData } from '../data/countries';
import { bracketsFor, progressiveTax, socialAmount } from '../data/helpers';

const r = (x: number) => Math.round(x * 100) / 100;

export const ro: CountryModule = {
  countryCode: 'ro',

  calculateIncomeTax(taxable: number, opts: TaxOptions, taxData?: TaxData): number {
    const data = taxData ?? getDefaultTaxData('ro', opts.year);
    return r(progressiveTax(taxable, bracketsFor(data, 'employed')));
  },

  getSocialContributions(gross: number, opts: TaxOptions, taxData?: TaxData): SocialContributions {
    const data = taxData ?? getDefaultTaxData('ro', opts.year);
    const pension = r(socialAmount(data, 'pension', gross)); // CAS
    const health = r(socialAmount(data, 'health', gross)); // CASS
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
      return 'Romania 2025 (RON). 10% flat income tax. CAS (25%) and CASS (10%) social contributions are employee-paid and very high. CASS ceiling (60× minimum wage) not modeled. Not tax advice.';
    }
    return 'Rumänien 2025 (RON). 10% Flat Tax. CAS (25%) und CASS (10%) Sozialabgaben werden vom Arbeitnehmer gezahlt und sind sehr hoch. CASS-Deckel (60× Mindestlohn) nicht modelliert. Keine Steuerberatung.';
  },
};

export default ro;
