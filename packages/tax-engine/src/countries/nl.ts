import { CountryModule, TaxOptions, SocialContributions, SpecialRegimeInfo, TaxData } from '../types';
import { getDefaultTaxData } from '../data/countries';
import { bracketsFor, progressiveTax, deductionAmount, deductionPercentage } from '../data/helpers';

const r = (x: number) => Math.round(x * 100) / 100;

/**
 * Algemene heffingskorting (general tax credit): flat `ahk_max` up to the
 * phase-out start, then reduced by `ahk_phaseout_rate` of income above it,
 * floored at 0. Values from taxData (belastingdienst.nl 2025).
 */
function algemeneHeffingskorting(income: number, data: TaxData): number {
  const max = deductionAmount(data, 'ahk_max');
  if (max === 0) return 0;
  const start = deductionAmount(data, 'ahk_phaseout_start');
  const rate = deductionPercentage(data, 'ahk_phaseout_rate');
  return Math.max(0, max - rate * Math.max(0, income - start));
}

/**
 * Arbeidskorting (employee labour tax credit): the cumulative value of the
 * piecewise-linear 'arbeidskorting' scale (build-up segments + a negative
 * phase-out segment), floored at 0. Values from taxData.
 */
function arbeidskorting(income: number, data: TaxData): number {
  const brackets = bracketsFor(data, 'arbeidskorting');
  if (brackets.length === 0) return 0;
  return Math.max(0, progressiveTax(income, brackets));
}

/**
 * Netherlands 2025. Box-1 social insurance (volksverzekeringen) is baked into
 * the bracket-1 rate (35.82%), so it is not modelled separately. The general
 * tax credit (algemene heffingskorting) and the labour tax credit
 * (arbeidskorting), each with their income-dependent phase-outs, are deducted
 * from the box-1 levy.
 */
export const nl: CountryModule = {
  countryCode: 'nl',

  calculateIncomeTax(taxable: number, opts: TaxOptions, taxData?: TaxData): number {
    const data = taxData ?? getDefaultTaxData('nl', opts.year);
    const levy = progressiveTax(taxable, bracketsFor(data, 'employed'));
    // Heffingskortingen reduce the combined box-1 levy (IB + premies);
    // non-refundable, so the result is floored at 0.
    const credits = algemeneHeffingskorting(taxable, data) + arbeidskorting(taxable, data);
    return r(Math.max(0, levy - credits));
  },

  getSocialContributions(_gross: number, _opts: TaxOptions): SocialContributions {
    return { health: 0, pension: 0, unemployment: 0, care: 0, total: 0 };
  },

  getDeductions(_gross: number, _opts: TaxOptions): number {
    return 0;
  },

  getAvailableRegimes(): SpecialRegimeInfo[] {
    return [
      {
        id: 'ruling30-nl',
        nameDE: 'Expat-Ruling (Niederlande) — 30 % (2026), 27 % ab 2027',
        nameEN: 'Expat Ruling (Netherlands) — 30% (2026), 27% from 2027',
        flatRate: 0.3,
        durationYears: 5,
      },
    ];
  },

  applySpecialRegime(gross: number, regimeId: string, opts: TaxOptions, taxData?: TaxData): number {
    const data = taxData ?? getDefaultTaxData('nl', opts.year);
    if (regimeId === 'ruling30-nl') {
      // Expat-Ruling 2026: flat 30 % steuerfreier Gehaltsanteil. Die im Tax Plan
      // 2024 geplante 30-20-10-Staffel wurde zurückgenommen; ab 2027 gilt
      // einheitlich 27 %. Der begünstigte Anteil ist auf 262.000 € (2026,
      // Balkenende-/WNT-Norm) gedeckelt — darüber kein steuerfreier Anteil.
      const exemptRate = opts.year >= 2027 ? 0.27 : 0.3;
      const exempt = Math.min(gross, 262_000) * exemptRate;
      return r(nl.calculateIncomeTax(Math.max(0, gross - exempt), opts, data));
    }
    return r(nl.calculateIncomeTax(gross, opts, data));
  },

  getDisclaimer(locale: string): string {
    if (locale === 'en') {
      return 'Netherlands 2025. Social insurance contributions are included in bracket 1 (35.82%). General and labour tax credits (heffingskortingen) are applied; the healthcare allowance (zorgtoeslag) is not included. Not tax advice.';
    }
    return 'Niederlande 2025. Sozialversicherungsbeiträge sind in der ersten Steuerklasse (35,82%) enthalten. Allgemeine und Arbeitssteuergutschrift (Heffingskortingen) werden berücksichtigt; Gesundheitszuschuss (Zorgtoeslag) nicht. Keine Steuerberatung.';
  },
};

export default nl;
