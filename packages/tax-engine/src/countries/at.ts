import { CountryModule, TaxOptions, SocialContributions, SpecialRegimeInfo, TaxData } from '../types';
import { getDefaultTaxData } from '../data/countries';
import {
  bracketsFor,
  progressiveTax,
  socialRate,
  deductionAmount,
  deductionPercentage,
  surchargesFor,
} from '../data/helpers';

const r = (x: number) => Math.round(x * 100) / 100;

// Austrian wages are paid in 14 instalments: 12 laufende Bezüge + 2
// Sonderzahlungen (13th/14th salary). The annual gross is split accordingly;
// the special payments are taxed under the Jahressechstel scheme at much lower
// rates, and carry slightly lower social contributions (A.8).
const INSTALMENTS = 14;
const LAUFENDE = 12;
const SONDER = 2;

function splitGross(gross: number) {
  const monthly = gross / INSTALMENTS;
  return { laufende: monthly * LAUFENDE, sonder: monthly * SONDER };
}

// Tax on the Sonderzahlungen via the Jahressechstel scale. Below the Freigrenze
// the special payments are untaxed.
function sonderzahlungTax(sonder: number, data: TaxData): number {
  const freigrenze = deductionAmount(data, 'sonderzahlung_freigrenze');
  if (sonder <= freigrenze) return 0;
  const scale = surchargesFor(data, 'sonderzahlung')[0];
  if (!scale?.brackets) return 0;
  let tax = 0;
  for (const b of scale.brackets) {
    const to = b.to ?? Infinity;
    if (sonder <= b.from) break;
    tax += (Math.min(sonder, to) - b.from) * b.rate;
  }
  return tax;
}

export const at: CountryModule = {
  countryCode: 'at',

  calculateIncomeTax(taxable: number, opts: TaxOptions, taxData?: TaxData): number {
    const data = taxData ?? getDefaultTaxData('at', opts.year);
    // AT has no standard deduction, so `taxable` === gross here.
    const { laufende, sonder } = splitGross(taxable);
    const taxLaufende = progressiveTax(laufende, bracketsFor(data, 'employed'));
    const taxSonder = sonderzahlungTax(sonder, data);
    return r(taxLaufende + taxSonder);
  },

  getSocialContributions(gross: number, opts: TaxOptions, taxData?: TaxData): SocialContributions {
    const data = taxData ?? getDefaultTaxData('at', opts.year);
    const { laufende, sonder } = splitGross(gross);

    const rates = {
      pension: socialRate(data, 'pension'),
      health: socialRate(data, 'health'),
      unemployment: socialRate(data, 'unemployment'),
      care: socialRate(data, 'care'),
    };
    const fullRate = rates.pension + rates.health + rates.unemployment + rates.care;
    const reduction = deductionPercentage(data, 'sonderzahlung_sv_reduction'); // ~1%
    // Apply the ~1% reduction to the Sonderzahlung portion, distributed across
    // the contribution types so the per-type breakdown still sums to the total.
    const sonderFactor = fullRate > 0 ? 1 - reduction / fullRate : 1;
    const contrib = (rate: number) => r(rate * laufende + rate * sonder * sonderFactor);

    const pension = contrib(rates.pension);
    const health = contrib(rates.health);
    const unemployment = contrib(rates.unemployment);
    const care = contrib(rates.care);
    const total = r(pension + health + unemployment + care);
    return { health, pension, unemployment, care, total };
  },

  getDeductions(_gross: number, _opts: TaxOptions): number {
    return 0;
  },

  getAvailableRegimes(): SpecialRegimeInfo[] {
    return [];
  },

  applySpecialRegime(_gross: number, _regimeId: string, _opts: TaxOptions): number {
    return 0;
  },

  getDisclaimer(locale: string): string {
    if (locale === 'en') {
      return 'Austria 2025. Includes the 13th/14th salary (Jahressechstel): special payments taxed at the reduced 6%/27% rates. Church tax and individual deductions not considered. Not tax advice.';
    }
    return 'Österreich 2025. Berücksichtigt 13./14. Gehalt (Jahressechstel): Sonderzahlungen mit den begünstigten Sätzen 6%/27% besteuert. Kirchenbeitrag und individuelle Freibeträge nicht berücksichtigt. Keine Steuerberatung.';
  },
};

export default at;
