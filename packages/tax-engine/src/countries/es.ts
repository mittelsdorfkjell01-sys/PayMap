import { CountryModule, TaxOptions, SocialContributions, SpecialRegimeInfo } from '../types';

const r = (x: number) => Math.round(x * 100) / 100;

interface Bracket {
  from: number;
  to: number;
  rate: number;
}

// Staat + Regionalsteuer-Approximation
const BRACKETS_2025: Bracket[] = [
  { from: 0, to: 12450, rate: 0.19 },
  { from: 12450, to: 20200, rate: 0.24 },
  { from: 20200, to: 35200, rate: 0.30 },
  { from: 35200, to: 60000, rate: 0.37 },
  { from: 60000, to: 300000, rate: 0.45 },
  { from: 300000, to: Infinity, rate: 0.47 },
];

// Beckham Law: nur Staatssteuer
const BRACKETS_BECKHAM: Bracket[] = [
  { from: 0, to: 600000, rate: 0.24 },
  { from: 600000, to: Infinity, rate: 0.47 },
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

export const es: CountryModule = {
  countryCode: 'es',

  calculateIncomeTax(taxable: number, _opts: TaxOptions): number {
    return calcProgressiveTax(taxable, BRACKETS_2025);
  },

  getSocialContributions(gross: number, _opts: TaxOptions): SocialContributions {
    const bbg = 56064;
    const base = Math.min(gross, bbg);
    const pension = r(base * 0.0635);
    return { health: 0, pension, unemployment: 0, care: 0, total: pension };
  },

  getDeductions(_gross: number, _opts: TaxOptions): number {
    return 0;
  },

  getAvailableRegimes(): SpecialRegimeInfo[] {
    return [
      {
        id: 'beckham-es',
        nameDE: 'Beckham Law (Spanien)',
        nameEN: 'Beckham Law Special Tax Regime',
        flatRate: 0.24,
        durationYears: 6,
      },
    ];
  },

  applySpecialRegime(gross: number, regimeId: string, _opts: TaxOptions): number {
    if (regimeId === 'beckham-es') {
      return calcProgressiveTax(gross, BRACKETS_BECKHAM);
    }
    return calcProgressiveTax(gross, BRACKETS_2025);
  },

  getDisclaimer(locale: string): string {
    if (locale === 'en') {
      return 'Spain 2025. Approximate calculation including state and average regional tax. Individual regional deductions not included. Not tax advice.';
    }
    return 'Spanien 2025. Näherungsrechnung inkl. Staats- und durchschnittlicher Regionalsteuer. Individuelle Regionalabzüge nicht berücksichtigt. Keine Steuerberatung.';
  },
};

export default es;
