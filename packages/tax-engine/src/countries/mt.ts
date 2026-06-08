/**
 * Malta — Income Tax + Social Security 2025
 * Special Regime: Global Residence Programme (GRP), 15% flat on remitted income.
 */

import { CountryModule, TaxOptions, SocialContributions, SpecialRegimeInfo, TaxData } from '../types';
import { getDefaultTaxData } from '../data/countries';
import { bracketsFor, progressiveTax, socialAmount, deductionAmount } from '../data/helpers';

const r = (x: number) => Math.round(x * 100) / 100;

export const mt: CountryModule = {
  countryCode: 'mt',

  calculateIncomeTax(taxable: number, opts: TaxOptions, taxData?: TaxData): number {
    const data = taxData ?? getDefaultTaxData('mt', opts.year);
    return r(progressiveTax(taxable, bracketsFor(data, 'employed')));
  },

  getSocialContributions(gross: number, opts: TaxOptions, taxData?: TaxData): SocialContributions {
    const data = taxData ?? getDefaultTaxData('mt', opts.year);
    // Employee SS: 10% on gross up to ceiling, exempt below the annual minimum.
    const min = deductionAmount(data, 'ss_min');
    const ss = gross < min ? 0 : r(socialAmount(data, 'social_security', gross));
    return { health: 0, pension: ss, unemployment: 0, care: 0, total: ss };
  },

  getDeductions(_gross: number, _opts: TaxOptions): number {
    return 0;
  },

  getAvailableRegimes(): SpecialRegimeInfo[] {
    return [
      {
        id: 'grp-mt',
        nameDE: 'Global Residence Programme (Malta)',
        nameEN: 'Malta Global Residence Programme (GRP)',
        flatRate: 0.15,
        durationYears: 10,
      },
    ];
  },

  applySpecialRegime(gross: number, regimeId: string, opts: TaxOptions, taxData?: TaxData): number {
    const data = taxData ?? getDefaultTaxData('mt', opts.year);
    if (regimeId === 'grp-mt') {
      // 15% flat on foreign-source income remitted to Malta (min. tax €15,000/yr
      // enforced at application level, not in the engine).
      return r(gross * 0.15);
    }
    return r(progressiveTax(gross, bracketsFor(data, 'employed')));
  },

  getDisclaimer(locale: string): string {
    if (locale === 'en') {
      return 'Malta 2025. Single rates. Social Security (Class 1, employee side, 10%) capped at ~€30,030. GRP: 15% flat on foreign-source income remitted to Malta; minimum tax €15,000/yr; legal and residency conditions apply. Not tax advice.';
    }
    return 'Malta 2025. Einzelperson-Tarif. Sozialversicherung (Klasse 1, Arbeitnehmer, 10%) gedeckelt bei ca. 30.030 €. GRP: 15% pauschal auf ausländische Einkünfte, die nach Malta überwiesen werden; Mindeststeuer 15.000 €/Jahr; rechtliche und Aufenthaltsvoraussetzungen gelten. Keine Steuerberatung.';
  },
};

export default mt;
