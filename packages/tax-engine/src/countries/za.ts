/**
 * South Africa — Personal Income Tax 2025/2026 (1 Mar 2025 – 28 Feb 2026).
 * Primary rebate reduces tax payable directly (tax credit, not income deduction).
 */

import { CountryModule, TaxOptions, SocialContributions, SpecialRegimeInfo, TaxData } from '../types';
import { getDefaultTaxData } from '../data/countries';
import { bracketsFor, progressiveTax, socialAmount, deductionAmount } from '../data/helpers';

const r = (x: number) => Math.round(x * 100) / 100;

function calcTaxAfterRebate(taxable: number, data: TaxData): number {
  const beforeRebate = progressiveTax(taxable, bracketsFor(data, 'employed'));
  const rebate = deductionAmount(data, 'primary_rebate');
  return r(Math.max(0, beforeRebate - rebate));
}

export const za: CountryModule = {
  countryCode: 'za',

  calculateIncomeTax(taxable: number, opts: TaxOptions, taxData?: TaxData): number {
    const data = taxData ?? getDefaultTaxData('za', opts.year);
    return calcTaxAfterRebate(taxable, data);
  },

  getSocialContributions(gross: number, opts: TaxOptions, taxData?: TaxData): SocialContributions {
    const data = taxData ?? getDefaultTaxData('za', opts.year);
    const uif = r(socialAmount(data, 'unemployment', gross));
    return { health: 0, pension: 0, unemployment: uif, care: 0, total: uif };
  },

  getDeductions(_gross: number, _opts: TaxOptions): number {
    return 0;
  },

  getAvailableRegimes(): SpecialRegimeInfo[] {
    return [];
  },

  applySpecialRegime(gross: number, _regimeId: string, opts: TaxOptions, taxData?: TaxData): number {
    const data = taxData ?? getDefaultTaxData('za', opts.year);
    return calcTaxAfterRebate(gross, data);
  },

  getDisclaimer(locale: string): string {
    if (locale === 'en') {
      return 'South Africa 2025/2026 tax year. Primary rebate R17,235 applied as tax credit. UIF 1% capped at R212,539/year. Medical aid tax credits not modelled. Not tax advice.';
    }
    return 'Südafrika Steuerjahr 2025/2026. Primary Rebate R17.235 als Steuerabzug. UIF 1 % gedeckelt bei R212.539/Jahr. Medical-Aid-Steuergutschriften nicht modelliert. Keine Steuerberatung.';
  },
};

export default za;
