import { CountryModule, TaxOptions, SocialContributions, SpecialRegimeInfo, TaxData } from '../types';
import { getDefaultTaxData } from '../data/countries';
import { bracketsFor, regionalBracketsFor, progressiveTax, socialAmount } from '../data/helpers';

const r = (x: number) => Math.round(x * 100) / 100;

// IRPF = state scale (regionId null) + the comunidad's regional scale, both
// progressive on the same base, then summed (A.1). When no regional rows are
// present for the city's region, only the state scale applies.
function esIncomeTax(taxable: number, opts: TaxOptions, data: TaxData): number {
  const state = progressiveTax(taxable, bracketsFor(data, 'employed'));
  const regional = opts.region
    ? progressiveTax(taxable, regionalBracketsFor(data, 'employed', opts.region))
    : 0;
  return state + regional;
}

export const es: CountryModule = {
  countryCode: 'es',

  calculateIncomeTax(taxable: number, opts: TaxOptions, taxData?: TaxData): number {
    const data = taxData ?? getDefaultTaxData('es', opts.year);
    return r(esIncomeTax(taxable, opts, data));
  },

  getSocialContributions(gross: number, opts: TaxOptions, taxData?: TaxData): SocialContributions {
    const data = taxData ?? getDefaultTaxData('es', opts.year);
    const pension = r(socialAmount(data, 'pension', gross));
    return { health: 0, pension, unemployment: 0, care: 0, total: pension };
  },

  getDeductions(_gross: number, _opts: TaxOptions): number {
    return 0;
  },

  getAvailableRegimes(): SpecialRegimeInfo[] {
    return [
      {
        id: 'beckham-es',
        nameDE: 'Beckham Law (Spanien)',
        nameEN: 'Beckham Law Special Tax Regime',
        flatRate: 0.24,
        durationYears: 6,
      },
    ];
  },

  applySpecialRegime(gross: number, regimeId: string, opts: TaxOptions, taxData?: TaxData): number {
    const data = taxData ?? getDefaultTaxData('es', opts.year);
    if (regimeId === 'beckham-es') {
      // Beckham regime is a flat state scale that overrides the region.
      return r(progressiveTax(gross, bracketsFor(data, 'beckham')));
    }
    return r(esIncomeTax(gross, opts, data));
  },

  getDisclaimer(locale: string): string {
    if (locale === 'en') {
      return 'Spain 2025. Approximate calculation including state and average regional tax. Individual regional deductions not included. Not tax advice.';
    }
    return 'Spanien 2025. Näherungsrechnung inkl. Staats- und durchschnittlicher Regionalsteuer. Individuelle Regionalabzüge nicht berücksichtigt. Keine Steuerberatung.';
  },
};

export default es;
