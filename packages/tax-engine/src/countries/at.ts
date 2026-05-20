import { CountryModule, TaxOptions, SocialContributions, SpecialRegimeInfo } from '../types';

const r = (x: number) => Math.round(x * 100) / 100;

interface Bracket {
  from: number;
  to: number;
  rate: number;
}

const BRACKETS_2025: Bracket[] = [
  { from: 0, to: 12816, rate: 0 },
  { from: 12816, to: 20818, rate: 0.20 },
  { from: 20818, to: 34513, rate: 0.30 },
  { from: 34513, to: 66612, rate: 0.41 },
  { from: 66612, to: 99266, rate: 0.48 },
  { from: 99266, to: 1000000, rate: 0.50 },
  { from: 1000000, to: Infinity, rate: 0.55 },
];

function calcProgressiveTax(taxable: number): number {
  let tax = 0;
  for (const b of BRACKETS_2025) {
    if (taxable <= b.from) break;
    const slice = Math.min(taxable, b.to) - b.from;
    tax += slice * b.rate;
  }
  return r(tax);
}

export const at: CountryModule = {
  countryCode: 'at',

  calculateIncomeTax(taxable: number, _opts: TaxOptions): number {
    return calcProgressiveTax(taxable);
  },

  getSocialContributions(gross: number, _opts: TaxOptions): SocialContributions {
    // AN-Sozialabgaben: Pension 10.25%, KV 3.87%, AV 3.0%, UV 1.0% = 18.12%
    const pension = r(gross * 0.1025);
    const health = r(gross * 0.0387);
    const unemployment = r(gross * 0.030);
    const care = r(gross * 0.010);
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
