import { CountryModule, TaxOptions, SocialContributions, SpecialRegimeInfo, TaxData } from '../types';
import { getDefaultTaxData } from '../data/countries';
import { bracketsFor, progressiveTax, socialAmount, deductionAmount, deductionPercentage } from '../data/helpers';

const r = (x: number) => Math.round(x * 100) / 100;

export const th: CountryModule = {
  countryCode: 'th',

  calculateIncomeTax(taxable: number, opts: TaxOptions, taxData?: TaxData): number {
    const data = taxData ?? getDefaultTaxData('th', opts.year);
    return r(progressiveTax(taxable, bracketsFor(data, 'employed')));
  },

  getSocialContributions(gross: number, opts: TaxOptions, taxData?: TaxData): SocialContributions {
    const data = taxData ?? getDefaultTaxData('th', opts.year);
    // 5% with an annual contribution cap (modelled via salary ceiling).
    const pension = r(socialAmount(data, 'social_security', gross));
    return { health: 0, pension, unemployment: 0, care: 0, total: pension };
  },

  getDeductions(gross: number, opts: TaxOptions, taxData?: TaxData): number {
    const data = taxData ?? getDefaultTaxData('th', opts.year);
    // Standard deduction: 50% of gross, capped.
    const pct = deductionPercentage(data, 'standard');
    const max = deductionAmount(data, 'standard_max');
    return r(Math.min(gross * pct, max));
  },

  getAvailableRegimes(): SpecialRegimeInfo[] {
    return [];
  },

  applySpecialRegime(_gross: number, _regimeId: string, _opts: TaxOptions): number {
    return 0;
  },

  getDisclaimer(locale: string): string {
    if (locale === 'en') {
      return 'Thailand 2025 (THB). Approximate calculation. Since 2024, foreign income remitted to Thailand is taxable. Personal allowances and additional deductions not fully included. Not tax advice.';
    }
    return 'Thailand 2025 (THB). Näherungsrechnung. Seit 2024 sind ausländische Einkünfte, die nach Thailand überwiesen werden, steuerpflichtig. Persönliche Freibeträge und weitere Abzüge nicht vollständig berücksichtigt. Keine Steuerberatung.';
  },
};

export default th;
