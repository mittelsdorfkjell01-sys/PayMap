import { CountryModule, TaxOptions, SocialContributions, SpecialRegimeInfo } from '../types';

const r = (x: number) => Math.round(x * 100) / 100;

export const hu: CountryModule = {
  countryCode: 'hu',

  calculateIncomeTax(taxable: number, _opts: TaxOptions): number {
    // 15% Flat Tax
    return r(taxable * 0.15);
  },

  getSocialContributions(gross: number, _opts: TaxOptions): SocialContributions {
    // AN: 18.5% (Pension 10%, KV 7%, ALV 1.5%)
    const pension = r(gross * 0.10);
    const health = r(gross * 0.07);
    const unemployment = r(gross * 0.015);
    const care = 0;
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
      return 'Hungary 2025 (HUF). 15% flat income tax. Family tax benefits not included. Not tax advice.';
    }
    return 'Ungarn 2025 (HUF). 15% Flat Tax. Familiensteuervorteile nicht berücksichtigt. Keine Steuerberatung.';
  },
};

export default hu;
