/**
 * Colombia — Impuesto sobre la Renta 2025
 * Source: https://www.dian.gov.co/
 *
 * Brackets are expressed in UVT (Unidad de Valor Tributario).
 * UVT 2025: COP 49,799 (DIAN resolución 192/2024).
 *
 * Deductions for employees (Art. 206 ET):
 *   - Mandatory social contributions (salud 4% + pensión 4% = 8%) are deductible.
 *   - 25% "renta exenta" on net-of-social employment income, capped at 790 UVT/year.
 *
 * Social contributions (employee share):
 *   Salud: 4% | Pensión: 4%  (Solidaridad: minor, not modelled)
 */

import { CountryModule, TaxOptions, SocialContributions, SpecialRegimeInfo } from '../types';

const r = (x: number) => Math.round(x * 100) / 100;

const UVT = 49_799;
const RENTA_EXENTA_CAP = 790 * UVT; // ~39,341,210 COP

const CO_BRACKETS = [
  { from:             0, to:  1_090 * UVT, rate: 0.00 },
  { from:  1_090 * UVT,  to:  1_700 * UVT, rate: 0.19 },
  { from:  1_700 * UVT,  to:  4_100 * UVT, rate: 0.28 },
  { from:  4_100 * UVT,  to:  8_670 * UVT, rate: 0.33 },
  { from:  8_670 * UVT,  to: 18_970 * UVT, rate: 0.35 },
  { from: 18_970 * UVT,  to: 31_000 * UVT, rate: 0.37 },
  { from: 31_000 * UVT,  to: Infinity,      rate: 0.39 },
];

function calcIncomeTax(taxable: number): number {
  let tax = 0;
  for (const b of CO_BRACKETS) {
    if (taxable <= b.from) break;
    tax += (Math.min(taxable, b.to) - b.from) * b.rate;
  }
  return r(tax);
}

function coDeductions(gross: number): number {
  const social       = r(gross * 0.08);
  const netOfSocial  = gross - social;
  const rentaExenta  = r(Math.min(netOfSocial * 0.25, RENTA_EXENTA_CAP));
  return r(social + rentaExenta);
}

export const co: CountryModule = {
  countryCode: 'co',

  calculateIncomeTax(taxable: number, _opts: TaxOptions): number {
    return calcIncomeTax(taxable);
  },

  getSocialContributions(gross: number, _opts: TaxOptions): SocialContributions {
    const health  = r(gross * 0.04);
    const pension = r(gross * 0.04);
    return { health, pension, unemployment: 0, care: 0, total: r(health + pension) };
  },

  getDeductions(gross: number, _opts: TaxOptions): number {
    return coDeductions(gross);
  },

  getAvailableRegimes(): SpecialRegimeInfo[] {
    return [];
  },

  applySpecialRegime(gross: number, _regimeId: string, _opts: TaxOptions): number {
    return calcIncomeTax(Math.max(0, gross - coDeductions(gross)));
  },

  getDisclaimer(locale: string): string {
    if (locale === 'en') {
      return 'Colombia 2025. UVT = COP 49,799. Brackets on taxable income after 8% social deduction + 25% renta exenta (capped 790 UVT). Social: salud 4% + pensión 4%. Not tax advice.';
    }
    return 'Kolumbien 2025. UVT = COP 49.799. Brackets auf zu versteuerndes Einkommen nach 8 % Sozialabgaben + 25 % renta exenta (max. 790 UVT). Sozialabgaben: salud 4 % + pensión 4 %. Keine Steuerberatung.';
  },
};

export default co;
