import { CountryModule, TaxOptions, SocialContributions, SpecialRegimeInfo, TaxData } from '../types';
import { getDefaultTaxData } from '../data/countries';
import { bracketsFor, progressiveTax } from '../data/helpers';

const r = (x: number) => Math.round(x * 100) / 100;

/**
 * Netherlands 2025. Social insurance is baked into box-1 bracket 1 (36.97%),
 * so it is not modelled separately.
 */
export const nl: CountryModule = {
  countryCode: 'nl',

  calculateIncomeTax(taxable: number, opts: TaxOptions, taxData?: TaxData): number {
    const data = taxData ?? getDefaultTaxData('nl', opts.year);
    return r(progressiveTax(taxable, bracketsFor(data, 'employed')));
  },

  getSocialContributions(_gross: number, _opts: TaxOptions): SocialContributions {
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
        flatRate: 0.3,
        durationYears: 5,
      },
    ];
  },

  applySpecialRegime(gross: number, regimeId: string, opts: TaxOptions, taxData?: TaxData): number {
    const data = taxData ?? getDefaultTaxData('nl', opts.year);
    const brackets = bracketsFor(data, 'employed');
    if (regimeId === 'ruling30-nl') {
      // Gestaffeltes Ruling ab 2024 (belastingdienst.nl, 2024-reform):
      //   Phase 1 (Jahr 1):   30 % steuerfrei
      //   Phase 2 (Jahr 2-3): 20 % steuerfrei
      //   Phase 3 (Jahr 4-5): 10 % steuerfrei
      const year = opts.rulingYearsActive ?? 0;
      let exemptFraction: number;
      if (year <= 1) exemptFraction = 0.3;
      else if (year <= 3) exemptFraction = 0.2;
      else exemptFraction = 0.1;
      return r(progressiveTax(gross * (1 - exemptFraction), brackets));
    }
    return r(progressiveTax(gross, brackets));
  },

  getDisclaimer(locale: string): string {
    if (locale === 'en') {
      return 'Netherlands 2025. Social insurance contributions are included in bracket 1 (36.97%). Healthcare allowance (zorgtoeslag) not included. Not tax advice.';
    }
    return 'Niederlande 2025. Sozialversicherungsbeiträge sind in der ersten Steuerklasse (36,97%) enthalten. Gesundheitszuschuss (Zorgtoeslag) nicht berücksichtigt. Keine Steuerberatung.';
  },
};

export default nl;
