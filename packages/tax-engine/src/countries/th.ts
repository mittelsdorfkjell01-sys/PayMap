import { CountryModule, TaxOptions, SocialContributions, SpecialRegimeInfo } from '../types';

const r = (x: number) => Math.round(x * 100) / 100;

interface Bracket {
  from: number;
  to: number;
  rate: number;
}

const BRACKETS_2025: Bracket[] = [
  { from: 0, to: 150000, rate: 0 },
  { from: 150000, to: 300000, rate: 0.05 },
  { from: 300000, to: 500000, rate: 0.10 },
  { from: 500000, to: 750000, rate: 0.15 },
  { from: 750000, to: 1000000, rate: 0.20 },
  { from: 1000000, to: 2000000, rate: 0.25 },
  { from: 2000000, to: 5000000, rate: 0.30 },
  { from: 5000000, to: Infinity, rate: 0.35 },
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

export const th: CountryModule = {
  countryCode: 'th',

  calculateIncomeTax(taxable: number, _opts: TaxOptions): number {
    return calcProgressiveTax(taxable);
  },

  getSocialContributions(gross: number, _opts: TaxOptions): SocialContributions {
    // AN: 5% auf Brutto, max 750 THB/Mo = 9.000 THB/Jahr
    const pension = r(Math.min(gross * 0.05, 9000));
    return { health: 0, pension, unemployment: 0, care: 0, total: pension };
  },

  getDeductions(gross: number, _opts: TaxOptions): number {
    // Standardabzug: 50% des Bruttos, max 100.000 THB
    const deduction = Math.min(gross * 0.50, 100000);
    return r(deduction);
  },

  getAvailableRegimes(): SpecialRegimeInfo[] {
    return [];
  },

  applySpecialRegime(_gross: number, _regimeId: string, _opts: TaxOptions): number {
    return 0;
  },

  getDisclaimer(locale: string): string {
    if (locale === 'en') {
      return 'Thailand 2025 (THB). Approximate calculation. Since 2024, foreign income remitted to Thailand is taxable. Personal allowances and additional deductions not fully included. Not tax advice.';
    }
    return 'Thailand 2025 (THB). Näherungsrechnung. Seit 2024 sind ausländische Einkünfte, die nach Thailand überwiesen werden, steuerpflichtig. Persönliche Freibeträge und weitere Abzüge nicht vollständig berücksichtigt. Keine Steuerberatung.';
  },
};

export default th;
