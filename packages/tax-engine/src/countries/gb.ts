/**
 * United Kingdom — PAYE + National Insurance 2025-26
 * Tax year: 6 April 2025 – 5 April 2026
 *
 * Income-tax bands (England/Wales/NI + Scotland) and NI thresholds/rates come
 * from taxData; the Personal Allowance taper and NI band logic stay in code.
 *
 * Sources:
 *   Income tax rates & allowances: https://www.gov.uk/income-tax-rates
 *   National Insurance:            https://www.gov.uk/national-insurance/how-much-you-pay
 *   Scottish rates:                https://www.gov.scot/news/income-tax-rates-and-bands-2025-26/
 */

import { CountryModule, TaxOptions, SocialContributions, SpecialRegimeInfo, TaxData } from '../types';
import { getDefaultTaxData } from '../data/countries';
import { bracketsFor, progressiveTax, socialRate, socialCeiling, deductionAmount } from '../data/helpers';

const r = (x: number) => Math.round(x * 100) / 100;

// Personal Allowance tapers by £1 per £2 of income above the taper threshold.
function getPersonalAllowance(gross: number, data: TaxData): number {
  const pa = deductionAmount(data, 'personal_allowance');
  const threshold = deductionAmount(data, 'taper_threshold');
  const zero = deductionAmount(data, 'taper_zero');
  if (gross <= threshold) return pa;
  if (gross >= zero) return 0;
  return Math.max(0, pa - Math.floor((gross - threshold) / 2));
}

function calcIncomeTax(gross: number, data: TaxData, scotland: boolean): number {
  const allowance = getPersonalAllowance(gross, data);
  const taxable = Math.max(0, gross - allowance);
  const brackets = bracketsFor(data, scotland ? 'scotland' : 'employed');
  return r(progressiveTax(taxable, brackets));
}

// NI Class 1 (Employee): main rate between Primary Threshold and Upper Earnings
// Limit, upper rate above the UEL.
function calcNI(gross: number, data: TaxData): number {
  const pt = deductionAmount(data, 'ni_primary_threshold');
  const uel = socialCeiling(data, 'ni_main') ?? Infinity;
  const mainRate = socialRate(data, 'ni_main');
  const upperRate = socialRate(data, 'ni_upper');
  if (gross <= pt) return 0;
  const main = (Math.min(gross, uel) - pt) * mainRate;
  const upper = Math.max(0, gross - uel) * upperRate;
  return r(main + upper);
}

export const gb: CountryModule = {
  countryCode: 'gb',

  calculateIncomeTax(_taxable: number, opts: TaxOptions, taxData?: TaxData): number {
    const data = taxData ?? getDefaultTaxData('gb', opts.year);
    // getDeductions() returns 0, so _taxable === opts.gross; PA taper depends on
    // gross, so we recompute from opts.gross.
    return calcIncomeTax(opts.gross, data, opts.region === 'scotland');
  },

  getSocialContributions(gross: number, opts: TaxOptions, taxData?: TaxData): SocialContributions {
    const data = taxData ?? getDefaultTaxData('gb', opts.year);
    const ni = calcNI(gross, data);
    // NI broadly funds the NHS, state pension and other benefits; modelled under
    // `unemployment` to keep the breakdown line visible.
    return { health: 0, pension: 0, unemployment: ni, care: 0, total: ni };
  },

  getDeductions(_gross: number, _opts: TaxOptions): number {
    // Personal Allowance is applied inside calculateIncomeTax (it depends on
    // gross for tapering), so no separate standard deduction here.
    return 0;
  },

  getAvailableRegimes(): SpecialRegimeInfo[] {
    return [];
  },

  applySpecialRegime(gross: number, _regimeId: string, opts: TaxOptions, taxData?: TaxData): number {
    const data = taxData ?? getDefaultTaxData('gb', opts.year);
    return calcIncomeTax(gross, data, opts.region === 'scotland');
  },

  getDisclaimer(locale: string): string {
    if (locale === 'en') {
      return 'UK 2025-26 (England/Wales/NI). PAYE system. Includes Class 1 National Insurance (employee, 8%/2%). Does not include student loan repayments, pension contributions, or employer-side NI. Scottish rates available via opts.region="scotland". Not tax advice.';
    }
    return 'UK 2025-26 (England/Wales/NI). PAYE-System. Enthält National Insurance Klasse 1 (Arbeitnehmer, 8%/2%). Ohne Studiendarlehen-Rückzahlung, Renteneinzahlungen oder Arbeitgeber-NI. Schottland: opts.region="scotland". Keine Steuerberatung.';
  },
};

export default gb;
