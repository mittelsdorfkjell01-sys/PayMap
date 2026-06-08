import { CountryModule, TaxOptions, SocialContributions, SpecialRegimeInfo, TaxData } from '../types';
import { getDefaultTaxData } from '../data/countries';
import { bracketsFor, progressiveTax, socialAmount } from '../data/helpers';

const r = (x: number) => Math.round(x * 100) / 100;

function filingStatus(opts: TaxOptions): 'single' | 'married' {
  return opts.familyStatus === 'married' ? 'married' : 'single';
}

export const us: CountryModule = {
  countryCode: 'us',

  calculateIncomeTax(taxable: number, opts: TaxOptions, taxData?: TaxData): number {
    const data = taxData ?? getDefaultTaxData('us', opts.year);
    // Federal scale by filing status. State layer + NYC city tax: see fix A.3.
    return r(progressiveTax(taxable, bracketsFor(data, 'employed', { filingStatus: filingStatus(opts) })));
  },

  getSocialContributions(gross: number, opts: TaxOptions, taxData?: TaxData): SocialContributions {
    const data = taxData ?? getDefaultTaxData('us', opts.year);
    // FICA: Social Security (capped) + Medicare (uncapped).
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
      return 'USA 2025 — Federal Income Tax only. State income tax (0–13% depending on state) not included. Significant variations by state possible. Not tax advice.';
    }
    return 'USA 2025 — Nur Federal Income Tax. State Tax (0–13%, je nach Bundesstaat) nicht eingerechnet. Erhebliche Abweichungen je nach Bundesstaat möglich. Keine Steuerberatung.';
  },
};

export default us;
