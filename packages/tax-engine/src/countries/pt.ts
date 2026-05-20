import { CountryModule, TaxOptions, SocialContributions, SpecialRegimeInfo } from '../types';

const r = (x: number) => Math.round(x * 100) / 100;

interface Bracket {
  from: number;
  to: number;
  rate: number;
}

const BRACKETS_2025: Bracket[] = [
  { from: 0, to: 7703, rate: 0.1325 },
  { from: 7703, to: 11623, rate: 0.18 },
  { from: 11623, to: 16472, rate: 0.23 },
  { from: 16472, to: 21321, rate: 0.26 },
  { from: 21321, to: 27146, rate: 0.3275 },
  { from: 27146, to: 39791, rate: 0.37 },
  { from: 39791, to: 51997, rate: 0.435 },
  { from: 51997, to: 81199, rate: 0.45 },
  { from: 81199, to: Infinity, rate: 0.48 },
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

function getMarginalRate(taxable: number, brackets: Bracket[]): number {
  for (let i = brackets.length - 1; i >= 0; i--) {
    if (taxable > brackets[i].from) return brackets[i].rate;
  }
  return 0;
}

export const pt: CountryModule = {
  countryCode: 'pt',

  calculateIncomeTax(taxable: number, _opts: TaxOptions): number {
    return calcProgressiveTax(taxable, BRACKETS_2025);
  },

  getSocialContributions(gross: number, _opts: TaxOptions): SocialContributions {
    // Sozial AN: 11%, kein Deckel
    const pension = r(gross * 0.11);
    return { health: 0, pension, unemployment: 0, care: 0, total: pension };
  },

  getDeductions(_gross: number, _opts: TaxOptions): number {
    return 0;
  },

  getAvailableRegimes(): SpecialRegimeInfo[] {
    return [
      {
        id: 'ifici-pt',
        nameDE: 'IFICI+ Regime (Portugal)',
        nameEN: 'IFICI+ Special Tax Regime',
        flatRate: 0.20,
        durationYears: 10,
      },
    ];
  },

  applySpecialRegime(gross: number, regimeId: string, _opts: TaxOptions): number {
    if (regimeId === 'ifici-pt') {
      // 20% flat auf qualifiziertes Einkommen
      return r(gross * 0.20);
    }
    return calcProgressiveTax(gross, BRACKETS_2025);
  },

  getDisclaimer(locale: string): string {
    if (locale === 'en') {
      return 'Portugal 2025. Approximate calculation based on national brackets. Regional surtaxes and individual deductions not included. Not tax advice.';
    }
    return 'Portugal 2025. Näherungsrechnung auf Basis nationaler Steuersätze. Gemeindezuschläge und individuelle Abzüge nicht berücksichtigt. Keine Steuerberatung.';
  },
};

export default pt;
