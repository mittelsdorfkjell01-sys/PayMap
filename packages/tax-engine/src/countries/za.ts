/**
 * South Africa — Personal Income Tax 2025/2026 (1 March 2025 – 28 Feb 2026)
 * Source: https://www.sars.gov.za/
 *
 * Primary rebate (R17,235) reduces tax payable directly — modelled inside
 * calculateIncomeTax (tax credit, not an income deduction).
 *
 * UIF (Unemployment Insurance Fund): 1% employee contribution,
 * capped at a monthly remuneration of R17,711.58 (= R212,539/year).
 *
 * No mandatory medical aid contribution from gross (medical aid tax credits
 * exist but are complex and not modelled here).
 */

import { CountryModule, TaxOptions, SocialContributions, SpecialRegimeInfo } from '../types';

const r = (x: number) => Math.round(x * 100) / 100;

const PRIMARY_REBATE = 17_235;
const UIF_SALARY_CAP = 212_539; // R17,711.58/month × 12

const ZA_BRACKETS = [
  { from:         0, to:   237_100, rate: 0.18 },
  { from:   237_100, to:   370_500, rate: 0.26 },
  { from:   370_500, to:   512_800, rate: 0.31 },
  { from:   512_800, to:   673_000, rate: 0.36 },
  { from:   673_000, to:   857_900, rate: 0.39 },
  { from:   857_900, to: 1_817_000, rate: 0.41 },
  { from: 1_817_000, to:  Infinity, rate: 0.45 },
];

function calcBrackets(taxable: number): number {
  let tax = 0;
  for (const b of ZA_BRACKETS) {
    if (taxable <= b.from) break;
    tax += (Math.min(taxable, b.to) - b.from) * b.rate;
  }
  return r(tax);
}

export const za: CountryModule = {
  countryCode: 'za',

  calculateIncomeTax(taxable: number, _opts: TaxOptions): number {
    return r(Math.max(0, calcBrackets(taxable) - PRIMARY_REBATE));
  },

  getSocialContributions(gross: number, _opts: TaxOptions): SocialContributions {
    const uif = r(Math.min(gross, UIF_SALARY_CAP) * 0.01);
    return { health: 0, pension: 0, unemployment: uif, care: 0, total: uif };
  },

  getDeductions(_gross: number, _opts: TaxOptions): number {
    return 0;
  },

  getAvailableRegimes(): SpecialRegimeInfo[] {
    return [];
  },

  applySpecialRegime(gross: number, _regimeId: string, _opts: TaxOptions): number {
    return r(Math.max(0, calcBrackets(gross) - PRIMARY_REBATE));
  },

  getDisclaimer(locale: string): string {
    if (locale === 'en') {
      return 'South Africa 2025/2026 tax year. Primary rebate R17,235 applied as tax credit. UIF 1% capped at R212,539/year. Medical aid tax credits not modelled. Not tax advice.';
    }
    return 'Südafrika Steuerjahr 2025/2026. Primary Rebate R17.235 als Steuerabzug. UIF 1 % gedeckelt bei R212.539/Jahr. Medical-Aid-Steuergutschriften nicht modelliert. Keine Steuerberatung.';
  },
};

export default za;
