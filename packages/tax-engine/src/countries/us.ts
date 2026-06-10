import { CountryModule, TaxOptions, SocialContributions, SpecialRegimeInfo, TaxData } from '../types';
import { getDefaultTaxData } from '../data/countries';
import {
  bracketsFor,
  regionalBracketsFor,
  progressiveTax,
  socialAmount,
  surchargesFor,
  applySurcharge,
} from '../data/helpers';

const r = (x: number) => Math.round(x * 100) / 100;

function filingStatus(opts: TaxOptions): 'single' | 'married' {
  return opts.familyStatus === 'married' ? 'married' : 'single';
}

// State standard deduction (e.g. NY) is encoded on a deduction row whose
// `condition` is "<region>:<filingStatus>" (or "<region>"). 0 when absent.
function stateStandardDeduction(data: TaxData, region: string, fs: string): number {
  const d =
    data.deductions.find((x) => x.type === 'standard_state' && x.condition === `${region}:${fs}`) ??
    data.deductions.find((x) => x.type === 'standard_state' && x.condition === region);
  return d?.amount ?? 0;
}

// Federal (on federal taxable) + state layer + city tax (both on the state's own
// taxable income = gross − state standard deduction). Florida has no state
// brackets → state/city layers are 0 (A.3).
function usIncomeTax(taxable: number, opts: TaxOptions, data: TaxData): number {
  const fs = filingStatus(opts);
  const federal = progressiveTax(taxable, bracketsFor(data, 'employed', { filingStatus: fs }));

  let state = 0;
  let city = 0;
  if (opts.region) {
    const stateTaxable = Math.max(0, opts.gross - stateStandardDeduction(data, opts.region, fs));
    state = progressiveTax(stateTaxable, regionalBracketsFor(data, 'employed', opts.region, { filingStatus: fs }));
    if (opts.cityScope) {
      for (const s of surchargesFor(data, 'nyc_city', { cityScope: opts.cityScope })) {
        // NYC thresholds differ by filing status (variantKey single/married).
        if (s.variantKey && s.variantKey !== fs) continue;
        city += applySurcharge(s, stateTaxable);
      }
    }
  }
  return federal + state + city;
}

export const us: CountryModule = {
  countryCode: 'us',

  calculateIncomeTax(taxable: number, opts: TaxOptions, taxData?: TaxData): number {
    const data = taxData ?? getDefaultTaxData('us', opts.year);
    return r(usIncomeTax(taxable, opts, data));
  },

  getSocialContributions(gross: number, opts: TaxOptions, taxData?: TaxData): SocialContributions {
    const data = taxData ?? getDefaultTaxData('us', opts.year);
    const pension = r(socialAmount(data, 'social_security', gross));
    const health = r(socialAmount(data, 'medicare', gross));
    const total = r(pension + health);
    return { health, pension, unemployment: 0, care: 0, total };
  },

  getDeductions(_gross: number, opts: TaxOptions, taxData?: TaxData): number {
    const data = taxData ?? getDefaultTaxData('us', opts.year);
    const cond = filingStatus(opts);
    const row = data.deductions.find((d) => d.type === 'standard' && d.condition === cond);
    return r(row?.amount ?? 0);
  },

  getAvailableRegimes(): SpecialRegimeInfo[] {
    return [];
  },

  applySpecialRegime(_gross: number, _regimeId: string, _opts: TaxOptions): number {
    return 0;
  },

  getDisclaimer(locale: string): string {
    if (locale === 'en') {
      return 'USA 2025 — Federal + state income tax. New York incl. NYC city tax; Florida has no state income tax. NY tax-benefit recapture (>$107,650) approximated. Not tax advice.';
    }
    return 'USA 2025 — Federal + State Income Tax. New York inkl. NYC City Tax; Florida ohne State Tax. NY Tax-Benefit-Recapture (>107.650 $) approximiert. Keine Steuerberatung.';
  },
};

export default us;
