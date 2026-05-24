/**
 * Singapore — Income Tax 2025 (Year of Assessment 2025)
 * Source: https://www.iras.gov.sg/taxes/individual-income-tax/basics-of-individual-income-tax/
 *         tax-residency-and-tax-rates/individual-income-tax-rates
 *
 * CPF (Central Provident Fund): mandatory ONLY for Singapore Citizens and
 * Permanent Residents. Work Pass / Employment Pass holders are EXEMPT.
 * → No social contributions modelled for foreigners.
 *
 * Capital gains: 0% (no capital gains tax in Singapore).
 *
 * NOR Scheme (Not Ordinarily Resident):
 * ⚠ Discontinued from YA 2021. Legacy holders (NOR granted ≤ YA 2020) may
 *   use it until their 5-year window expires. No new applications accepted.
 * Source: https://www.iras.gov.sg/taxes/individual-income-tax/employees/
 *         special-tax-schemes/not-ordinarily-resident-nor-scheme
 */

import { CountryModule, TaxOptions, SocialContributions, SpecialRegimeInfo } from '../types';

const r = (x: number) => Math.round(x * 100) / 100;

// ─── Income Tax Brackets (YA 2025, Resident individual) ──────────────────────
// Source: IRAS, https://www.iras.gov.sg/ (updated 2024)
const SG_BRACKETS = [
  { from:       0, to:   20000, rate: 0.000 },
  { from:   20000, to:   30000, rate: 0.020 },
  { from:   30000, to:   40000, rate: 0.035 },
  { from:   40000, to:   80000, rate: 0.070 },
  { from:   80000, to:  120000, rate: 0.115 },
  { from:  120000, to:  160000, rate: 0.150 },
  { from:  160000, to:  200000, rate: 0.180 },
  { from:  200000, to:  240000, rate: 0.190 },
  { from:  240000, to:  280000, rate: 0.195 },
  { from:  280000, to:  320000, rate: 0.200 },
  { from:  320000, to:  500000, rate: 0.220 },
  { from:  500000, to: 1000000, rate: 0.230 },
  { from: 1000000, to: Infinity, rate: 0.240 },
] as const;

function calcIncomeTax(taxable: number): number {
  let tax = 0;
  for (const b of SG_BRACKETS) {
    if (taxable <= b.from) break;
    const slice = Math.min(taxable, b.to) - b.from;
    tax += slice * b.rate;
  }
  return r(tax);
}

// ─── Module ──────────────────────────────────────────────────────────────────
export const sg: CountryModule = {
  countryCode: 'sg',

  calculateIncomeTax(taxable: number, _opts: TaxOptions): number {
    return calcIncomeTax(taxable);
  },

  getSocialContributions(_gross: number, _opts: TaxOptions): SocialContributions {
    // CPF is only for Singapore Citizens/PR — foreigners on Employment Pass pay nothing.
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
        flatRate: 0.10,   // effective rate for reference (~50% taxable at lower brackets)
        durationYears: 5,
      },
    ];
  },

  applySpecialRegime(gross: number, regimeId: string, _opts: TaxOptions): number {
    if (regimeId === 'nor-sg') {
      // NOR concession (legacy, YA ≤ 2024):
      // Simplified as 50% of income taxable (time-apportionment, assuming ~50%
      // of work time outside Singapore). Requires: income > SGD 160,000 and
      // >90 days worked outside Singapore per year.
      // ⚠ Scheme discontinued for new applicants from YA 2021.
      // Source: IRAS NOR scheme guidance (archived)
      return calcIncomeTax(gross * 0.50);
    }
    return calcIncomeTax(gross);
  },

  getDisclaimer(locale: string): string {
    if (locale === 'en') {
      return 'Singapore YA 2025. Resident individual rates. No CPF for foreigners (Employment/Work Pass holders). Capital gains: 0%. NOR Scheme: discontinued from YA 2021 — only legacy holders (NOR granted ≤ YA 2020) may still benefit. Not tax advice.';
    }
    return 'Singapur YA 2025. Steuersätze für ansässige Einzelpersonen. Keine CPF-Beiträge für Ausländer (Employment/Work Pass). Kapitalgewinne: 0%. NOR-Schema: eingestellt ab YA 2021 — nur Altfälle (NOR ≤ YA 2020) können noch profitieren. Keine Steuerberatung.';
  },
};

export default sg;
