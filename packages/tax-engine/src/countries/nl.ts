import { CountryModule, TaxOptions, SocialContributions, SpecialRegimeInfo } from '../types';

const r = (x: number) => Math.round(x * 100) / 100;

/**
 * Niederlande 2025
 * Sozialversicherung ist in Bracket 1 (36.97%) bereits enthalten.
 * Bracket 2 (49.5%) enthält keine Sozialversicherung mehr.
 */
function calcIncomeTax(taxable: number): number {
  let tax = 0;
  if (taxable <= 38441) {
    tax = taxable * 0.3697;
  } else {
    tax = 38441 * 0.3697 + (taxable - 38441) * 0.495;
  }
  return r(tax);
}

export const nl: CountryModule = {
  countryCode: 'nl',

  calculateIncomeTax(taxable: number, _opts: TaxOptions): number {
    return calcIncomeTax(taxable);
  },

  getSocialContributions(_gross: number, _opts: TaxOptions): SocialContributions {
    // Sozialversicherung ist in Bracket 1 eingepreist, nicht separat
    return { health: 0, pension: 0, unemployment: 0, care: 0, total: 0 };
  },

  getDeductions(_gross: number, _opts: TaxOptions): number {
    return 0;
  },

  getAvailableRegimes(): SpecialRegimeInfo[] {
    return [
      {
        id: 'ruling30-nl',
        nameDE: '30%-Ruling (Niederlande) — gestaffelt ab 2024',
        nameEN: '30% Ruling (Netherlands) — stepped since 2024',
        flatRate: 0.30,
        durationYears: 5,
      },
    ];
  },

  applySpecialRegime(gross: number, regimeId: string, opts: TaxOptions): number {
    if (regimeId === 'ruling30-nl') {
      // Gestaffeltes Ruling ab 2024 (belastingdienst.nl, 2024-reform):
      // Drei Phasen à ~20 Monate über 5 Jahre:
      //   Phase 1 (Jahr 1):   30 % steuerfrei
      //   Phase 2 (Jahr 2-3): 20 % steuerfrei
      //   Phase 3 (Jahr 4-5): 10 % steuerfrei
      // opts.rulingYearsActive = Anzahl bereits vollendeter Jahre im Ruling (default 0 = erstes Jahr)
      const year = opts.rulingYearsActive ?? 0;
      let exemptFraction: number;
      if (year <= 1) {
        exemptFraction = 0.30;
      } else if (year <= 3) {
        exemptFraction = 0.20;
      } else {
        exemptFraction = 0.10;
      }
      const taxableReduced = gross * (1 - exemptFraction);
      return calcIncomeTax(taxableReduced);
    }
    return calcIncomeTax(gross);
  },

  getDisclaimer(locale: string): string {
    if (locale === 'en') {
      return 'Netherlands 2025. Social insurance contributions are included in bracket 1 (36.97%). Healthcare allowance (zorgtoeslag) not included. Not tax advice.';
    }
    return 'Niederlande 2025. Sozialversicherungsbeiträge sind in der ersten Steuerklasse (36,97%) enthalten. Gesundheitszuschuss (Zorgtoeslag) nicht berücksichtigt. Keine Steuerberatung.';
  },
};

export default nl;
