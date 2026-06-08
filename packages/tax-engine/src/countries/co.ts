/**
 * Colombia — Impuesto sobre la Renta 2025. Brackets in UVT (COP 49,799).
 * Deductions: mandatory social (8%) + 25% renta exenta (capped 790 UVT).
 */

import { CountryModule, TaxOptions, SocialContributions, SpecialRegimeInfo, TaxData } from '../types';
import { getDefaultTaxData } from '../data/countries';
import { bracketsFor, progressiveTax, socialAmount, deductionAmount, deductionPercentage } from '../data/helpers';

const r = (x: number) => Math.round(x * 100) / 100;

function coDeductions(gross: number, data: TaxData): number {
  const social = socialAmount(data, 'health', gross) + socialAmount(data, 'pension', gross);
  const netOfSocial = gross - social;
  const cap = deductionAmount(data, 'renta_exenta_cap');
  const rentaExenta = Math.min(netOfSocial * deductionPercentage(data, 'renta_exenta'), cap);
  return r(social + rentaExenta);
}

export const co: CountryModule = {
  countryCode: 'co',

  calculateIncomeTax(taxable: number, opts: TaxOptions, taxData?: TaxData): number {
    const data = taxData ?? getDefaultTaxData('co', opts.year);
    return r(progressiveTax(taxable, bracketsFor(data, 'employed')));
  },

  getSocialContributions(gross: number, opts: TaxOptions, taxData?: TaxData): SocialContributions {
    const data = taxData ?? getDefaultTaxData('co', opts.year);
    const health = r(socialAmount(data, 'health', gross));
    const pension = r(socialAmount(data, 'pension', gross));
    return { health, pension, unemployment: 0, care: 0, total: r(health + pension) };
  },

  getDeductions(gross: number, opts: TaxOptions, taxData?: TaxData): number {
    const data = taxData ?? getDefaultTaxData('co', opts.year);
    return coDeductions(gross, data);
  },

  getAvailableRegimes(): SpecialRegimeInfo[] {
    return [];
  },

  applySpecialRegime(gross: number, _regimeId: string, opts: TaxOptions, taxData?: TaxData): number {
    const data = taxData ?? getDefaultTaxData('co', opts.year);
    return r(progressiveTax(Math.max(0, gross - coDeductions(gross, data)), bracketsFor(data, 'employed')));
  },

  getDisclaimer(locale: string): string {
    if (locale === 'en') {
      return 'Colombia 2025. UVT = COP 49,799. Brackets on taxable income after 8% social deduction + 25% renta exenta (capped 790 UVT). Social: salud 4% + pensión 4%. Not tax advice.';
    }
    return 'Kolumbien 2025. UVT = COP 49.799. Brackets auf zu versteuerndes Einkommen nach 8 % Sozialabgaben + 25 % renta exenta (max. 790 UVT). Sozialabgaben: salud 4 % + pensión 4 %. Keine Steuerberatung.';
  },
};

export default co;
