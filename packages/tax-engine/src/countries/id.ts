/**
 * Indonesia — PPh 21 Income Tax 2025
 * Source: https://www.pajak.go.id/
 *
 * Brackets apply to PKP (Penghasilan Kena Pajak) = gross - PTKP.
 * PTKP 2025 (non-taxable threshold): Rp 54,000,000/year (single, no dependants).
 *
 * BPJS social contributions (employee share):
 *   BPJS Kesehatan (health): 1%, salary ceiling Rp 12,000,000/month (= Rp 144,000,000/year)
 *   BPJS TK JHT (retirement savings): 2% (no ceiling)
 *   BPJS TK JP (pension): 1%, salary ceiling Rp 9,911,200/month (= Rp 118,934,400/year)
 *
 * No capital gains tax on most personal assets.
 */

import { CountryModule, TaxOptions, SocialContributions, SpecialRegimeInfo } from '../types';

const r = (x: number) => Math.round(x * 100) / 100;

const PTKP_SINGLE = 54_000_000;
const KESEHATAN_CAP = 144_000_000;
const JP_CAP        = 118_934_400;

const ID_BRACKETS = [
  { from:           0, to:    60_000_000, rate: 0.05 },
  { from:  60_000_000, to:   250_000_000, rate: 0.15 },
  { from: 250_000_000, to:   500_000_000, rate: 0.25 },
  { from: 500_000_000, to: 5_000_000_000, rate: 0.30 },
  { from: 5_000_000_000, to: Infinity,    rate: 0.35 },
];

function calcIncomeTax(pkp: number): number {
  let tax = 0;
  for (const b of ID_BRACKETS) {
    if (pkp <= b.from) break;
    tax += (Math.min(pkp, b.to) - b.from) * b.rate;
  }
  return r(tax);
}

export const id: CountryModule = {
  countryCode: 'id',

  calculateIncomeTax(taxable: number, _opts: TaxOptions): number {
    return calcIncomeTax(taxable);
  },

  getSocialContributions(gross: number, _opts: TaxOptions): SocialContributions {
    const health  = r(Math.min(gross, KESEHATAN_CAP) * 0.01);
    const jht     = r(gross * 0.02);
    const jp      = r(Math.min(gross, JP_CAP) * 0.01);
    const pension = r(jht + jp);
    return { health, pension, unemployment: 0, care: 0, total: r(health + pension) };
  },

  getDeductions(gross: number, _opts: TaxOptions): number {
    return Math.min(gross, PTKP_SINGLE);
  },

  getAvailableRegimes(): SpecialRegimeInfo[] {
    return [];
  },

  applySpecialRegime(gross: number, _regimeId: string, _opts: TaxOptions): number {
    return calcIncomeTax(Math.max(0, gross - PTKP_SINGLE));
  },

  getDisclaimer(locale: string): string {
    if (locale === 'en') {
      return 'Indonesia PPh 21 2025. PTKP Rp 54,000,000 (single). BPJS health capped at Rp 144M/year; JHT 2%; JP 1% capped at Rp 118.9M/year. Tax brackets apply to taxable income after PTKP. Not tax advice.';
    }
    return 'Indonesien PPh 21 2025. PTKP Rp 54.000.000 (ledig). BPJS-Gesundheit gedeckelt bei Rp 144 Mio./Jahr; JHT 2 %; JP 1 % gedeckelt bei Rp 118,9 Mio./Jahr. Steuerbrackets gelten für das zu versteuernde Einkommen nach PTKP. Keine Steuerberatung.';
  },
};

export default id;
