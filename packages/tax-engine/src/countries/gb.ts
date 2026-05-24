/**
 * United Kingdom — PAYE + National Insurance 2025-26
 * Tax year: 6 April 2025 – 5 April 2026
 *
 * Sources:
 *   Income tax rates & allowances: https://www.gov.uk/income-tax-rates
 *   National Insurance:            https://www.gov.uk/national-insurance/how-much-you-pay
 *   Scottish rates:                https://www.gov.scot/news/income-tax-rates-and-bands-2025-26/
 */

import { CountryModule, TaxOptions, SocialContributions, SpecialRegimeInfo } from '../types';

const r = (x: number) => Math.round(x * 100) / 100;

// ─── Personal Allowance ──────────────────────────────────────────────────────
// £12,570 standard; tapers by £1 per £2 of income above £100,000;
// fully eliminated at £125,140.
const PERSONAL_ALLOWANCE = 12570;
const TAPER_THRESHOLD    = 100000;
const TAPER_ZERO         = 125140;

function getPersonalAllowance(gross: number): number {
  if (gross <= TAPER_THRESHOLD) return PERSONAL_ALLOWANCE;
  if (gross >= TAPER_ZERO)      return 0;
  return Math.max(0, PERSONAL_ALLOWANCE - Math.floor((gross - TAPER_THRESHOLD) / 2));
}

// ─── England / Wales / NI income tax ────────────────────────────────────────
// Bands apply to TAXABLE income (= gross – personal allowance)
// Basic rate   20%: £0       – £37,700
// Higher rate  40%: £37,701  – £112,570   (gross £50,271–£125,140)
// Additional   45%: > £112,570             (gross > £125,140)
const BASIC_TOP  = 37700;
const HIGHER_TOP = 112570;

function calcIncomeTax(gross: number): number {
  const allowance = getPersonalAllowance(gross);
  const taxable   = Math.max(0, gross - allowance);

  if (taxable <= BASIC_TOP) {
    return r(taxable * 0.20);
  } else if (taxable <= HIGHER_TOP) {
    return r(BASIC_TOP * 0.20 + (taxable - BASIC_TOP) * 0.40);
  } else {
    return r(
      BASIC_TOP * 0.20 +
      (HIGHER_TOP - BASIC_TOP) * 0.40 +
      (taxable - HIGHER_TOP) * 0.45,
    );
  }
}

// ─── Scottish income tax ─────────────────────────────────────────────────────
// Source: https://www.gov.scot/news/income-tax-rates-and-bands-2025-26/
// Bands are on TAXABLE income (same Personal Allowance applies).
// Starter Rate 19%: £0       – £2,306
// Basic Rate   20%: £2,307   – £13,991
// Intermediate 21%: £13,992  – £31,092
// Higher Rate  42%: £31,093  – £62,430   (up to gross ~£75,000)
// Advanced     45%: £62,431  – £112,570  (up to gross ~£125,140)
// Top Rate     48%: > £112,570
const SCOTTISH_BANDS = [
  { top:   2306, rate: 0.19 },
  { top:  13991, rate: 0.20 },
  { top:  31092, rate: 0.21 },
  { top:  62430, rate: 0.42 },
  { top: 112570, rate: 0.45 },
  { top: Infinity, rate: 0.48 },
] as const;

function calcScottishIncomeTax(gross: number): number {
  const allowance = getPersonalAllowance(gross);
  const taxable   = Math.max(0, gross - allowance);
  let tax = 0;
  let prev = 0;
  for (const band of SCOTTISH_BANDS) {
    if (taxable <= prev) break;
    const slice = Math.min(taxable, band.top) - prev;
    tax += slice * band.rate;
    prev = band.top;
  }
  return r(tax);
}

// ─── National Insurance Class 1 (Employee) 2025-26 ──────────────────────────
// Primary Threshold (PT):       £12,570 / year
// Upper Earnings Limit (UEL):   £50,270 / year
// Main rate (PT→UEL):   8%
// Upper rate (>UEL):    2%
const NI_PT  = 12570;
const NI_UEL = 50270;

function calcNI(gross: number): number {
  if (gross <= NI_PT) return 0;
  const main  = (Math.min(gross, NI_UEL) - NI_PT) * 0.08;
  const upper = Math.max(0, gross - NI_UEL) * 0.02;
  return r(main + upper);
}

// ─── Module ──────────────────────────────────────────────────────────────────
export const gb: CountryModule = {
  countryCode: 'gb',

  calculateIncomeTax(_taxable: number, opts: TaxOptions): number {
    // NB: calculate.ts passes (gross – deductions) as first arg.
    // Since getDeductions() returns 0, _taxable === opts.gross.
    // Personal Allowance tapering depends on gross, so we recalculate from opts.gross.
    if (opts.region === 'scotland') {
      return calcScottishIncomeTax(opts.gross);
    }
    return calcIncomeTax(opts.gross);
  },

  getSocialContributions(gross: number, _opts: TaxOptions): SocialContributions {
    const ni = calcNI(gross);
    // NI broadly funds the NHS, state pension and other benefits.
    // Modelled under `unemployment` to keep breakdown visible.
    return { health: 0, pension: 0, unemployment: ni, care: 0, total: ni };
  },

  getDeductions(_gross: number, _opts: TaxOptions): number {
    // No standard deduction in UK PAYE — Personal Allowance is handled inside
    // calculateIncomeTax directly (it depends on gross for tapering logic).
    return 0;
  },

  getAvailableRegimes(): SpecialRegimeInfo[] {
    // No active special regimes currently modelled for GB.
    // Remittance Basis and Non-Dom status are being abolished from April 2025.
    return [];
  },

  applySpecialRegime(gross: number, _regimeId: string, opts: TaxOptions): number {
    return calcIncomeTax(gross);
  },

  getDisclaimer(locale: string): string {
    if (locale === 'en') {
      return 'UK 2025-26 (England/Wales/NI). PAYE system. Includes Class 1 National Insurance (employee, 8%/2%). Does not include student loan repayments, pension contributions, or employer-side NI. Scottish rates available via opts.region="scotland". Not tax advice.';
    }
    return 'UK 2025-26 (England/Wales/NI). PAYE-System. Enthält National Insurance Klasse 1 (Arbeitnehmer, 8%/2%). Ohne Studiendarlehen-Rückzahlung, Renteneinzahlungen oder Arbeitgeber-NI. Schottland: opts.region="scotland". Keine Steuerberatung.';
  },
};

export default gb;
