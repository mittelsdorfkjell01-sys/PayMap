import { CountryModule, TaxOptions, SocialContributions, SpecialRegimeInfo, TaxData } from '../types';
import { getDefaultTaxData } from '../data/countries';
import { bracketsFor, progressiveTax, deductionAmount } from '../data/helpers';

const r = (x: number) => Math.round(x * 100) / 100;

/**
 * Estonia. Flat tax (rate from data) with a basic allowance that phases out
 * linearly between two income thresholds (phase-out logic kept in code).
 */
function getBasicAllowance(gross: number, data: TaxData): number {
  const maxAllowance = deductionAmount(data, 'basic_allowance');
  const phaseOutStart = deductionAmount(data, 'allowance_phaseout_start');
  const phaseOutEnd = deductionAmount(data, 'allowance_phaseout_end');

  if (gross <= phaseOutStart) return maxAllowance;
  if (gross >= phaseOutEnd) return 0;

  const ratio = (gross - phaseOutStart) / (phaseOutEnd - phaseOutStart);
  return r(maxAllowance * (1 - ratio));
}

export const ee: CountryModule = {
  countryCode: 'ee',

  calculateIncomeTax(taxable: number, opts: TaxOptions, taxData?: TaxData): number {
    const data = taxData ?? getDefaultTaxData('ee', opts.year);
    return r(progressiveTax(Math.max(0, taxable), bracketsFor(data, 'employed')));
  },

  getSocialContributions(_gross: number, _opts: TaxOptions): SocialContributions {
    // Employer pays social tax (33%); employee share 0 for employed.
    return { health: 0, pension: 0, unemployment: 0, care: 0, total: 0 };
  },

  getDeductions(gross: number, opts: TaxOptions, taxData?: TaxData): number {
    const data = taxData ?? getDefaultTaxData('ee', opts.year);
    return getBasicAllowance(gross, data);
  },

  getAvailableRegimes(): SpecialRegimeInfo[] {
    return [
      {
        id: 'ou-ee',
        nameDE: 'OÜ Regime (Estland) — einbehaltene Gewinne',
        nameEN: 'OÜ Regime (Estonia) — retained profits',
        flatRate: 0,
        durationYears: 0,
      },
    ];
  },

  applySpecialRegime(gross: number, regimeId: string, opts: TaxOptions, taxData?: TaxData): number {
    const data = taxData ?? getDefaultTaxData('ee', opts.year);
    if (regimeId === 'ou-ee') {
      // Retained profits: 0% tax (distributions taxed at 20%).
      return 0;
    }
    return r(progressiveTax(Math.max(0, gross), bracketsFor(data, 'employed')));
  },

  getDisclaimer(locale: string): string {
    if (locale === 'en') {
      return 'Estonia 2025. Employer social tax (33%) not included. The OÜ regime assumes retained profits — distributions are taxed at 20%. Not tax advice.';
    }
    return 'Estland 2025. Arbeitgeber-Sozialsteuer (33%) nicht eingerechnet. Das OÜ-Regime geht von einbehaltenen Gewinnen aus — Ausschüttungen werden mit 20% besteuert. Keine Steuerberatung.';
  },
};

export default ee;
