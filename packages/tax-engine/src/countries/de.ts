import { CountryModule, TaxOptions, SocialContributions, SpecialRegimeInfo } from '../types';

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

  calculateIncomeTax(taxable: number, opts: TaxOptions): number {
    let tax: number;

    if (opts.familyStatus === 'married') {
      // Splittingtabelle: 2 × Steuer(gross/2)
      const half = taxable / 2;
      tax = 2 * calcGrundsteuer(half);
    } else {
      tax = calcGrundsteuer(taxable);
    }

    // Kinderfreibetrag Günstigerprüfung
    if (opts.children > 0) {
      const kinderfreibetrag = 6612 * opts.children;
      const kindergeld = 250 * 12 * opts.children;
      const taxWithKFB = opts.familyStatus === 'married'
        ? 2 * calcGrundsteuer((taxable - kinderfreibetrag) / 2)
        : calcGrundsteuer(taxable - kinderfreibetrag);
      const taxSaving = tax - taxWithKFB;
      if (taxSaving > kindergeld) {
        // Kinderfreibetrag günstiger → KFB anwenden, Kindergeld entfällt
        tax = taxWithKFB;
      }
      // sonst Kindergeld bleibt (kein KFB im steuerlichen Sinne)
    }

    return r(Math.max(0, tax));
  },

  getSocialContributions(gross: number, opts: TaxOptions): SocialContributions {
    const isPrivate = opts.kvType === 'private';

    // BBG 2025
    const bbgRvAv = 96600;
    const bbgKvPv = 66150;

    const pensionBase = Math.min(gross, bbgRvAv);
    const kvBase = Math.min(gross, bbgKvPv);

    const pension = r(pensionBase * 0.093);
    const unemployment = r(pensionBase * 0.013);

    let health = 0;
    if (!isPrivate) {
      health = r(kvBase * 0.09); // 7.3% + 1.7% Zusatzbeitrag
    }

    const isChildless = opts.children === 0;
    const pvRate = isChildless ? 0.023 : 0.018;
    const care = r(kvBase * pvRate);

    const total = r(pension + unemployment + health + care);

    return { health, pension, unemployment, care, total };
  },

  getDeductions(gross: number, _opts: TaxOptions): number {
    // Werbungskosten-Pauschale
    const werbungskosten = Math.min(gross, 1230);
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
// § 3 Abs. 3 Satz 1 SolzG — Freigrenze VZ 2025 (BMF-Schreiben 2024-11)
export function calculateSoli(incomeTax: number, opts: TaxOptions): number {
  const freigrenze = opts.familyStatus === 'married' ? 39900 : 19950;

  if (incomeTax <= freigrenze) return 0;

  const vollSoli = r(incomeTax * 0.055);
  // Milderungszone: 11.9% des Überschreitungsbetrags
  const milderung = r((incomeTax - freigrenze) * 0.119);

  return r(Math.min(vollSoli, milderung));
}

export default de;
