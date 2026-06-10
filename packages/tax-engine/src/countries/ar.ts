/**
 * Argentina — Impuesto a las Ganancias 4ª categoría 2025
 * ⚠ HIGH UNCERTAINTY: brackets and MNI are adjusted quarterly for inflation.
 */

import { CountryModule, TaxOptions, SocialContributions, SpecialRegimeInfo, TaxData } from '../types';
import { getDefaultTaxData } from '../data/countries';
import { bracketsFor, progressiveTax, socialAmount, deductionAmount } from '../data/helpers';

const r = (x: number) => Math.round(x * 100) / 100;

export const ar: CountryModule = {
  countryCode: 'ar',

  calculateIncomeTax(taxable: number, opts: TaxOptions, taxData?: TaxData): number {
    const data = taxData ?? getDefaultTaxData('ar', opts.year);
    return r(progressiveTax(taxable, bracketsFor(data, 'employed')));
  },

  getSocialContributions(gross: number, opts: TaxOptions, taxData?: TaxData): SocialContributions {
    const data = taxData ?? getDefaultTaxData('ar', opts.year);
    const pension = r(socialAmount(data, 'pension', gross)); // jubilación
    const health = r(socialAmount(data, 'health', gross)); // PAMI + obra social
    return { health, pension, unemployment: 0, care: 0, total: r(health + pension) };
  },

  getDeductions(gross: number, opts: TaxOptions, taxData?: TaxData): number {
    const data = taxData ?? getDefaultTaxData('ar', opts.year);
    return Math.min(gross, deductionAmount(data, 'mni'));
  },

  getAvailableRegimes(): SpecialRegimeInfo[] {
    return [];
  },

  applySpecialRegime(gross: number, _regimeId: string, opts: TaxOptions, taxData?: TaxData): number {
    const data = taxData ?? getDefaultTaxData('ar', opts.year);
    return r(progressiveTax(Math.max(0, gross - deductionAmount(data, 'mni')), bracketsFor(data, 'employed')));
  },

  getDisclaimer(locale: string): string {
    if (locale === 'en') {
      return '⚠ Argentina Ganancias 2025 — APPROXIMATE. Brackets and MNI are updated quarterly for inflation (AFIP). MNI ~ARS 38.4M/year (Q1 2025). Social: jubilación 11% + PAMI 3% + obra social 3%. High uncertainty — not tax advice.';
    }
    return '⚠ Argentinien Ganancias 2025 — NÄHERUNGSWERT. Brackets und MNI werden quartalsweise für Inflation angepasst (AFIP). MNI ~ARS 38,4 Mio./Jahr (Q1 2025). Sozialabgaben: Jubilación 11 % + PAMI 3 % + Obra Social 3 %. Hohe Unsicherheit — keine Steuerberatung.';
  },
};

export default ar;
