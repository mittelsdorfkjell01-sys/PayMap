import { describe, it, expect } from 'vitest';
import { calculate } from '../calculate';
import { calculateSoli } from '../countries/de';
import type { TaxOptions } from '../types';

const YEAR = 2025;
const TOLERANCE = 0.02; // ±2%

function withinTolerance(actual: number, expected: number): boolean {
  if (expected === 0) return actual === 0;
  return Math.abs(actual - expected) / expected <= TOLERANCE;
}

function opts(overrides: Partial<TaxOptions> = {}): TaxOptions {
  return {
    gross: 80000,
    currency: 'EUR',
    employment: 'employed',
    familyStatus: 'single',
    children: 0,
    kvType: 'statutory',
    year: YEAR,
    ...overrides,
  };
}

// ─── DE Reference cases ───────────────────────────────────────────────────────
// Source for validation: nettolohn.de, smart-rechner.de (2025 assumptions:
// Steuerklasse I, Kirchensteuerfrei, GKV = 7.3%+1.7% Zusatzbeitrag, KV-Zusatz ~1.7%)
// Note: external calculators may use slightly different Zusatzbeitragssatz; we use 9% total (7.3%+1.7%)

describe('DE — 40k brutto, single, kinderlos, GKV', () => {
  // nettolohn.de ~2025: ~2,008 €/month
  // smart-rechner.de ~2025: ~2,010 €/month
  it('netMonthly ~2,012 €/mo (±2%)', () => {
    const result = calculate('de', opts({ gross: 40000 }));
    // Expected from §32a EStG 2025: incomeTax ~7,096, soli 0, social ~8,760 → net ~24,144/yr
    expect(withinTolerance(result.netMonthly, 2012)).toBe(true);
    expect(result.soli ?? 0).toBe(0); // below freigrenze — soli is undefined when 0
    expect(result.effectiveRate).toBeGreaterThan(0.37); // Gesamtbelastung ~40%
    expect(result.effectiveRate).toBeLessThan(0.45);
  });
});

describe('DE — 60k brutto, single, kinderlos, GKV', () => {
  // nettolohn.de ~2025: ~2,710 €/month
  it('netMonthly ~2,710 €/mo (±2%)', () => {
    const result = calculate('de', opts({ gross: 60000 }));
    // Expected: incomeTax ~14,337, soli 0, social ~13,140 → net ~32,523/yr
    expect(withinTolerance(result.netMonthly, 2710)).toBe(true);
    expect(result.soli ?? 0).toBe(0); // still below 19.950 freigrenze
  });
});

describe('DE — 80k brutto, single, kinderlos, GKV', () => {
  // nettolohn.de ~2025: ~3,410-3,460 €/month
  it('netMonthly ~3,439 €/mo (±2%)', () => {
    const result = calculate('de', opts({ gross: 80000 }));
    // Expected: incomeTax ~22,481, soli ~301, social ~15,955 → net ~41,263/yr
    expect(withinTolerance(result.netMonthly, 3439)).toBe(true);
    expect(result.soli).toBeGreaterThan(0); // soli kicks in above 19.950
  });
});

describe('DE — 80k brutto, verheiratet, 0 Kinder, GKV (Splitting)', () => {
  // Splitting reduziert Steuerlast erheblich
  // nettolohn.de ~2025 (Steuerklasse III approx.): ~4,100 €/month
  it('netMonthly ~4,121 €/mo (±2%), höher als single durch Splitting', () => {
    const result = calculate('de', opts({ gross: 80000, familyStatus: 'married' }));
    // Expected: splitting tax ~14,595, soli 0, same social → net ~49,450/yr
    expect(withinTolerance(result.netMonthly, 4121)).toBe(true);
    expect(result.soli ?? 0).toBe(0); // married freigrenze 39.900 — 14,595 < 39,900
  });

  it('netMonthly married > single (Splitting-Vorteil)', () => {
    const single = calculate('de', opts({ gross: 80000, familyStatus: 'single' }));
    const married = calculate('de', opts({ gross: 80000, familyStatus: 'married' }));
    expect(married.netMonthly).toBeGreaterThan(single.netMonthly);
  });
});

describe('DE — 80k brutto, verheiratet, 2 Kinder, GKV (Günstigerprüfung)', () => {
  // Günstigerprüfung: Kindergeld (6.000 €/Jahr) > Kinderfreibetrag-Ersparnis (4.145 €) → Kindergeld bleibt
  it('netMonthly ~4,148 €/mo (±2%)', () => {
    const result = calculate('de', opts({ gross: 80000, familyStatus: 'married', children: 2 }));
    // Expected: same tax as married-0-kinder (KFB nicht günstiger), but care slightly lower (0.018)
    expect(withinTolerance(result.netMonthly, 4148)).toBe(true);
  });

  it('PV-Beitrag mit Kindern (0.018) niedriger als kinderlos (0.023)', () => {
    const kinderlos = calculate('de', opts({ gross: 80000, familyStatus: 'married', children: 0 }));
    const mitKindern = calculate('de', opts({ gross: 80000, familyStatus: 'married', children: 2 }));
    expect(mitKindern.socialContributions.care).toBeLessThan(kinderlos.socialContributions.care);
  });
});

describe('DE — 120k brutto, single, PKV (kein GKV-Anteil)', () => {
  // nettolohn.de ~2025 PKV: ~5,550-5,580 €/month
  it('netMonthly ~5,567 €/mo (±2%)', () => {
    const result = calculate('de', opts({ gross: 120000, kvType: 'private' }));
    // Expected: incomeTax ~39,281, soli ~2,160, social ~11,761 (kein GKV) → net ~66,798/yr
    expect(withinTolerance(result.netMonthly, 5567)).toBe(true);
    expect(result.socialContributions.health).toBe(0); // PKV → kein GKV-Beitrag
  });
});

describe('DE — 250k brutto, single, GKV', () => {
  it('netMonthly ~11,103 €/mo (±2%)', () => {
    const result = calculate('de', opts({ gross: 250000 }));
    // Expected: incomeTax ~93,881, soli ~5,163, social ~17,715 → net ~133,241/yr
    expect(withinTolerance(result.netMonthly, 11103)).toBe(true);
    expect(result.soli).toBeGreaterThan(5000); // volles Soli
  });
});

describe('DE — 300k brutto, single (Reichensteuer 45 % ab 277.825 €)', () => {
  it('netMonthly ~13,369 €/mo (±2%)', () => {
    const result = calculate('de', opts({ gross: 300000 }));
    // Expected: 45%-Zone greift, incomeTax ~115,510, soli ~6,353, social ~17,715 → net ~160,422/yr
    expect(withinTolerance(result.netMonthly, 13369)).toBe(true);
    expect(result.marginalRate).toBeCloseTo(0.45, 1); // Spitzensteuersatz 45%
  });
});

// ─── Soli Freigrenze 2025 explizit ────────────────────────────────────────────
// § 3 Abs. 3 SolzG: Freigrenze 2025 = 19.950 € (ledig), 39.900 € (Splitting)
// Alter Wert im Code war 18.130 → führte zu zu frühem Soli-Einsatz

describe('DE Soli — Freigrenze 19.950 € (VZ 2025)', () => {
  it('kein Soli bei ESt = 19.950 € (an der Grenze)', () => {
    // Soli = 0, wenn incomeTax ≤ 19.950
    const soli = calculateSoli(19950, { gross: 0, currency: 'EUR', employment: 'employed', familyStatus: 'single', children: 0, year: 2025 });
    expect(soli).toBe(0);
  });

  it('Soli > 0 bei ESt = 19.951 € (knapp über Grenze)', () => {
    const soli = calculateSoli(19951, { gross: 0, currency: 'EUR', employment: 'employed', familyStatus: 'single', children: 0, year: 2025 });
    expect(soli).toBeGreaterThan(0);
  });

  it('voller Soli (5.5%) bei ESt = 40.000 € (über Milderungszone)', () => {
    // Milderungszone endet bei ~37.095 € ESt
    const soli = calculateSoli(40000, { gross: 0, currency: 'EUR', employment: 'employed', familyStatus: 'single', children: 0, year: 2025 });
    expect(soli).toBeCloseTo(40000 * 0.055, 0); // 2.200 €
  });

  it('kein Soli verheiratet bei ESt = 39.900 € (Splitting-Freigrenze)', () => {
    const soli = calculateSoli(39900, { gross: 0, currency: 'EUR', employment: 'employed', familyStatus: 'married', children: 0, year: 2025 });
    expect(soli).toBe(0);
  });

  it('mit altem Wert (18.130) würde Soli bei 40k zu früh einsetzen — früherer Fehler dokumentiert', () => {
    // 60k brutto → ESt ~14,337: unter 19.950 → kein Soli korrekt
    // Unter dem alten Wert 18.130 wäre Soli auch 0 gewesen (14.337 < 18.130) — ok
    // Bei 80k brutto → ESt ~22,481: über 19.950 → Soli korrekt
    // Unter altem Wert 18.130: ebenfalls Soli → alter Code überschätzte Soli-Einsetzen leicht
    const result80k = calculate('de', opts({ gross: 80000 }));
    expect(result80k.soli).toBeGreaterThan(0);
    expect(result80k.soli).toBeLessThan(600); // Milderungszone: deutlich unter vollem Soli
  });
});

// ─── BBG-Kappung bei Sozialabgaben ────────────────────────────────────────────
describe('DE — Beitragsbemessungsgrenzen (BBG 2025)', () => {
  it('RV/AV-Beitrag kapped bei BBG 96.600 €', () => {
    const below = calculate('de', opts({ gross: 96600 }));
    const above = calculate('de', opts({ gross: 150000 }));
    // Pension + Unemployment sollen ab 96.600 nicht mehr steigen
    const pensionBelow = below.socialContributions.pension;
    const pensionAbove = above.socialContributions.pension;
    expect(pensionAbove).toBe(pensionBelow);
  });

  it('KV/PV-Beitrag kapped bei BBG 66.150 €', () => {
    const below = calculate('de', opts({ gross: 66150 }));
    const above = calculate('de', opts({ gross: 100000 }));
    expect(above.socialContributions.health).toBe(below.socialContributions.health);
    expect(above.socialContributions.care).toBe(below.socialContributions.care);
  });
});

// ─── A.5 — Ehegatten-Splitting mit Partner-Einkommen ──────────────────────────
describe('DE — Splitting mit partnerGross (A.5)', () => {
  it('Alleinverdiener (partnerGross undefined) == bisheriges Verhalten', () => {
    const soleEarner = calculate('de', opts({ gross: 80000, familyStatus: 'married' }));
    // unchanged from the existing married single-earner case (~4,121 €/mo)
    expect(withinTolerance(soleEarner.netMonthly, 4121)).toBe(true);
  });

  it('Doppelverdiener (80k + 80k): Splitting-Vorteil entfällt → Nutzer-Netto wie Single', () => {
    const single = calculate('de', opts({ gross: 80000, familyStatus: 'single' }));
    const soleEarner = calculate('de', opts({ gross: 80000, familyStatus: 'married' }));
    const dual = calculate('de', opts({ gross: 80000, familyStatus: 'married', partnerGross: 80000 }));

    // Two equal earners → splitting gives no benefit → user taxed ~like a single.
    expect(dual.netMonthly).toBeLessThan(soleEarner.netMonthly); // verliert Splitting-Vorteil
    // Income tax attributed to the user ≈ single income tax (Soli differs: married
    // Freigrenze higher, so dual pays no Soli → net marginally above single).
    expect(dual.netMonthly).toBeGreaterThanOrEqual(single.netMonthly);
    expect(Math.abs(dual.netMonthly - single.netMonthly)).toBeLessThan(60);
  });

  it('Doppelverdiener (80k + 40k): zwischen Allein- und Gleichverdiener', () => {
    const soleEarner = calculate('de', opts({ gross: 80000, familyStatus: 'married' }));
    const equal = calculate('de', opts({ gross: 80000, familyStatus: 'married', partnerGross: 80000 }));
    const asym = calculate('de', opts({ gross: 80000, familyStatus: 'married', partnerGross: 40000 }));
    expect(asym.netMonthly).toBeLessThan(soleEarner.netMonthly);
    expect(asym.netMonthly).toBeGreaterThan(equal.netMonthly);
  });
});

// ─── A.6 — Kirchensteuer 8 % (BY/BW) / 9 % (übrige) ───────────────────────────
describe('DE — Kirchensteuer (A.6)', () => {
  it('kein Kirchensteuer ohne churchMember', () => {
    const r0 = calculate('de', opts({ gross: 80000 }));
    expect(r0.churchTax ?? 0).toBe(0);
  });

  it('9 % der Einkommensteuer in NRW (übrige Bundesländer)', () => {
    const base = calculate('de', opts({ gross: 80000 }));
    const church = calculate('de', opts({ gross: 80000, churchMember: true, bundesland: 'NW' }));
    expect(church.churchTax).toBeCloseTo(base.incomeTax * 0.09, 0);
    expect(church.netMonthly).toBeLessThan(base.netMonthly);
  });

  it('8 % in Bayern und Baden-Württemberg, niedriger als 9 %', () => {
    const base = calculate('de', opts({ gross: 80000 }));
    const by = calculate('de', opts({ gross: 80000, churchMember: true, bundesland: 'BY' }));
    const bw = calculate('de', opts({ gross: 80000, churchMember: true, bundesland: 'BW' }));
    const nw = calculate('de', opts({ gross: 80000, churchMember: true, bundesland: 'NW' }));
    expect(by.churchTax).toBeCloseTo(base.incomeTax * 0.08, 0);
    expect(bw.churchTax).toBeCloseTo(base.incomeTax * 0.08, 0);
    expect(by.netMonthly).toBeGreaterThan(nw.netMonthly); // 8 % < 9 % → höheres Netto
  });
});
