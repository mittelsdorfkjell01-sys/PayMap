import { CountryModule, TaxOptions, SocialContributions, SpecialRegimeInfo } from '../types';

const r = (x: number) => Math.round(x * 100) / 100;

export const ro: CountryModule = {
  countryCode: 'ro',

  calculateIncomeTax(taxable: number, _opts: TaxOptions): number {
    // 10% Flat Tax
    return r(taxable * 0.10);
  },

  getSocialContributions(gross: number, _opts: TaxOptions): SocialContributions {
    // CAS 25% + CASS 10% = 35%
    // CASS: max 60 × BIP Mindestlohn Deckel (vereinfacht: kein Deckel modelliert)
    const pension = r(gross * 0.25);  // CAS
    const health = r(gross * 0.10);   // CASS
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
      return 'Romania 2025 (RON). 10% flat income tax. CAS (25%) and CASS (10%) social contributions are employee-paid and very high. CASS ceiling (60× minimum wage) not modeled. Not tax advice.';
    }
    return 'Rumänien 2025 (RON). 10% Flat Tax. CAS (25%) und CASS (10%) Sozialabgaben werden vom Arbeitnehmer gezahlt und sind sehr hoch. CASS-Deckel (60× Mindestlohn) nicht modelliert. Keine Steuerberatung.';
  },
};

export default ro;
