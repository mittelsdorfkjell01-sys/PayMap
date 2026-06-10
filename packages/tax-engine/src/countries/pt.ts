import { CountryModule, TaxOptions, SocialContributions, SpecialRegimeInfo, TaxData } from '../types';
import { getDefaultTaxData } from '../data/countries';
import { bracketsFor, progressiveTax, socialAmount, deductionAmount } from '../data/helpers';

const r = (x: number) => Math.round(x * 100) / 100;

export const pt: CountryModule = {
  countryCode: 'pt',

  calculateIncomeTax(taxable: number, opts: TaxOptions, taxData?: TaxData): number {
    const data = taxData ?? getDefaultTaxData('pt', opts.year);
    return r(progressiveTax(taxable, bracketsFor(data, 'employed')));
  },

  getSocialContributions(gross: number, opts: TaxOptions, taxData?: TaxData): SocialContributions {
    const data = taxData ?? getDefaultTaxData('pt', opts.year);
    const pension = r(socialAmount(data, 'social_security', gross));
    return { health: 0, pension, unemployment: 0, care: 0, total: pension };
  },

  getDeductions(gross: number, opts: TaxOptions, taxData?: TaxData): number {
    const data = taxData ?? getDefaultTaxData('pt', opts.year);
    // Dedução específica Categoria A (Art. 25 CIRS): the fixed amount, or the
    // mandatory social-security contributions when those are higher. Reduces the
    // taxable base (the SS is also a cash outflow — both apply, no double count).
    const fixed = deductionAmount(data, 'deducao_especifica_min');
    const ss = socialAmount(data, 'social_security', gross);
    return r(Math.min(gross, Math.max(fixed, ss)));
  },

  getAvailableRegimes(): SpecialRegimeInfo[] {
    return [
      {
        id: 'ifici-pt',
        nameDE: 'IFICI+ Regime (Portugal)',
        nameEN: 'IFICI+ Special Tax Regime',
        flatRate: 0.2,
        durationYears: 10,
      },
    ];
  },

  applySpecialRegime(gross: number, regimeId: string, opts: TaxOptions, taxData?: TaxData): number {
    const data = taxData ?? getDefaultTaxData('pt', opts.year);
    if (regimeId === 'ifici-pt') {
      // 20% flat auf qualifiziertes Einkommen
      return r(gross * 0.2);
    }
    return r(progressiveTax(gross, bracketsFor(data, 'employed')));
  },

  getDisclaimer(locale: string): string {
    if (locale === 'en') {
      return 'Portugal 2025. Approximate calculation on the national brackets with the Categoria A specific deduction (dedução específica) applied. Solidarity surtax and individual tax credits (deduções à coleta) not included. Not tax advice.';
    }
    return 'Portugal 2025. Näherungsrechnung auf Basis der nationalen Steuersätze inkl. spezifischem Abzug für Arbeitseinkommen (dedução específica). Solidaritätszuschlag und individuelle Steuergutschriften (deduções à coleta) nicht berücksichtigt. Keine Steuerberatung.';
  },
};

export default pt;
