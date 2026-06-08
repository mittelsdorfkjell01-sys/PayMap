import { CountryModule, TaxOptions, SocialContributions, SpecialRegimeInfo, TaxData } from '../types';
import { getDefaultTaxData } from '../data/countries';
import { bracketsFor, progressiveTax, socialAmount, deductionAmount, deductionPercentage } from '../data/helpers';

const r = (x: number) => Math.round(x * 100) / 100;

export const fr: CountryModule = {
  countryCode: 'fr',

  calculateIncomeTax(taxable: number, opts: TaxOptions, taxData?: TaxData): number {
    const data = taxData ?? getDefaultTaxData('fr', opts.year);
    return r(progressiveTax(taxable, bracketsFor(data, 'employed')));
  },

  getSocialContributions(gross: number, opts: TaxOptions, taxData?: TaxData): SocialContributions {
    const data = taxData ?? getDefaultTaxData('fr', opts.year);
    // Simplified aggregate ~22%; pension/health shown for the breakdown.
    const total = r(socialAmount(data, 'total', gross));
    const pension = r(socialAmount(data, 'pension', gross));
    const health = r(socialAmount(data, 'health', gross)); // CSG + CRDS + KV
    return { health, pension, unemployment: 0, care: 0, total };
  },

  getDeductions(gross: number, opts: TaxOptions, taxData?: TaxData): number {
    const data = taxData ?? getDefaultTaxData('fr', opts.year);
    // Abatement: 10% Pauschalabzug, min/max from data.
    const abatement = gross * deductionPercentage(data, 'abatement');
    const min = deductionAmount(data, 'abatement_min');
    const max = deductionAmount(data, 'abatement_max');
    return r(Math.min(max, Math.max(min, abatement)));
  },

  getAvailableRegimes(): SpecialRegimeInfo[] {
    return [];
  },

  applySpecialRegime(_gross: number, _regimeId: string, _opts: TaxOptions): number {
    return 0;
  },

  getDisclaimer(locale: string): string {
    if (locale === 'en') {
      return 'France 2025. Approximate calculation. Social contributions (CSG, CRDS, etc.) simplified to 22%. Quotient familial for married/children reduces tax but is not fully modeled. Not tax advice.';
    }
    return 'Frankreich 2025. Näherungsrechnung. Sozialabgaben (CSG, CRDS etc.) vereinfacht auf 22%. Quotient familial für Verheiratete/Kinder nicht vollständig abgebildet. Keine Steuerberatung.';
  },
};

export default fr;
