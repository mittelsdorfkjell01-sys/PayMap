/**
 * Mexico — ISR (Impuesto sobre la Renta) 2024/2025. Annual brackets per
 * Art. 96 LISR. IMSS employee contributions simplified (~2.4%).
 */

import { CountryModule, TaxOptions, SocialContributions, SpecialRegimeInfo, TaxData } from '../types';
import { getDefaultTaxData } from '../data/countries';
import { bracketsFor, progressiveTax, socialAmount } from '../data/helpers';

const r = (x: number) => Math.round(x * 100) / 100;

export const mx: CountryModule = {
  countryCode: 'mx',

  calculateIncomeTax(taxable: number, opts: TaxOptions, taxData?: TaxData): number {
    const data = taxData ?? getDefaultTaxData('mx', opts.year);
    return r(progressiveTax(taxable, bracketsFor(data, 'employed')));
  },

  getSocialContributions(gross: number, opts: TaxOptions, taxData?: TaxData): SocialContributions {
    const data = taxData ?? getDefaultTaxData('mx', opts.year);
    const health = r(socialAmount(data, 'health', gross)); // EyM ≈ 1%
    const pension = r(socialAmount(data, 'pension', gross)); // RCV ≈ 1.4%
    return { health, pension, unemployment: 0, care: 0, total: r(health + pension) };
  },

  getDeductions(_gross: number, _opts: TaxOptions): number {
    return 0;
  },

  getAvailableRegimes(): SpecialRegimeInfo[] {
    return [];
  },

  applySpecialRegime(gross: number, _regimeId: string, opts: TaxOptions, taxData?: TaxData): number {
    const data = taxData ?? getDefaultTaxData('mx', opts.year);
    return r(progressiveTax(gross, bracketsFor(data, 'employed')));
  },

  getDisclaimer(locale: string): string {
    if (locale === 'en') {
      return 'Mexico ISR 2024/2025. Annual brackets per Art. 96 LISR. IMSS employee contributions simplified (~2.4%); actual IMSS uses UMA-based calculation. Not tax advice.';
    }
    return 'Mexiko ISR 2024/2025. Jahresbrackets gemäß Art. 96 LISR. IMSS-Arbeitnehmeranteil vereinfacht (~2,4 %); tatsächliche IMSS-Berechnung basiert auf UMA. Keine Steuerberatung.';
  },
};

export default mx;
