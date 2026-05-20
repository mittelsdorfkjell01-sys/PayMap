import { CountryModule, TaxOptions, SocialContributions, SpecialRegimeInfo } from '../types';

const r = (x: number) => Math.round(x * 100) / 100;

interface Bracket {
  from: number;
  to: number;
  rate: number;
}

const BRACKETS_2025: Bracket[] = [
  { from: 0, to: 10777, rate: 0 },
  { from: 10777, to: 27478, rate: 0.11 },
  { from: 27478, to: 78570, rate: 0.30 },
  { from: 78570, to: 168994, rate: 0.41 },
  { from: 168994, to: Infinity, rate: 0.45 },
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

export const fr: CountryModule = {
  countryCode: 'fr',

  calculateIncomeTax(taxable: number, _opts: TaxOptions): number {
    return calcProgressiveTax(taxable);
  },

  getSocialContributions(gross: number, _opts: TaxOptions): SocialContributions {
    // Vereinfachte 22%: CSG 9.2%, CRDS 0.5%, KV 0.75%, Pension 11.31%, Chômage 0% = ~22%
    const total = r(gross * 0.22);
    const pension = r(gross * 0.1131);
    const health = r(gross * 0.0975);  // CSG + CRDS + KV
    const unemployment = 0;
    const care = 0;
    return { health, pension, unemployment, care, total };
  },

  getDeductions(gross: number, _opts: TaxOptions): number {
    // Abatement: 10% Pauschalabzug, min. 495 €, max. 13.522 €
    const abatement = gross * 0.10;
    return r(Math.min(13522, Math.max(495, abatement)));
  },

  getAvailableRegimes(): SpecialRegimeInfo[] {
    return [];
  },

  applySpecialRegime(_gross: number, _regimeId: string, _opts: TaxOptions): number {
    return 0;
  },

  getDisclaimer(locale: string): string {
    if (locale === 'en') {
      return 'France 2025. Approximate calculation. Social contributions (CSG, CRDS, etc.) simplified to 22%. Quotient familial for married/children reduces tax but is not fully modeled. Not tax advice.';
    }
    return 'Frankreich 2025. Näherungsrechnung. Sozialabgaben (CSG, CRDS etc.) vereinfacht auf 22%. Quotient familial für Verheiratete/Kinder nicht vollständig abgebildet. Keine Steuerberatung.';
  },
};

export default fr;
