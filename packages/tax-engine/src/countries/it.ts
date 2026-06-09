import { CountryModule, TaxOptions, SocialContributions, SpecialRegimeInfo, TaxData } from '../types';
import { getDefaultTaxData } from '../data/countries';
import {
  bracketsFor,
  progressiveTax,
  socialAmount,
  deductionAmount,
  surchargesFor,
  applySurcharge,
} from '../data/helpers';

const r = (x: number) => Math.round(x * 100) / 100;

/**
 * Detrazioni per redditi di lavoro dipendente (Art. 13 TUIR): a tax credit that
 * declines with income and reaches 0 at €50.000. Reduces IRPEF only (never the
 * addizionale), floored at 0. Values from taxData.
 */
function detrazioneLavoro(reddito: number, data: TaxData): number {
  const low = deductionAmount(data, 'detrazione_low');
  const t1 = deductionAmount(data, 'detrazione_low_threshold'); // 15.000
  const base = deductionAmount(data, 'detrazione_base'); // 1.910
  const midAdd = deductionAmount(data, 'detrazione_mid_add'); // 1.190
  const t2 = deductionAmount(data, 'detrazione_mid_threshold'); // 28.000
  const t3 = deductionAmount(data, 'detrazione_zero_threshold'); // 50.000
  if (base === 0) return 0;
  if (reddito <= t1) return low;
  if (reddito <= t2) return base + midAdd * ((t2 - reddito) / (t2 - t1));
  if (reddito <= t3) return base * ((t3 - reddito) / (t3 - t2));
  return 0;
}

// IRPEF (less the lavoro-dipendente detrazione) + addizionale regionale
// (progressive, by region) + addizionale comunale (by city). The detrazione
// reduces only the IRPEF; the addizionali are computed on taxable income (A.4).
function itIncomeTax(taxable: number, opts: TaxOptions, data: TaxData): number {
  const irpef = progressiveTax(taxable, bracketsFor(data, 'employed'));
  let tax = Math.max(0, irpef - detrazioneLavoro(taxable, data));
  if (opts.region) {
    for (const s of surchargesFor(data, 'addizionale_regionale', { regionId: opts.region })) {
      tax += applySurcharge(s, taxable);
    }
  }
  if (opts.cityScope) {
    for (const s of surchargesFor(data, 'addizionale_comunale', { cityScope: opts.cityScope })) {
      tax += applySurcharge(s, taxable);
    }
  }
  return tax;
}

export const it: CountryModule = {
  countryCode: 'it',

  calculateIncomeTax(taxable: number, opts: TaxOptions, taxData?: TaxData): number {
    const data = taxData ?? getDefaultTaxData('it', opts.year);
    return r(itIncomeTax(taxable, opts, data));
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
    if (regimeId === 'impatriate-it') {
      // 50% des Einkommens steuerfrei → IRPEF nur auf 50% (addizionale on the
      // reduced base omitted for the regime case).
      return r(progressiveTax(gross * 0.5, bracketsFor(data, 'employed')));
    }
    return r(itIncomeTax(gross, opts, data));
  },

  getDisclaimer(locale: string): string {
    if (locale === 'en') {
      return 'Italy 2026. IRPEF (approximate) with the employment tax credit (detrazione lavoro dipendente). Regional and municipal surtaxes (addizionale) applied when a region/city is set. Not tax advice.';
    }
    return 'Italien 2026. IRPEF-Berechnung (Näherung) inkl. Arbeitnehmer-Steuergutschrift (Detrazione lavoro dipendente). Regionale und kommunale Zuschläge (Addizionale) werden bei gesetzter Region/Stadt berücksichtigt. Keine Steuerberatung.';
  },
};

export default it;
