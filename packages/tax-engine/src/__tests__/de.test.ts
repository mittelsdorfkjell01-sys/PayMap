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
// Germany is on 2026 data (§32a 2026, Grundfreibetrag 12.348 €). The engine now
// applies the standard Vorsorgepauschale (§39b Abs. 2 EStG, BMF 14.08.2025):
// deductible RV (9.3% AN, 100%), KV-Basisabsicherung (8.45%) and PV — exactly
// what official brutto-netto calculators use. Before this fix the engine taxed
// an almost-undiminished gross and net was ~2.4k too low @60k.
//
// External anchor @60k (5.000 €/mo, StKl I, kinderlos, ohne Kirche, GKV, 2026):
//   lohntastik.de → 3.130 €/mo; smart-rechner.de/netto-check.de → 3.139 €/mo
//   (Lohnsteuer 803,67 + SV 1.057,50, Soli 0). Retrieved 2026-06-09.
// Engine: 3.129 €/mo — deckungsgleich (<0,3%). Zusatzbeitrag-Annahme 2,9%.

describe('DE — 40k brutto, single, kinderlos, GKV', () => {
  it('netMonthly ~2,240 €/mo (±2%)', () => {
    const result = calculate('de', opts({ gross: 40000 }));
    // zvE 30.710 (nach Werbungskosten 1.230 + Vorsorgepauschale 8.060):
    // ESt 4.418, Soli 0, SV 8.700 → net 26.882/yr
    expect(withinTolerance(result.netMonthly, 2240.15)).toBe(true);
    expect(result.soli ?? 0).toBe(0); // below freigrenze — soli is undefined when 0
    expect(result.effectiveRate).toBeGreaterThan(0.30);
    expect(result.effectiveRate).toBeLessThan(0.37);
  });
});

describe('DE — 60k brutto, single, kinderlos, GKV', () => {
  it('netMonthly ~3,129 €/mo (±2%) — externer Anker 3.130 €/mo', () => {
    const result = calculate('de', opts({ gross: 60000 }));
    // zvE 46.680 (Werbungskosten 1.230 + Vorsorgepauschale 12.090):
    // ESt 9.401, Soli 0, SV 13.050 → net 37.549/yr = 3.129/mo
    expect(withinTolerance(result.netMonthly, 3129.04)).toBe(true);
    expect(result.soli ?? 0).toBe(0); // ESt 9.401 < Freigrenze 20.350
  });
});

describe('DE — 80k brutto, single, kinderlos, GKV', () => {
  it('netMonthly ~4,003 €/mo (±2%)', () => {
    const result = calculate('de', opts({ gross: 80000 }));
    // zvE 63.762, ESt 15.709, Soli 0 (ESt < 20.350), SV 16.257 → net 48.034/yr
    expect(withinTolerance(result.netMonthly, 4002.81)).toBe(true);
    // Soli setzt erst über der Freigrenze ein (ESt 15.709 < 20.350) → 0.
    expect(result.soli ?? 0).toBe(0);
  });
});

describe('DE — 80k brutto, verheiratet, 0 Kinder, GKV (Splitting)', () => {
  // Splitting reduziert Steuerlast erheblich
  // nettolohn.de ~2025 (Steuerklasse III approx.): ~4,100 €/month
  it('netMonthly ~4,520 €/mo (±2%), höher als single durch Splitting', () => {
    const result = calculate('de', opts({ gross: 80000, familyStatus: 'married' }));
    // Splitting auf zvE 63.762: ESt 9.507, Soli 0, SV 16.257 → net 54.236/yr
    expect(withinTolerance(result.netMonthly, 4519.64)).toBe(true);
    expect(result.soli ?? 0).toBe(0); // married Freigrenze 40.700 — 9.507 < 40.700
  });

  it('netMonthly married > single (Splitting-Vorteil)', () => {
    const single = calculate('de', opts({ gross: 80000, familyStatus: 'single' }));
    const married = calculate('de', opts({ gross: 80000, familyStatus: 'married' }));
    expect(married.netMonthly).toBeGreaterThan(single.netMonthly);
  });
});

describe('DE — 80k brutto, verheiratet, 2 Kinder, GKV (Günstigerprüfung)', () => {
  // Günstigerprüfung: Kindergeld (6.000 €/Jahr) > Kinderfreibetrag-Ersparnis (4.145 €) → Kindergeld bleibt
  it('netMonthly ~4,544 €/mo (±2%)', () => {
    const result = calculate('de', opts({ gross: 80000, familyStatus: 'married', children: 2 }));
    // KFB nicht günstiger (Kindergeld bleibt); PV mit Kindern (1.8%) niedriger → net 54.533/yr
    expect(withinTolerance(result.netMonthly, 4544.44)).toBe(true);
  });

  it('PV-Beitrag mit Kindern (0.018) niedriger als kinderlos (0.023)', () => {
    const kinderlos = calculate('de', opts({ gross: 80000, familyStatus: 'married', children: 0 }));
    const mitKindern = calculate('de', opts({ gross: 80000, familyStatus: 'married', children: 2 }));
    expect(mitKindern.socialContributions.care).toBeLessThan(kinderlos.socialContributions.care);
  });
});

describe('DE — 120k brutto, single, PKV (privater Beitrag)', () => {
  it('mit PKV-Beitrag €700/mo: dieser zählt als health, nicht 0', () => {
    const result = calculate('de', opts({ gross: 120000, kvType: 'private', privateKvPremium: 700 }));
    // health = 700×12 = 8.400; KV-Vorsorge ausgespart (dokumentierte Näherung);
    // zvE 107.666, ESt 34.084, Soli 1.634 → net 63.459/yr
    expect(result.socialContributions.health).toBe(8400);
    expect(withinTolerance(result.netMonthly, 5288.27)).toBe(true);
  });

  it('PKV ohne angegebenen Beitrag → wie gesetzlich genähert (nicht 0)', () => {
    const withoutPremium = calculate('de', opts({ gross: 120000, kvType: 'private' }));
    const statutory = calculate('de', opts({ gross: 120000, kvType: 'statutory' }));
    expect(withoutPremium.socialContributions.health).toBeGreaterThan(0);
    expect(withoutPremium.netMonthly).toBeCloseTo(statutory.netMonthly, 2);
  });
});

describe('DE — 250k brutto, single, GKV', () => {
  it('netMonthly ~11,710 €/mo (±2%)', () => {
    const result = calculate('de', opts({ gross: 250000 }));
    // zvE 231.772, ESt 86.209, Soli 4.741, SV 18.526 → net 140.524/yr
    expect(withinTolerance(result.netMonthly, 11710.37)).toBe(true);
    expect(result.soli).toBeGreaterThan(4000); // (nahezu) volles Soli
  });
});

describe('DE — 300k brutto, single (Reichensteuer 45 % ab 277.825 €)', () => {
  it('netMonthly ~14,020 €/mo (±2%)', () => {
    const result = calculate('de', opts({ gross: 300000 }));
    // 45%-Zone greift, zvE 281.772, ESt 107.327, Soli 5.903, SV 18.526 → net 168.245/yr
    expect(withinTolerance(result.netMonthly, 14020.38)).toBe(true);
    expect(result.marginalRate).toBeCloseTo(0.45, 1); // Spitzensteuersatz 45%
  });
});

// ─── Soli Freigrenze 2025 explizit ────────────────────────────────────────────
// § 3 Abs. 3 SolzG: Freigrenze 2025 = 19.950 € (ledig), 39.900 € (Splitting)
// Alter Wert im Code war 18.130 → führte zu zu frühem Soli-Einsatz

describe('DE Soli — Freigrenze 20.350 € (VZ 2026)', () => {
  it('kein Soli bei ESt = 20.350 € (an der Grenze)', () => {
    // Soli = 0, wenn incomeTax ≤ 20.350 (Freigrenze 2026, ledig)
    const soli = calculateSoli(20350, { gross: 0, currency: 'EUR', employment: 'employed', familyStatus: 'single', children: 0, year: 2026 });
    expect(soli).toBe(0);
  });

  it('Soli > 0 bei ESt = 20.351 € (knapp über Grenze)', () => {
    const soli = calculateSoli(20351, { gross: 0, currency: 'EUR', employment: 'employed', familyStatus: 'single', children: 0, year: 2026 });
    expect(soli).toBeGreaterThan(0);
  });

  it('voller Soli (5.5%) bei ESt = 40.000 € (über Milderungszone)', () => {
    const soli = calculateSoli(40000, { gross: 0, currency: 'EUR', employment: 'employed', familyStatus: 'single', children: 0, year: 2026 });
    expect(soli).toBeCloseTo(40000 * 0.055, 0); // 2.200 €
  });

  it('kein Soli verheiratet bei ESt = 40.700 € (Splitting-Freigrenze 2026)', () => {
    const soli = calculateSoli(40700, { gross: 0, currency: 'EUR', employment: 'employed', familyStatus: 'married', children: 0, year: 2026 });
    expect(soli).toBe(0);
  });

  it('Soli setzt erst über der Freigrenze ein — bei 100k GKV in der Milderungszone', () => {
    // Mit Vorsorgepauschale liegt die ESt @80k (15.709) noch UNTER der Freigrenze
    // 20.350 → kein Soli. Erst @100k (ESt 23.263 > 20.350) greift der Soli, und
    // zwar in der Milderungszone (deutlich unter dem vollen 5,5%-Satz).
    const result80k = calculate('de', opts({ gross: 80000 }));
    expect(result80k.soli ?? 0).toBe(0);
    const result100k = calculate('de', opts({ gross: 100000 }));
    expect(result100k.soli).toBeGreaterThan(0);
    expect(result100k.soli!).toBeLessThan(600); // Milderungszone
  });
});

// ─── BBG-Kappung bei Sozialabgaben ────────────────────────────────────────────
describe('DE — Beitragsbemessungsgrenzen (BBG 2026)', () => {
  it('RV/AV-Beitrag kapped bei BBG 101.400 €', () => {
    const below = calculate('de', opts({ gross: 101400 }));
    const above = calculate('de', opts({ gross: 150000 }));
    // Pension + Unemployment sollen ab 101.400 nicht mehr steigen
    expect(above.socialContributions.pension).toBe(below.socialContributions.pension);
  });

  it('KV/PV-Beitrag kapped bei BBG 69.750 €', () => {
    const below = calculate('de', opts({ gross: 69750 }));
    const above = calculate('de', opts({ gross: 100000 }));
    expect(above.socialContributions.health).toBe(below.socialContributions.health);
    expect(above.socialContributions.care).toBe(below.socialContributions.care);
  });
});

// ─── A.5 — Ehegatten-Splitting mit Partner-Einkommen ──────────────────────────
describe('DE — Splitting mit partnerGross (A.5)', () => {
  it('Alleinverdiener (partnerGross undefined) == bisheriges Verhalten', () => {
    const soleEarner = calculate('de', opts({ gross: 80000, familyStatus: 'married' }));
    // matches the married single-earner case above (~4,520 €/mo)
    expect(withinTolerance(soleEarner.netMonthly, 4519.64)).toBe(true);
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

// ─── Schritt 2 — Versicherungs-Overrides (insuranceOverrides, Variante B) ──────
// Explizite Monatsbeiträge ersetzen die automatischen (Satz × gekapptes Brutto)
// Beträge und fließen BEIDES: in den Netto-Abzug UND die Vorsorgepauschale (zvE).
describe('DE — insuranceOverrides (Variante B)', () => {
  it('leeres Override-Objekt ist ein No-op (== Auto-Berechnung)', () => {
    const auto = calculate('de', opts({ gross: 80000 }));
    const empty = calculate('de', opts({ gross: 80000, insuranceOverrides: {} }));
    expect(empty.socialContributions.total).toBe(auto.socialContributions.total);
    expect(empty.netMonthly).toBe(auto.netMonthly);
    expect(empty.incomeTax).toBe(auto.incomeTax);
  });

  it('expliziter Beitrag ersetzt den Auto-Betrag pro Zweig (×12)', () => {
    const result = calculate('de', opts({
      gross: 80000,
      insuranceOverrides: { health: 500, care: 60, pension: 700, unemployment: 90 },
    }));
    expect(result.socialContributions.health).toBe(6000);
    expect(result.socialContributions.care).toBe(720);
    expect(result.socialContributions.pension).toBe(8400);
    expect(result.socialContributions.unemployment).toBe(1080);
  });

  it('nicht gesetzte Zweige behalten die Auto-Berechnung', () => {
    const auto = calculate('de', opts({ gross: 80000 }));
    const partial = calculate('de', opts({ gross: 80000, insuranceOverrides: { health: 500 } }));
    expect(partial.socialContributions.pension).toBe(auto.socialContributions.pension);
    expect(partial.socialContributions.care).toBe(auto.socialContributions.care);
    expect(partial.socialContributions.unemployment).toBe(auto.socialContributions.unemployment);
  });

  it('Variante B: höhere Beiträge senken über die Vorsorgepauschale auch die Steuer', () => {
    const auto = calculate('de', opts({ gross: 80000 }));
    // Deutlich höhere Renten-/KV-Beiträge als die Automatik (RV 7.440, KV ~5.894).
    const higher = calculate('de', opts({
      gross: 80000,
      insuranceOverrides: { pension: 1200, health: 900 },
    }));
    // Mehr abzugsfähige Vorsorge → höhere Abzüge → niedrigeres zvE → weniger ESt.
    expect(higher.deductions).toBeGreaterThan(auto.deductions);
    expect(higher.taxableIncome).toBeLessThan(auto.taxableIncome);
    expect(higher.incomeTax).toBeLessThan(auto.incomeTax);
  });

  it('health-Override hat Vorrang vor privateKvPremium', () => {
    const result = calculate('de', opts({
      gross: 120000,
      kvType: 'private',
      privateKvPremium: 700,        // würde sonst 8.400 ergeben
      insuranceOverrides: { health: 500 }, // gewinnt → 6.000
    }));
    expect(result.socialContributions.health).toBe(6000);
  });
});
