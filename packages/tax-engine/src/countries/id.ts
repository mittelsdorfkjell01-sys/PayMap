/**
 * Indonesia — PPh 21 Income Tax 2025. Brackets apply to PKP (gross − PTKP).
 * BPJS employee contributions: Kesehatan 1% (capped), JHT 2%, JP 1% (capped).
 */

import { CountryModule, TaxOptions, SocialContributions, SpecialRegimeInfo, TaxData } from '../types';
import { getDefaultTaxData } from '../data/countries';
import { bracketsFor, progressiveTax, socialAmount, deductionAmount } from '../data/helpers';

const r = (x: number) => Math.round(x * 100) / 100;

export const id: CountryModule = {
  countryCode: 'id',

  calculateIncomeTax(taxable: number, opts: TaxOptions, taxData?: TaxData): number {
    const data = taxData ?? getDefaultTaxData('id', opts.year);
    return r(progressiveTax(taxable, bracketsFor(data, 'employed')));
  },

  getSocialContributions(gross: number, opts: TaxOptions, taxData?: TaxData): SocialContributions {
    const data = taxData ?? getDefaultTaxData('id', opts.year);
    const health = r(socialAmount(data, 'health', gross)); // BPJS Kesehatan (capped)
    const jht = socialAmount(data, 'jht', gross);
    const jp = socialAmount(data, 'jp', gross); // capped
    const pension = r(jht + jp);
    return { health, pension, unemployment: 0, care: 0, total: r(health + pension) };
  },

  getDeductions(gross: number, opts: TaxOptions, taxData?: TaxData): number {
    const data = taxData ?? getDefaultTaxData('id', opts.year);
    return Math.min(gross, deductionAmount(data, 'ptkp'));
  },

  getAvailableRegimes(): SpecialRegimeInfo[] {
    return [];
  },

  applySpecialRegime(gross: number, _regimeId: string, opts: TaxOptions, taxData?: TaxData): number {
    const data = taxData ?? getDefaultTaxData('id', opts.year);
    return r(progressiveTax(Math.max(0, gross - deductionAmount(data, 'ptkp')), bracketsFor(data, 'employed')));
  },

  getDisclaimer(locale: string): string {
    if (locale === 'en') {
      return 'Indonesia PPh 21 2025. PTKP Rp 54,000,000 (single). BPJS health capped at Rp 144M/year; JHT 2%; JP 1% capped at Rp 118.9M/year. Tax brackets apply to taxable income after PTKP. Not tax advice.';
    }
    return 'Indonesien PPh 21 2025. PTKP Rp 54.000.000 (ledig). BPJS-Gesundheit gedeckelt bei Rp 144 Mio./Jahr; JHT 2 %; JP 1 % gedeckelt bei Rp 118,9 Mio./Jahr. Steuerbrackets gelten für das zu versteuernde Einkommen nach PTKP. Keine Steuerberatung.';
  },
};

export default id;
