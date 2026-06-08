import { CountryModule, TaxOptions, SocialContributions, SpecialRegimeInfo, TaxData } from '../types';
import { getDefaultTaxData } from '../data/countries';
import { bracketsFor, progressiveTax, socialAmount } from '../data/helpers';

const r = (x: number) => Math.round(x * 100) / 100;

export const it: CountryModule = {
  countryCode: 'it',

  calculateIncomeTax(taxable: number, opts: TaxOptions, taxData?: TaxData): number {
    const data = taxData ?? getDefaultTaxData('it', opts.year);
    return r(progressiveTax(taxable, bracketsFor(data, 'employed')));
  },

  getSocialContributions(gross: number, opts: TaxOptions, taxData?: TaxData): SocialContributions {
    const data = taxData ?? getDefaultTaxData('it', opts.year);
    const pension = r(socialAmount(data, 'pension', gross));
    return { health: 0, pension, unemployment: 0, care: 0, total: pension };
  },

  getDeductions(_gross: number, _opts: TaxOptions): number {
    return 0;
  },

  getAvailableRegimes(): SpecialRegimeInfo[] {
    return [
      {
        id: 'impatriate-it',
        nameDE: 'Impatriate Regime (Italien)',
        nameEN: 'Impatriate Tax Regime (Italy)',
        flatRate: 0.5,
        durationYears: 5,
      },
    ];
  },

  applySpecialRegime(gross: number, regimeId: string, opts: TaxOptions, taxData?: TaxData): number {
    const data = taxData ?? getDefaultTaxData('it', opts.year);
    const brackets = bracketsFor(data, 'employed');
    if (regimeId === 'impatriate-it') {
      // 50% des Einkommens steuerfrei → IRPEF nur auf 50%
      return r(progressiveTax(gross * 0.5, brackets));
    }
    return r(progressiveTax(gross, brackets));
  },

  getDisclaimer(locale: string): string {
    if (locale === 'en') {
      return 'Italy 2025. IRPEF calculation (approximate). Regional and municipal surtaxes (addizionale) not included. Not tax advice.';
    }
    return 'Italien 2025. IRPEF-Berechnung (Näherung). Regionale und kommunale Zuschläge (Addizionale) nicht berücksichtigt. Keine Steuerberatung.';
  },
};

export default it;
