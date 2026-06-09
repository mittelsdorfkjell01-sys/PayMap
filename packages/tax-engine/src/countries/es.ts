import { CountryModule, TaxOptions, SocialContributions, SpecialRegimeInfo, TaxData } from '../types';
import { getDefaultTaxData } from '../data/countries';
import { bracketsFor, regionalBracketsFor, progressiveTax, socialAmount, deductionAmount } from '../data/helpers';

const r = (x: number) => Math.round(x * 100) / 100;

/**
 * Reducción por obtención de rendimientos del trabajo (Art. 20 LIRPF): full
 * amount for low net work income, tapered to 0 at the upper threshold. The
 * statutory kink in the middle is approximated linearly (only affects incomes
 * below the upper threshold). 0 for the typical comparison incomes.
 */
function reduccionTrabajo(netWorkIncome: number, data: TaxData): number {
  const max = deductionAmount(data, 'reduccion_trabajo_max');
  if (max === 0) return 0;
  const full = deductionAmount(data, 'reduccion_trabajo_full_below');
  const zero = deductionAmount(data, 'reduccion_trabajo_zero_above');
  if (netWorkIncome <= full) return max;
  if (netWorkIncome >= zero) return 0;
  return max * (1 - (netWorkIncome - full) / (zero - full));
}

// IRPF = state scale (regionId null) + the comunidad's regional scale, both
// progressive on the same base liquidable, then summed (A.1). The mínimo
// personal y familiar is applied as a tax credit on EACH scale (Art. 63-64
// LIRPF): cuota = escala(base) − escala(mínimo); never below 0.
function esIncomeTax(taxable: number, opts: TaxOptions, data: TaxData): number {
  const minimo = deductionAmount(data, 'minimo_personal');
  const stateBr = bracketsFor(data, 'employed');
  const state = Math.max(0, progressiveTax(taxable, stateBr) - progressiveTax(minimo, stateBr));
  let regional = 0;
  if (opts.region) {
    const regBr = regionalBracketsFor(data, 'employed', opts.region);
    regional = Math.max(0, progressiveTax(taxable, regBr) - progressiveTax(minimo, regBr));
  }
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

  getDeductions(gross: number, opts: TaxOptions, taxData?: TaxData): number {
    const data = taxData ?? getDefaultTaxData('es', opts.year);
    // Base liquidable reductions: deductible social security + "otros gastos"
    // (Art. 19) + reducción por rendimientos del trabajo (Art. 20). The mínimo
    // personal is NOT deducted here — it is a credit applied in esIncomeTax.
    const ss = socialAmount(data, 'pension', gross);
    const otrosGastos = Math.min(gross, deductionAmount(data, 'otros_gastos'));
    const reduccion = reduccionTrabajo(Math.max(0, gross - ss - otrosGastos), data);
    return r(ss + otrosGastos + reduccion);
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
      return 'Spain 2026. Approximate calculation: state scale plus the region-specific comunidad scale (Madrid / Catalonia / Valencia), with the personal allowance (mínimo personal), deductible social security and the €2,000 work expense applied. Not tax advice.';
    }
    return 'Spanien 2026. Näherungsrechnung: Staatsskala plus regionsspezifische Comunidad-Skala (Madrid / Katalonien / Valencia), inkl. persönlichem Freibetrag (mínimo personal), abzugsfähiger Sozialversicherung und 2.000-€-Werbungskostenpauschale. Keine Steuerberatung.';
  },
};

export default es;
