/**
 * Singapore — Income Tax 2025 (YA 2025). CPF only for citizens/PR; foreigners
 * on Employment Pass pay no social contributions. NOR scheme discontinued from
 * YA 2021 (legacy holders only).
 */

import { CountryModule, TaxOptions, SocialContributions, SpecialRegimeInfo, TaxData } from '../types';
import { getDefaultTaxData } from '../data/countries';
import { bracketsFor, progressiveTax } from '../data/helpers';

const r = (x: number) => Math.round(x * 100) / 100;

export const sg: CountryModule = {
  countryCode: 'sg',

  calculateIncomeTax(taxable: number, opts: TaxOptions, taxData?: TaxData): number {
    const data = taxData ?? getDefaultTaxData('sg', opts.year);
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
        id: 'nor-sg',
        nameDE: 'NOR-Schema (Singapur) — eingestellt ab YA 2021',
        nameEN: 'Not Ordinarily Resident (NOR) Scheme — discontinued from YA 2021',
        flatRate: 0.1,
        durationYears: 5,
      },
    ];
  },

  applySpecialRegime(gross: number, regimeId: string, opts: TaxOptions, taxData?: TaxData): number {
    const data = taxData ?? getDefaultTaxData('sg', opts.year);
    if (regimeId === 'nor-sg') {
      // NOR concession (legacy): ~50% of income taxable (time apportionment).
      return r(progressiveTax(gross * 0.5, bracketsFor(data, 'employed')));
    }
    return r(progressiveTax(gross, bracketsFor(data, 'employed')));
  },

  getDisclaimer(locale: string): string {
    if (locale === 'en') {
      return 'Singapore YA 2025. Resident individual rates. No CPF for foreigners (Employment/Work Pass holders). Capital gains: 0%. NOR Scheme: discontinued from YA 2021 — only legacy holders (NOR granted ≤ YA 2020) may still benefit. Not tax advice.';
    }
    return 'Singapur YA 2025. Steuersätze für ansässige Einzelpersonen. Keine CPF-Beiträge für Ausländer (Employment/Work Pass). Kapitalgewinne: 0%. NOR-Schema: eingestellt ab YA 2021 — nur Altfälle (NOR ≤ YA 2020) können noch profitieren. Keine Steuerberatung.';
  },
};

export default sg;
