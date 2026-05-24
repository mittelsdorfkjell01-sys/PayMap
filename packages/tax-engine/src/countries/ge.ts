/**
 * Georgia (Georgien) — Income Tax + Pension 2025
 * Source: https://www.rs.ge/en/taxes
 *         Tax Code of Georgia, Articles 80-87 (Income Tax)
 *         Law on Accumulative Pension, 2018 (mandatory since 2019)
 *
 * Special Regime: Small Business Status
 * Source: Tax Code of Georgia, Article 88-93
 *         https://www.rs.ge/en/individual-entrepreneur
 *
 * ⚠️  DISCLAIMER — HIGH RISK for German tax residents:
 *   - No Double Taxation Agreement (DBA) between Germany and Georgia.
 *   - German §§ 2, 49 EStG + AO anti-avoidance rules may apply even after relocation.
 *   - Small Business Status (1% turnover tax) requires genuine economic activity and
 *     physical presence in Georgia; German "Wegzugsteuer" (§ 6 AStG) may apply.
 *   - Always obtain legal counsel before restructuring around Georgian tax law.
 */

import { CountryModule, TaxOptions, SocialContributions, SpecialRegimeInfo } from '../types';

const r = (x: number) => Math.round(x * 100) / 100;

// ─── Income Tax ───────────────────────────────────────────────────────────────
// Flat 20% on all employment and self-employment income.
// Source: Tax Code of Georgia Art. 80, §2.
const GE_INCOME_TAX_RATE = 0.20;

// ─── Mandatory Pension Contribution (Employee Side) ──────────────────────────
// Introduced 2019; mandatory for employed persons born after 1967.
// Employee: 2% of gross salary (no cap).
// Source: Law of Georgia on Accumulative Pension (2018 amendment).
// Note: For self-employed / Individual Entrepreneurs, pension is voluntary since 2023
// (mandatory only for those with hired employees; Small Business holders typically exempt).
const GE_PENSION_RATE = 0.02;

// ─── Module ──────────────────────────────────────────────────────────────────
export const ge: CountryModule = {
  countryCode: 'ge',

  calculateIncomeTax(taxable: number, _opts: TaxOptions): number {
    return r(taxable * GE_INCOME_TAX_RATE);
  },

  getSocialContributions(gross: number, opts: TaxOptions): SocialContributions {
    // Pension applies to employed persons. Freelancers/founders on Small Business
    // Status are not subject to mandatory pension (Art. 7, Pension Law).
    const isEmployee = opts.employment === 'employed' || opts.employment === 'passive';
    const pension = isEmployee ? r(gross * GE_PENSION_RATE) : 0;
    return { health: 0, pension, unemployment: 0, care: 0, total: pension };
  },

  getDeductions(_gross: number, _opts: TaxOptions): number {
    return 0;
  },

  getAvailableRegimes(): SpecialRegimeInfo[] {
    return [
      {
        id: 'small-business-ge',
        nameDE: 'Kleinstunternehmer-Status (Georgien)',
        nameEN: 'Small Business Status (Georgia)',
        flatRate: 0.01,
        durationYears: 99,  // indefinite while conditions met
      },
    ];
  },

  applySpecialRegime(gross: number, regimeId: string, _opts: TaxOptions): number {
    if (regimeId === 'small-business-ge') {
      // ⚠️  Small Business Status: 1% turnover tax on annual revenue ≤ 500,000 GEL.
      // Requires registration as Individual Entrepreneur + Small Business certificate.
      // IMPORTANT RISK: No DBA Germany-Georgia. German §6 AStG (Wegzugsteuer) and
      // §§2, 49 EStG (extended limited liability) may override this advantage.
      // Source: Tax Code of Georgia Art. 88; rs.ge/en/individual-entrepreneur
      return r(gross * 0.01);
    }
    return r(gross * GE_INCOME_TAX_RATE);
  },

  getDisclaimer(locale: string): string {
    if (locale === 'en') {
      return 'Georgia 2025. Flat income tax 20%. Mandatory pension 2% (employed only). Small Business Status (1% turnover, ≤500,000 GEL) requires Individual Entrepreneur registration. ⚠ No Double Taxation Agreement (DBA) between Germany and Georgia — verify German tax liability before relocation. Not tax advice.';
    }
    return 'Georgien 2025. Pauschalsteuer 20% Einkommensteuer. Pflichtpension 2% (nur Angestellte). Kleinstunternehmer-Status (1% Umsatz, ≤500.000 GEL) erfordert Registrierung als Einzelunternehmer. ⚠ Kein DBA Deutschland-Georgien — deutsche Steuerpflicht bei Wegzug rechtlich prüfen. Keine Steuerberatung.';
  },
};

export default ge;
