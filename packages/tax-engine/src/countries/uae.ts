import { CountryModule, TaxOptions, SocialContributions, SpecialRegimeInfo } from '../types';

const r = (x: number) => Math.round(x * 100) / 100;

export const uae: CountryModule = {
  countryCode: 'uae',

  calculateIncomeTax(_taxable: number, _opts: TaxOptions): number {
    return 0;
  },

  getSocialContributions(_gross: number, _opts: TaxOptions): SocialContributions {
    return { health: 0, pension: 0, unemployment: 0, care: 0, total: 0 };
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
      return 'UAE has no personal income tax. Calculation is an approximation. No social contributions for expatriates.';
    }
    return 'In den VAE gibt es keine Einkommensteuer. Keine Sozialabgaben für Expatriates.';
  },
};

export default uae;
