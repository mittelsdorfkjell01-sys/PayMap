import { CountryModule, TaxOptions, SocialContributions, SpecialRegimeInfo, TaxData } from '../types';
import { getDefaultTaxData } from '../data/countries';
import { bracketsFor, progressiveTax, socialAmount, deductionAmount, deductionPercentage } from '../data/helpers';

const r = (x: number) => Math.round(x * 100) / 100;

export const fr: CountryModule = {
  countryCode: 'fr',

  calculateIncomeTax(taxable: number, opts: TaxOptions, taxData?: TaxData): number {
    const data = taxData ?? getDefaultTaxData('fr', opts.year);
    const tax = progressiveTax(taxable, bracketsFor(data, 'employed'));
    // Décote (single): reduces small tax bills, 0 above ~€1.964. No effect at
    // the typical comparison incomes (tax ≫ threshold) but accurate for low ones.
    const decoteMax = deductionAmount(data, 'decote_single');
    const decote = Math.max(0, decoteMax - deductionPercentage(data, 'decote_rate') * tax);
    return r(Math.max(0, tax - decote));
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

  applySpecialRegime(gross: number, _regimeId: string, opts: TaxOptions, taxData?: TaxData): number {
    // Régime des impatriés: die 30 % betreffen nur die Impatriierungs-Prämie
    // (prime d'impatriation), die sich aus dem Gesamtgehalt nicht isolieren
    // lässt. Daher KEINE Reduktion des berechneten Gehalts-Nettos — Normaltarif
    // zurückgeben. Die API erkennt dadurch hasEffect=false und zeigt nur eine
    // Hinweiskarte statt einer (irreführenden) Zahl.
    const data = taxData ?? getDefaultTaxData('fr', opts.year);
    const taxable = Math.max(0, gross - fr.getDeductions(gross, opts, data));
    return r(fr.calculateIncomeTax(taxable, opts, data));
  },

  getDisclaimer(locale: string): string {
    if (locale === 'en') {
      return 'France 2025. Approximate calculation with the 10% abatement and the décote (low-income tax reduction). Social contributions (CSG, CRDS, etc.) simplified to 22%. Quotient familial for married/children not fully modeled. Not tax advice.';
    }
    return 'Frankreich 2025. Näherungsrechnung inkl. 10%-Abschlag und Décote (Steuerermäßigung für niedrige Einkommen). Sozialabgaben (CSG, CRDS etc.) vereinfacht auf 22%. Quotient familial für Verheiratete/Kinder nicht vollständig abgebildet. Keine Steuerberatung.';
  },
};

export default fr;
