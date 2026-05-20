import { CountryModule, TaxOptions, SocialContributions, SpecialRegimeInfo } from '../types';

const r = (x: number) => Math.round(x * 100) / 100;

interface Bracket {
  from: number;
  to: number;
  rate: number;
}

// IRPEF 2025
const BRACKETS_2025: Bracket[] = [
  { from: 0, to: 28000, rate: 0.23 },
  { from: 28000, to: 50000, rate: 0.35 },
  { from: 50000, to: Infinity, rate: 0.43 },
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

export const it: CountryModule = {
  countryCode: 'it',

  calculateIncomeTax(taxable: number, _opts: TaxOptions): number {
    return calcProgressiveTax(taxable);
  },

  getSocialContributions(gross: number, _opts: TaxOptions): SocialContributions {
    // INPS AN: 9.19%, BBG: 119.650 €
    const bbg = 119650;
    const base = Math.min(gross, bbg);
    const pension = r(base * 0.0919);
    return { health: 0, pension, unemployment: 0, care: 0, total: pension };
  },

  getDeductions(_gross: number, _opts: TaxOptions): number {
    return 0;
  },

  getAvailableRegimes(): SpecialRegimeInfo[] {
    return [
      {
        id: 'impatriate-it',
        nameDE: 'Impatriate Regime (Italien)',
        nameEN: 'Impatriate Tax Regime (Italy)',
        flatRate: 0.50,
        durationYears: 5,
      },
    ];
  },

  applySpecialRegime(gross: number, regimeId: string, _opts: TaxOptions): number {
    if (regimeId === 'impatriate-it') {
      // 50% des Einkommens steuerfrei → IRPEF nur auf 50%
      const taxableReduced = gross * 0.50;
      return calcProgressiveTax(taxableReduced);
    }
    return calcProgressiveTax(gross);
  },

  getDisclaimer(locale: string): string {
    if (locale === 'en') {
      return 'Italy 2025. IRPEF calculation (approximate). Regional and municipal surtaxes (addizionale) not included. Not tax advice.';
    }
    return 'Italien 2025. IRPEF-Berechnung (Näherung). Regionale und kommunale Zuschläge (Addizionale) nicht berücksichtigt. Keine Steuerberatung.';
  },
};

export default it;
