import { CountryModule, TaxOptions, SocialContributions, SpecialRegimeInfo, TaxData } from '../types';
import { getDefaultTaxData } from '../data/countries';
import { bracketsFor, progressiveTax, socialAmount, deductionAmount } from '../data/helpers';

const r = (x: number) => Math.round(x * 100) / 100;

/**
 * Poland 2025 (PLN). 12/32% scale over the 30k allowance, plus a 4% solidarity
 * levy on income above 1M PLN (modelled as a surcharge row).
 */
function calcIncomeTax(taxable: number, data: TaxData): number {
  const grundfreibetrag = deductionAmount(data, 'grundfreibetrag');
  const effective = Math.max(0, taxable - grundfreibetrag);
  let tax = progressiveTax(effective, bracketsFor(data, 'employed'));

  const solidarity = data.surcharges.find((s) => s.type === 'solidarity');
  if (solidarity) {
    const allowance = solidarity.allowance ?? 0;
    const rate = solidarity.rate ?? 0;
    if (taxable > allowance) tax += (taxable - allowance) * rate;
  }
  return r(tax);
}

export const pl: CountryModule = {
  countryCode: 'pl',

  calculateIncomeTax(taxable: number, opts: TaxOptions, taxData?: TaxData): number {
    const data = taxData ?? getDefaultTaxData('pl', opts.year);
    return calcIncomeTax(taxable, data);
  },

  getSocialContributions(gross: number, opts: TaxOptions, taxData?: TaxData): SocialContributions {
    const data = taxData ?? getDefaultTaxData('pl', opts.year);
    const pension = r(socialAmount(data, 'pension', gross));
    const health = r(socialAmount(data, 'health', gross));
    const unemployment = r(socialAmount(data, 'unemployment', gross));
    const total = r(pension + health + unemployment);
    return { health, pension, unemployment, care: 0, total };
  },

  getDeductions(_gross: number, _opts: TaxOptions): number {
    return 0;
  },

  getAvailableRegimes(): SpecialRegimeInfo[] {
    return [];
  },

  applySpecialRegime(_gross: number, _regimeId: string, _opts: TaxOptions): number {
    return 0;
  },

  getDisclaimer(locale: string): string {
    if (locale === 'en') {
      return 'Poland 2025 (PLN). Approximate calculation. Tax relief for young earners (under 26) and other deductions not included. Not tax advice.';
    }
    return 'Polen 2025 (PLN). Näherungsrechnung. Steuererleichterungen für Jungverdiener (unter 26 Jahre) und weitere Abzüge nicht berücksichtigt. Keine Steuerberatung.';
  },
};

export default pl;
