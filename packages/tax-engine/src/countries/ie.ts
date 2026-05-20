import { CountryModule, TaxOptions, SocialContributions, SpecialRegimeInfo } from '../types';

const r = (x: number) => Math.round(x * 100) / 100;

interface Bracket {
  from: number;
  to: number;
  rate: number;
}

const PAYE_BRACKETS: Bracket[] = [
  { from: 0, to: 42000, rate: 0.20 },
  { from: 42000, to: Infinity, rate: 0.40 },
];

const USC_BRACKETS: Bracket[] = [
  { from: 0, to: 12012, rate: 0.005 },
  { from: 12012, to: 22920, rate: 0.02 },
  { from: 22920, to: 70044, rate: 0.045 },
  { from: 70044, to: Infinity, rate: 0.08 },
];

function calcProgressive(taxable: number, brackets: Bracket[]): number {
  let tax = 0;
  for (const b of brackets) {
    if (taxable <= b.from) break;
    const slice = Math.min(taxable, b.to) - b.from;
    tax += slice * b.rate;
  }
  return r(tax);
}

export const ie: CountryModule = {
  countryCode: 'ie',

  calculateIncomeTax(taxable: number, _opts: TaxOptions): number {
    const paye = calcProgressive(taxable, PAYE_BRACKETS);
    const usc = calcProgressive(taxable, USC_BRACKETS);
    return r(paye + usc);
  },

  getSocialContributions(gross: number, _opts: TaxOptions): SocialContributions {
    // PRSI AN: 4% Flat, kein Deckel
    const pension = r(gross * 0.04); // PRSI modeled as pension contribution
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
