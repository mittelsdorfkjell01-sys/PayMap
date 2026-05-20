import { CountryModule, TaxOptions, SocialContributions, SpecialRegimeInfo } from '../types';

const r = (x: number) => Math.round(x * 100) / 100;

interface Bracket {
  from: number;
  to: number;
  rate: number;
}

// Federal Brackets 2025 (single)
const BRACKETS_2025_SINGLE: Bracket[] = [
  { from: 0, to: 11925, rate: 0.10 },
  { from: 11925, to: 48475, rate: 0.12 },
  { from: 48475, to: 103350, rate: 0.22 },
  { from: 103350, to: 197300, rate: 0.24 },
  { from: 197300, to: 250525, rate: 0.32 },
  { from: 250525, to: 626350, rate: 0.35 },
  { from: 626350, to: Infinity, rate: 0.37 },
];

// MFJ brackets 2025 (Married Filing Jointly) — approximation as double single brackets
const BRACKETS_2025_MFJ: Bracket[] = [
  { from: 0, to: 23850, rate: 0.10 },
  { from: 23850, to: 96950, rate: 0.12 },
  { from: 96950, to: 206700, rate: 0.22 },
  { from: 206700, to: 394600, rate: 0.24 },
  { from: 394600, to: 501050, rate: 0.32 },
  { from: 501050, to: 751600, rate: 0.35 },
  { from: 751600, to: Infinity, rate: 0.37 },
];

function calcProgressiveTax(taxable: number, brackets: Bracket[]): number {
  let tax = 0;
  for (const b of brackets) {
    if (taxable <= b.from) break;
    const slice = Math.min(taxable, b.to) - b.from;
    tax += slice * b.rate;
  }
  return r(tax);
}

export const us: CountryModule = {
  countryCode: 'us',

  calculateIncomeTax(taxable: number, opts: TaxOptions): number {
    const brackets = opts.familyStatus === 'married' ? BRACKETS_2025_MFJ : BRACKETS_2025_SINGLE;
    return calcProgressiveTax(taxable, brackets);
  },

  getSocialContributions(gross: number, _opts: TaxOptions): SocialContributions {
    // FICA (AN):
    // Social Security: 6.2%, max wage base 168.600 USD
    // Medicare: 1.45%, no cap
    const ssBbg = 168600;
    const ssBase = Math.min(gross, ssBbg);
    const pension = r(ssBase * 0.062);       // Social Security
    const health = r(gross * 0.0145);        // Medicare
    const total = r(pension + health);
    return { health, pension, unemployment: 0, care: 0, total };
  },

  getDeductions(_gross: number, opts: TaxOptions): number {
    // Standard deduction 2025
    // Single / Divorced: 14.600 USD, Married Filing Jointly: 29.200 USD
    if (opts.familyStatus === 'married') return 29200;
    return 14600;
  },

  getAvailableRegimes(): SpecialRegimeInfo[] {
    return [];
  },

  applySpecialRegime(_gross: number, _regimeId: string, _opts: TaxOptions): number {
    return 0;
  },

  getDisclaimer(locale: string): string {
    if (locale === 'en') {
      return 'USA 2025 — Federal Income Tax only. State income tax (0–13% depending on state) not included. Significant variations by state possible. Not tax advice.';
    }
    return 'USA 2025 — Nur Federal Income Tax. State Tax (0–13%, je nach Bundesstaat) nicht eingerechnet. Erhebliche Abweichungen je nach Bundesstaat möglich. Keine Steuerberatung.';
  },
};

export default us;
