import { CountryModule, TaxOptions, SocialContributions, SpecialRegimeInfo } from '../types';

const r = (x: number) => Math.round(x * 100) / 100;

/**
 * Grundfreibetrag 2025: 654 €/Mo = 7.848 €/Jahr.
 * Läuft ab 25.200 € aus (linearer Auslauf).
 */
function getBasicAllowance(gross: number): number {
  const maxAllowance = 7848;
  const phaseOutStart = 14400;
  const phaseOutEnd = 25200;

  if (gross <= phaseOutStart) return maxAllowance;
  if (gross >= phaseOutEnd) return 0;

  // Linearer Auslauf zwischen 14.400 und 25.200
  const ratio = (gross - phaseOutStart) / (phaseOutEnd - phaseOutStart);
  return r(maxAllowance * (1 - ratio));
}

export const ee: CountryModule = {
  countryCode: 'ee',

  calculateIncomeTax(taxable: number, _opts: TaxOptions): number {
    // 20% Flat auf zu versteuerndes Einkommen nach Grundfreibetrag
    return r(Math.max(0, taxable) * 0.20);
  },

  getSocialContributions(_gross: number, _opts: TaxOptions): SocialContributions {
    // Sozialsteuer (33%) wird vom Arbeitgeber gezahlt.
    // AN-Anteil: 0% für Angestellte in Precise Mode.
    return { health: 0, pension: 0, unemployment: 0, care: 0, total: 0 };
  },

  getDeductions(gross: number, _opts: TaxOptions): number {
    return getBasicAllowance(gross);
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

  applySpecialRegime(_gross: number, regimeId: string, _opts: TaxOptions): number {
    if (regimeId === 'ou-ee') {
      // Einbehaltene Gewinne: 0% Steuer
      // Ausschüttungen: 20%
      // Gibt 0 zurück (Gewinne einbehalten, keine Steuer)
      return 0;
    }
    return r(Math.max(0, _gross) * 0.20);
  },

  getDisclaimer(locale: string): string {
    if (locale === 'en') {
      return 'Estonia 2025. Employer social tax (33%) not included. The OÜ regime assumes retained profits — distributions are taxed at 20%. Not tax advice.';
    }
    return 'Estland 2025. Arbeitgeber-Sozialsteuer (33%) nicht eingerechnet. Das OÜ-Regime geht von einbehaltenen Gewinnen aus — Ausschüttungen werden mit 20% besteuert. Keine Steuerberatung.';
  },
};

export default ee;
