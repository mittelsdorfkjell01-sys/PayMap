import { CountryModule, TaxOptions, SocialContributions, SpecialRegimeInfo } from '../types';

const r = (x: number) => Math.round(x * 100) / 100;

/**
 * Polen 2025 (PLN)
 * Grundfreibetrag: 30.000 PLN
 */
function calcIncomeTax(taxable: number): number {
  const grundfreibetrag = 30000;
  const effective = Math.max(0, taxable - grundfreibetrag);

  let tax = 0;
  if (effective <= 0) {
    tax = 0;
  } else if (effective <= 120000) {
    tax = effective * 0.12;
  } else {
    tax = 120000 * 0.12 + (effective - 120000) * 0.32;
  }

  // Solidaritätszuschlag: 4% auf Einkommen über 1 Mio PLN
  if (taxable > 1000000) {
    tax += (taxable - 1000000) * 0.04;
  }

  return r(tax);
}

export const pl: CountryModule = {
  countryCode: 'pl',

  calculateIncomeTax(taxable: number, _opts: TaxOptions): number {
    return calcIncomeTax(taxable);
  },

  getSocialContributions(gross: number, _opts: TaxOptions): SocialContributions {
    // Vereinfachte AN-Abgaben: ~13.71%
    const pension = r(gross * 0.0976);   // ZUS Rente
    const health = r(gross * 0.09);      // Kranken (NFZ)
    const unemployment = r(gross * 0.0167); // Unfall
    const care = 0;
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
      return 'Poland 2025 (PLN). Approximate calculation. Tax relief for young earners (under 26) and other deductions not included. Not tax advice.';
    }
    return 'Polen 2025 (PLN). Näherungsrechnung. Steuererleichterungen für Jungverdiener (unter 26 Jahre) und weitere Abzüge nicht berücksichtigt. Keine Steuerberatung.';
  },
};

export default pl;
