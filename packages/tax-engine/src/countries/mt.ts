/**
 * Malta — Income Tax + Social Security 2025
 * Source: https://cfr.gov.mt/en/rates/Pages/TaxRates/Single-Rates.aspx
 *         https://cfr.gov.mt/en/rates/Pages/SSContributions/Class-1.aspx
 *
 * Special Regime: Global Residence Programme (GRP)
 * Source: Legal Notice 184 of 2013 (as amended)
 *         https://cfr.gov.mt/en/residents/Pages/GRP.aspx
 */

import { CountryModule, TaxOptions, SocialContributions, SpecialRegimeInfo } from '../types';

const r = (x: number) => Math.round(x * 100) / 100;

// ─── Income Tax — Single Rates 2025 ──────────────────────────────────────────
// Chargeable income = gross (no standard deductions)
// Brackets:  0–9,100 → 0%
//         9,101–14,500 → 15%
//        14,501–60,000 → 25%
//        60,001+       → 35%
const MT_BRACKETS = [
  { from:      0, to:  9100, rate: 0.00 },
  { from:   9100, to: 14500, rate: 0.15 },
  { from:  14500, to: 60000, rate: 0.25 },
  { from:  60000, to: Infinity, rate: 0.35 },
] as const;

function calcIncomeTax(taxable: number): number {
  let tax = 0;
  for (const b of MT_BRACKETS) {
    if (taxable <= b.from) break;
    const slice = Math.min(taxable, b.to) - b.from;
    tax += slice * b.rate;
  }
  return r(tax);
}

// ─── Social Security Class 1 (Employee side) ────────────────────────────────
// Employee pays 10% on gross, subject to an annual ceiling.
// 2025 ceiling: ~€30,030 (weekly max of €577.50 × 52).
// Contributions below weekly minimum (€195.16 × 52 ≈ €10,148) are exempt.
// Source: cfr.gov.mt/en/rates/Pages/SSContributions/Class-1.aspx
const MT_SS_RATE     = 0.10;
const MT_SS_MIN      = 10148;   // annual minimum earnings for SS
const MT_SS_CEILING  = 30030;   // annual maximum earnings ceiling for SS

function calcSocialSecurity(gross: number): number {
  if (gross < MT_SS_MIN) return 0;
  return r(Math.min(gross, MT_SS_CEILING) * MT_SS_RATE);
}

// ─── Module ──────────────────────────────────────────────────────────────────
export const mt: CountryModule = {
  countryCode: 'mt',

  calculateIncomeTax(taxable: number, _opts: TaxOptions): number {
    return calcIncomeTax(taxable);
  },

  getSocialContributions(gross: number, _opts: TaxOptions): SocialContributions {
    const ss = calcSocialSecurity(gross);
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
        durationYears: 10,  // indefinite in principle; shown as 10 for UI comparison
      },
    ];
  },

  applySpecialRegime(gross: number, regimeId: string, _opts: TaxOptions): number {
    if (regimeId === 'grp-mt') {
      // 15% flat on foreign-source income remitted to Malta.
      // Minimum annual tax of €15,000 enforced at application level (not engine).
      // Source: LN 184/2013, updated 2023. Requires prior non-Maltese residency.
      return r(gross * 0.15);
    }
    return calcIncomeTax(gross);
  },

  getDisclaimer(locale: string): string {
    if (locale === 'en') {
      return 'Malta 2025. Single rates. Social Security (Class 1, employee side, 10%) capped at ~€30,030. GRP: 15% flat on foreign-source income remitted to Malta; minimum tax €15,000/yr; legal and residency conditions apply. Not tax advice.';
    }
    return 'Malta 2025. Einzelperson-Tarif. Sozialversicherung (Klasse 1, Arbeitnehmer, 10%) gedeckelt bei ca. 30.030 €. GRP: 15% pauschal auf ausländische Einkünfte, die nach Malta überwiesen werden; Mindeststeuer 15.000 €/Jahr; rechtliche und Aufenthaltsvoraussetzungen gelten. Keine Steuerberatung.';
  },
};

export default mt;
