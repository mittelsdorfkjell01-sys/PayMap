/**
 * Georgia (Georgien) — Income Tax + Pension 2025
 * ⚠ HIGH RISK for German tax residents: no DBA Germany-Georgia.
 * See disclaimer + getAvailableRegimes for details.
 */

import { CountryModule, TaxOptions, SocialContributions, SpecialRegimeInfo, TaxData } from '../types';
import { getDefaultTaxData } from '../data/countries';
import { bracketsFor, progressiveTax, socialAmount } from '../data/helpers';

const r = (x: number) => Math.round(x * 100) / 100;

export const ge: CountryModule = {
  countryCode: 'ge',

  calculateIncomeTax(taxable: number, opts: TaxOptions, taxData?: TaxData): number {
    const data = taxData ?? getDefaultTaxData('ge', opts.year);
    return r(progressiveTax(taxable, bracketsFor(data, 'employed')));
  },

  getSocialContributions(gross: number, opts: TaxOptions, taxData?: TaxData): SocialContributions {
    const data = taxData ?? getDefaultTaxData('ge', opts.year);
    // Mandatory pension applies to employed persons; Small Business holders exempt.
    const isEmployee = opts.employment === 'employed' || opts.employment === 'passive';
    const pension = isEmployee ? r(socialAmount(data, 'pension', gross)) : 0;
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
        durationYears: 99,
      },
    ];
  },

  applySpecialRegime(gross: number, regimeId: string, opts: TaxOptions, taxData?: TaxData): number {
    const data = taxData ?? getDefaultTaxData('ge', opts.year);
    if (regimeId === 'small-business-ge') {
      // ⚠ 1% turnover tax on annual revenue ≤ 500,000 GEL. No DBA Germany-Georgia.
      return r(gross * 0.01);
    }
    return r(progressiveTax(gross, bracketsFor(data, 'employed')));
  },

  getDisclaimer(locale: string): string {
    if (locale === 'en') {
      return 'Georgia 2025. Flat income tax 20%. Mandatory pension 2% (employed only). Small Business Status (1% turnover, ≤500,000 GEL) requires Individual Entrepreneur registration. ⚠ No Double Taxation Agreement (DBA) between Germany and Georgia — verify German tax liability before relocation. Not tax advice.';
    }
    return 'Georgien 2025. Pauschalsteuer 20% Einkommensteuer. Pflichtpension 2% (nur Angestellte). Kleinstunternehmer-Status (1% Umsatz, ≤500.000 GEL) erfordert Registrierung als Einzelunternehmer. ⚠ Kein DBA Deutschland-Georgien — deutsche Steuerpflicht bei Wegzug rechtlich prüfen. Keine Steuerberatung.';
  },
};

export default ge;
