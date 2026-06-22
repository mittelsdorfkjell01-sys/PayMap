import { CountryModule, TaxOptions, SocialContributions, SpecialRegimeInfo, TaxData } from '../types';
import { getDefaultTaxData } from '../data/countries';
import { socialAmount, socialCeiling, deductionAmount, deductionPercentage } from '../data/helpers';

const r = (x: number) => Math.round(x * 100) / 100;

/**
 * Resolve the annual amount for an insurance branch, honouring an explicit
 * monthly (€) override from opts.insuranceOverrides when present. Variante B:
 * the same resolved value is used for both the net deduction and the
 * Vorsorgepauschale, so an override entered by the user lowers the taxable
 * income as well. `fallback` is the auto-computed annual amount.
 */
function resolveContribution(
  branch: 'health' | 'care' | 'pension' | 'unemployment',
  fallback: number,
  opts: TaxOptions,
): number {
  const monthly = opts.insuranceOverrides?.[branch];
  return monthly != null ? r(monthly * 12) : fallback;
}

/**
 * Vorsorgepauschale (§39b Abs. 2 Satz 5 Nr. 3 EStG, VZ 2026): the deductible
 * old-age + health + care provision contributions that lower the zvE. This is
 * the mechanism every official brutto-netto calculator uses; without it the
 * engine taxed an almost-undiminished gross.
 *
 *  • Altersvorsorge: 100% of the employee RV share (9.3%, since 2023).
 *  • KV (Basisabsicherung): reduced rate share 7.0% + ½ Zusatzbeitrag (1.45%) =
 *    8.45%, on income up to the KV ceiling. Krankengeld-Anteil (0.6%) excluded.
 *    Only for statutory insurance — for PKV the model carries no GKV premium, so
 *    granting a GKV-rate KV deduction would be a phantom; omitted there.
 *  • PV: full employee care share (childless 2.4% / with children 1.8%).
 *  • AV (new in 2026): only added when AV+KV+PV ≤ €1,900 (low incomes only).
 * All rates/ceilings come from taxData.
 */
function vorsorgepauschale(gross: number, opts: TaxOptions, data: TaxData): number {
  // Variante B: an explicit monthly override for a branch replaces the
  // formula-based amount here too, so a user-entered contribution lowers the
  // taxable income (zvE) as well as the net. Branches without an override keep
  // the §39b formula value.
  const rv = resolveContribution('pension', socialAmount(data, 'pension', gross), opts);
  const kvCeiling = socialCeiling(data, 'health');
  const kvBase = kvCeiling != null ? Math.min(gross, kvCeiling) : gross;
  // Only gate the KV deduction off when an explicit PKV premium is used (then
  // the basis deductibility is omitted as a documented approximation). PKV
  // without a stated premium is modelled like statutory, so it keeps the KV
  // deduction. An explicit health override (insuranceOverrides.health) takes
  // precedence and is treated as the deductible KV amount.
  const usePrivatePremium = opts.kvType === 'private' && opts.privateKvPremium != null;
  const kvAuto = usePrivatePremium ? 0 : kvBase * deductionPercentage(data, 'vorsorge_kv_rate');
  const kv = resolveContribution('health', kvAuto, opts);
  const pv = resolveContribution(
    'care',
    socialAmount(data, opts.children === 0 ? 'care_childless' : 'care', gross),
    opts,
  );
  const av = resolveContribution('unemployment', socialAmount(data, 'unemployment', gross), opts);
  const avPart = av + kv + pv <= 1900 ? av : 0;
  return r(rv + kv + pv + avPart);
}

/** zvE deductions for a given income: Werbungskostenpauschale + Vorsorgepauschale. */
function deductionsFor(income: number, opts: TaxOptions, data: TaxData): number {
  const werbungskosten = Math.min(income, deductionAmount(data, 'werbungskosten'));
  return r(werbungskosten + vorsorgepauschale(income, opts, data));
}

/**
 * §32a EStG Progressionsformel 2026 (BMF Lohnsteuer-Handbuch 2026)
 * Grundfreibetrag: 12.348 €
 */
function calcGrundsteuer(taxable: number): number {
  const x = taxable;
  if (x <= 12348) return 0;
  if (x <= 17799) {
    const y = (x - 12348) / 10000;
    return r((914.51 * y + 1400) * y);
  }
  if (x <= 69878) {
    const z = (x - 17799) / 10000;
    return r((173.1 * z + 2397) * z + 1034.87);
  }
  if (x <= 277825) {
    return r(0.42 * x - 11135.63);
  }
  return r(0.45 * x - 19470.38);
}

function getMarginalRate(taxable: number): number {
  if (taxable <= 12348) return 0;
  if (taxable <= 17799) {
    const y = (taxable - 12348) / 10000;
    // derivative: (2 * 914.51 * y + 1400) / 10000
    return (2 * 914.51 * y + 1400) / 10000;
  }
  if (taxable <= 69878) {
    const z = (taxable - 17799) / 10000;
    return (2 * 173.1 * z + 2397) / 10000;
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
    // behaviour. Partner gets the same deductions (Werbungskosten + Vorsorge).
    const partnerTaxable =
      opts.familyStatus === 'married' && opts.partnerGross && opts.partnerGross > 0
        ? Math.max(0, opts.partnerGross - deductionsFor(opts.partnerGross, opts, data))
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

    // Each branch honours an explicit monthly override (insuranceOverrides)
    // when set, otherwise uses the auto-computed rate × capped-gross amount.
    const pension = resolveContribution('pension', r(socialAmount(data, 'pension', gross)), opts);
    const unemployment = resolveContribution(
      'unemployment',
      r(socialAmount(data, 'unemployment', gross)),
      opts,
    );

    // Health auto value: PKV uses the user's stated monthly premium (×12); if
    // unknown, approximate with the statutory-equivalent cost rather than 0 (a
    // private premium is a real outflow). An explicit insuranceOverrides.health
    // takes precedence over both (resolveContribution).
    const autoHealth = !isPrivate
      ? r(socialAmount(data, 'health', gross))
      : opts.privateKvPremium != null
        ? r(opts.privateKvPremium * 12)
        : r(socialAmount(data, 'health', gross));
    const health = resolveContribution('health', autoHealth, opts);

    const isChildless = opts.children === 0;
    const care = resolveContribution(
      'care',
      r(socialAmount(data, isChildless ? 'care_childless' : 'care', gross)),
      opts,
    );

    const total = r(pension + unemployment + health + care);

    return { health, pension, unemployment, care, total };
  },

  getDeductions(gross: number, opts: TaxOptions, taxData?: TaxData): number {
    const data = taxData ?? getDefaultTaxData('de', opts.year);
    // Werbungskostenpauschale + Vorsorgepauschale (Altersvorsorge, KV/PV, ggf. AV).
    return deductionsFor(gross, opts, data);
  },

  getAvailableRegimes(): SpecialRegimeInfo[] {
    return [];
  },

  applySpecialRegime(_gross: number, _regimeId: string, _opts: TaxOptions): number {
    return 0;
  },

  getDisclaimer(locale: string): string {
    if (locale === 'en') {
      return 'Germany 2026 (§32a EStG). Includes the standard Vorsorgepauschale (deductible pension, health and care contributions). Solidarity surcharge and church tax modelled; individual deductions beyond the standard ones not considered. Consult a tax advisor for binding statements.';
    }
    return 'Deutschland 2026. Näherungsrechnung nach §32a EStG inkl. Vorsorgepauschale (abzugsfähige Renten-, Kranken- und Pflegebeiträge). Solidaritätszuschlag und Kirchensteuer werden berücksichtigt; weitere individuelle Freibeträge nicht. Keine steuerliche Beratung. Für verbindliche Auskünfte bitte Steuerberater konsultieren.';
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
