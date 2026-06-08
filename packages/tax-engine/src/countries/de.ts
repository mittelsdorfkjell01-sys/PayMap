import { CountryModule, TaxOptions, SocialContributions, SpecialRegimeInfo, TaxData } from '../types';
import { getDefaultTaxData } from '../data/countries';
import { socialAmount, deductionAmount } from '../data/helpers';

const r = (x: number) => Math.round(x * 100) / 100;

/**
 * §32a EStG Progressionsformel 2025
 * Grundfreibetrag: 12.084 €
 */
function calcGrundsteuer(taxable: number): number {
  const x = taxable;
  if (x <= 12084) return 0;
  if (x <= 17005) {
    const y = (x - 12084) / 10000;
    return r((979.18 * y + 1400) * y);
  }
  if (x <= 66760) {
    const y = (x - 17005) / 10000;
    return r((192.59 * y + 2397) * y + 966.53);
  }
  if (x <= 277825) {
    return r(0.42 * x - 10602.13);
  }
  return r(0.45 * x - 18936.88);
}

function getMarginalRate(taxable: number): number {
  if (taxable <= 12084) return 0;
  if (taxable <= 17005) {
    const y = (taxable - 12084) / 10000;
    // derivative: (2 * 979.18 * y + 1400) / 10000
    return (2 * 979.18 * y + 1400) / 10000;
  }
  if (taxable <= 66760) {
    const y = (taxable - 17005) / 10000;
    return (2 * 192.59 * y + 2397) / 10000;
  }
  if (taxable <= 277825) return 0.42;
  return 0.45;
}

export const de: CountryModule = {
  countryCode: 'de',

  calculateIncomeTax(taxable: number, opts: TaxOptions, taxData?: TaxData): number {
    const data = taxData ?? getDefaultTaxData('de', opts.year);

    // Partner's taxable income for the Ehegatten-Splitting (A.5). Single-earner
    // (partnerGross 0/undefined) → partnerTaxable 0 → identical to the previous
    // behaviour. Partner gets the same Werbungskostenpauschale.
    const werbungskosten = deductionAmount(data, 'werbungskosten');
    const partnerTaxable =
      opts.familyStatus === 'married' && opts.partnerGross && opts.partnerGross > 0
        ? Math.max(0, opts.partnerGross - werbungskosten)
        : 0;

    // Household income tax under the chosen scheme.
    const householdTax = (ownTaxable: number): number => {
      if (opts.familyStatus === 'married') {
        // Splitting: 2 × §32a((own + partner) / 2)
        return 2 * calcGrundsteuer((ownTaxable + partnerTaxable) / 2);
      }
      return calcGrundsteuer(ownTaxable);
    };

    let tax = householdTax(taxable);

    // Kinderfreibetrag Günstigerprüfung (household level)
    if (opts.children > 0) {
      const kinderfreibetrag = deductionAmount(data, 'kinderfreibetrag') * opts.children;
      const kindergeld = deductionAmount(data, 'kindergeld_monthly') * 12 * opts.children;
      const taxWithKFB = householdTax(taxable - kinderfreibetrag);
      const taxSaving = tax - taxWithKFB;
      if (taxSaving > kindergeld) {
        // Kinderfreibetrag günstiger → KFB anwenden, Kindergeld entfällt
        tax = taxWithKFB;
      }
      // sonst Kindergeld bleibt (kein KFB im steuerlichen Sinne)
    }

    // Marginal attribution: the user's share = household tax − partner's tax
    // computed on the partner's income alone. With no partner this subtracts 0.
    const userTax = tax - calcGrundsteuer(partnerTaxable);

    return r(Math.max(0, userTax));
  },

  getSocialContributions(gross: number, opts: TaxOptions, taxData?: TaxData): SocialContributions {
    const data = taxData ?? getDefaultTaxData('de', opts.year);
    const isPrivate = opts.kvType === 'private';

    const pension = r(socialAmount(data, 'pension', gross));
    const unemployment = r(socialAmount(data, 'unemployment', gross));

    const health = isPrivate ? 0 : r(socialAmount(data, 'health', gross));

    const isChildless = opts.children === 0;
    const care = r(socialAmount(data, isChildless ? 'care_childless' : 'care', gross));

    const total = r(pension + unemployment + health + care);

    return { health, pension, unemployment, care, total };
  },

  getDeductions(gross: number, opts: TaxOptions, taxData?: TaxData): number {
    const data = taxData ?? getDefaultTaxData('de', opts.year);
    // Werbungskosten-Pauschale
    const werbungskosten = Math.min(gross, deductionAmount(data, 'werbungskosten'));
    return r(werbungskosten);
  },

  getAvailableRegimes(): SpecialRegimeInfo[] {
    return [];
  },

  applySpecialRegime(_gross: number, _regimeId: string, _opts: TaxOptions): number {
    return 0;
  },

  getDisclaimer(locale: string): string {
    if (locale === 'en') {
      return 'Germany 2025. Approximate calculation. Solidarity surcharge, church tax, and individual deductions not fully considered. Consult a tax advisor for binding statements.';
    }
    return 'Deutschland 2025. Näherungsrechnung nach §32a EStG. Kirchensteuer und individuelle Freibeträge nicht berücksichtigt. Keine steuerliche Beratung. Für verbindliche Auskünfte bitte Steuerberater konsultieren.';
  },
};

/**
 * Berechnet den Solidaritätszuschlag.
 * Exported for use in calculate.ts
 */
// § 3 Abs. 3 Satz 1 SolzG — Freigrenze VZ 2025 (BMF-Schreiben 2024-11).
// Freigrenze (allowance) and rate come from the Soli surcharge rows in taxData;
// the 11.9% Milderungszone factor is a formula constant kept here.
export function calculateSoli(incomeTax: number, opts: TaxOptions, taxData?: TaxData): number {
  const data = taxData ?? getDefaultTaxData('de', opts.year);
  const variant = opts.familyStatus === 'married' ? 'married' : 'single';
  const soliRow =
    data.surcharges.find((s) => s.type === 'soli' && s.variantKey === variant) ??
    data.surcharges.find((s) => s.type === 'soli');
  if (!soliRow) return 0;

  const freigrenze = soliRow.allowance ?? 0;
  const rate = soliRow.rate ?? 0.055;

  if (incomeTax <= freigrenze) return 0;

  const vollSoli = r(incomeTax * rate);
  // Milderungszone: 11.9% des Überschreitungsbetrags
  const milderung = r((incomeTax - freigrenze) * 0.119);

  return r(Math.min(vollSoli, milderung));
}

/**
 * Kirchensteuer (A.6): 8% of income tax in Bavaria (BY) and Baden-Württemberg
 * (BW), 9% in all other Bundesländer. Only for church members. The rate variant
 * comes from the `church` surcharge rows in taxData (variantKey "8"/"9").
 *
 * Deliberately NOT modelled: the Sonderausgaben deductibility of church tax
 * (see Anhang A — bewusste Restungenauigkeiten).
 */
export function calculateChurchTax(incomeTax: number, opts: TaxOptions, taxData?: TaxData): number {
  if (!opts.churchMember) return 0;
  const data = taxData ?? getDefaultTaxData('de', opts.year);
  const variant = opts.bundesland === 'BY' || opts.bundesland === 'BW' ? '8' : '9';
  const row =
    data.surcharges.find((s) => s.type === 'church' && s.variantKey === variant) ??
    data.surcharges.find((s) => s.type === 'church');
  if (!row || !row.rate) return 0;
  return r(Math.max(0, incomeTax) * row.rate);
}

export default de;
