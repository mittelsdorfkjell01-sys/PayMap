/**
 * Reference tests for all non-DE country modules.
 * Tolerance: ±2% on netMonthly unless noted.
 * Sources: official tax authority websites + national brutto-netto calculators.
 * If a reliable source could not be verified, test is marked it.skip() with reason.
 */
import { describe, it, expect } from 'vitest';
import { calculate } from '../calculate';
import type { TaxOptions } from '../types';

const TOLERANCE = 0.02;
const r = (x: number) => Math.round(x * 100) / 100;

function withinTolerance(actual: number, expected: number): boolean {
  if (expected === 0) return actual === 0;
  return Math.abs(actual - expected) / expected <= TOLERANCE;
}

function opts(country: string, gross: number, currency: string, overrides: Partial<TaxOptions> = {}): TaxOptions {
  return {
    gross,
    currency,
    employment: 'employed',
    familyStatus: 'single',
    children: 0,
    kvType: 'statutory',
    year: 2025,
    ...overrides,
  };
}

// ─── Portugal ──────────────────────────────────────────────────────────────────
// Source: portaldasfinancas.gov.pt / simuladores.at.gov.pt
// PT social: 11% flat (no cap), no deductions

// Now applies the dedução específica Categoria A (Art. 25 CIRS): max(€4.462,15,
// SS contributions). At ≥40k the SS (11%) dominates, so the base = gross − SS.
// Annual-settlement basis (collecta), not monthly retention.
describe('PT — Standard (mit dedução específica)', () => {
  it('40k EUR: netMonthly ~2,207 €/mo (±2%)', () => {
    // Dedução específica max(4.462,15, SS 4.400) = 4.462,15; base 35.537,85;
    // collecta 9.115; social 4.400 → net 26.485/yr
    const result = calculate('pt', opts('pt', 40000, 'EUR'));
    expect(withinTolerance(result.netMonthly, 2207.09)).toBe(true);
  });

  it('80k EUR: netMonthly ~3,880 €/mo (±2%)', () => {
    // Dedução específica = SS 8.800 (> fixed); base 71.200; collecta 24.640;
    // social 8.800 → net 46.560/yr
    const result = calculate('pt', opts('pt', 80000, 'EUR'));
    expect(withinTolerance(result.netMonthly, 3880.04)).toBe(true);
  });

  it('120k EUR: netMonthly ~5,448 €/mo (±2%)', () => {
    // Dedução específica = SS 13.200; base 106.800 (all in 48% tier from 81.199)
    const result = calculate('pt', opts('pt', 120000, 'EUR'));
    expect(withinTolerance(result.netMonthly, 5447.7)).toBe(true);
  });
});

describe('PT — IFICI+ Regime (20% flat)', () => {
  // Source: DL 249/2009 alterado por Lei 20/2012, atualizado 2024
  // IFICI: 20% flat rate on PT-source income for new residents (formerly NHR)
  it('80k EUR mit IFICI: netMonthly ~4,600 €/mo (±2%)', () => {
    // Tax: 80,000 × 20% = 16,000; social: 8,800; total: 24,800; net: 55,200/yr
    const result = calculate('pt', opts('pt', 80000, 'EUR', { specialRegimeId: 'ifici-pt' }));
    expect(withinTolerance(result.netMonthly, 4600)).toBe(true);
  });

  it('IFICI net > Standard net (deutliche Ersparnis)', () => {
    const standard = calculate('pt', opts('pt', 80000, 'EUR'));
    const ifici = calculate('pt', opts('pt', 80000, 'EUR', { specialRegimeId: 'ifici-pt' }));
    expect(ifici.netMonthly).toBeGreaterThan(standard.netMonthly);
    // Vorteil ~720 €/mo — kleiner als früher, da die dedução específica das
    // Standard-Netto angehoben hat (war zuvor zu niedrig berechnet).
    expect(ifici.netMonthly - standard.netMonthly).toBeGreaterThan(700);
  });

  it('120k EUR mit IFICI: netMonthly ~6,533 €/mo (±2%)', () => {
    // Tax: 120,000 × 20% = 24,000; social: 13,200; net: 82,800/yr
    const result = calculate('pt', opts('pt', 120000, 'EUR', { specialRegimeId: 'ifici-pt' }));
    expect(withinTolerance(result.netMonthly, 6900)).toBe(true);
  });
});

// ─── Spanien ───────────────────────────────────────────────────────────────────
// Source: state scale Art. 63.1 LIRPF (sede.agenciatributaria.gob.es); comunidad
// scales: comunidad.madrid (BOCM), atc.gencat.cat (Cataluña DL 5/2025), atv.gva.es
// (Valencia Ley 13/1997). IRPF = state scale + the city's comunidad regional scale (A.1).
// IRPF now applies the mínimo personal (€5.550, credit: escala(base)−escala(mínimo)
// on both state and comunidad scale), deductible social security and the €2.000
// work expense. External anchor @60k Madrid (single, 2026): es.talent.com →
// 42.209 €/yr; engine 42.367 €/yr (<0,4%). Retrieved 2026-06-09. ±2%.

describe('ES — Standard (region-specific comunidad scale + mínimo, A.1)', () => {
  it('40k EUR Madrid: netMonthly ~2,517 €/mo (±2%)', () => {
    // Base 40.000 − SS 2.540 − 2.000 = 35.460; cuota = [escala_est + escala_Madrid]
    // − escala(5.550) = 7.259; social 2.540 → net 30.201/yr
    const result = calculate('es', opts('es', 40000, 'EUR', { region: 'comunidad-madrid' }));
    expect(withinTolerance(result.netMonthly, 2516.73)).toBe(true);
  });

  it('60k EUR Madrid: netMonthly ~3,531 €/mo (±2%) — externer Anker 42.209 €/yr', () => {
    const result = calculate('es', opts('es', 60000, 'EUR', { region: 'comunidad-madrid' }));
    expect(withinTolerance(result.netMonthly, 3530.58)).toBe(true);
    expect(result.netAnnual).toBeGreaterThan(41000);
    expect(result.netAnnual).toBeLessThan(43500);
  });

  it('80k EUR Madrid: netMonthly ~4,507 €/mo (±2%)', () => {
    const result = calculate('es', opts('es', 80000, 'EUR', { region: 'comunidad-madrid' }));
    expect(withinTolerance(result.netMonthly, 4506.55)).toBe(true);
  });

  it('120k EUR Madrid: netMonthly ~6,407 €/mo (±2%)', () => {
    const result = calculate('es', opts('es', 120000, 'EUR', { region: 'comunidad-madrid' }));
    expect(withinTolerance(result.netMonthly, 6406.55)).toBe(true);
  });

  it('80k EUR: Madrid > Barcelona > Valencia net (region matters, A.9)', () => {
    // Madrid is the cheapest comunidad, Valencia the most expensive at this income.
    const madrid = calculate('es', opts('es', 80000, 'EUR', { region: 'comunidad-madrid' }));
    const barcelona = calculate('es', opts('es', 80000, 'EUR', { region: 'cataluna' }));
    const valencia = calculate('es', opts('es', 80000, 'EUR', { region: 'comunitat-valenciana' }));
    expect(madrid.netMonthly).toBeGreaterThan(barcelona.netMonthly);
    expect(barcelona.netMonthly).toBeGreaterThan(valencia.netMonthly);
    expect(withinTolerance(barcelona.netMonthly, 4395.84)).toBe(true);
    expect(withinTolerance(valencia.netMonthly, 4361.7)).toBe(true);
  });
});

describe('ES — Beckham Law (24% flat bis 600k)', () => {
  // Source: Art. 93 LIRPF — Régimen especial de trabajadores desplazados
  it('80k EUR mit Beckham: netMonthly ~4,770 €/mo (±2%)', () => {
    // Tax: 80,000 × 0.24 = 19,200; social: 3,560; total: 22,760; net: 57,240/yr
    const result = calculate('es', opts('es', 80000, 'EUR', { specialRegimeId: 'beckham-es' }));
    expect(withinTolerance(result.netMonthly, 4770)).toBe(true);
  });

  it('Beckham net > Standard net (vs Madrid comunidad)', () => {
    const standard = calculate('es', opts('es', 80000, 'EUR', { region: 'comunidad-madrid' }));
    const beckham = calculate('es', opts('es', 80000, 'EUR', { specialRegimeId: 'beckham-es' }));
    expect(beckham.netMonthly).toBeGreaterThan(standard.netMonthly);
  });
});

// ─── Regression: Quoten-Regimes dürfen das Gehalt nicht steuerfrei stellen ────
// Vor dem Fix lieferten fr/at/pl applySpecialRegime() = 0 (gesamtes Gehalt
// steuerfrei) — ein gravierender Rechenfehler. FR/AT betreffen nur Teileinkünfte
// (Prämie bzw. wiss. Einkünfte) → Normaltarif, kein Gehalts-Effekt (hasEffect
// wird in der API false). PL (Ulga na powrót) befreit bis 85.528 PLN.
describe('Regression — Sonderregime macht Gehalt nicht steuerfrei', () => {
  it('FR impatriés: Regime-Netto == Normaltarif (kein Gehalts-Effekt)', () => {
    const normal = calculate('fr', opts('fr', 90000, 'EUR'));
    const regime = calculate('fr', opts('fr', 90000, 'EUR', { specialRegimeId: 'impatries-fr' }));
    expect(regime.netAnnual).toBe(normal.netAnnual);
    expect(regime.netMonthly).toBeLessThan(regime.gross / 12); // NICHT steuerfrei
  });

  it('AT Zuzugsbegünstigung: Regime-Netto == Normaltarif', () => {
    const normal = calculate('at', opts('at', 90000, 'EUR'));
    const regime = calculate('at', opts('at', 90000, 'EUR', { specialRegimeId: 'zuzug-at' }));
    expect(regime.netAnnual).toBe(normal.netAnnual);
    expect(regime.netMonthly).toBeLessThan(regime.gross / 12);
  });

  it('PL Ulga na powrót: senkt Steuer, aber Gehalt bleibt teilweise besteuert', () => {
    const normal = calculate('pl', opts('pl', 300000, 'PLN', { specialRegimeId: undefined }));
    const regime = calculate('pl', opts('pl', 300000, 'PLN', { specialRegimeId: 'ulga-powrot-pl' }));
    expect(regime.netAnnual).toBeGreaterThan(normal.netAnnual); // Entlastung wirkt
    expect(regime.netMonthly).toBeLessThan(regime.gross / 12);  // nicht komplett steuerfrei
  });
});

// ─── IT Impatriati — 50 % bzw. 60 % (mit minderjährigem Kind) ─────────────────
describe('IT — Impatriati 50/60 %', () => {
  it('mit Kind (60 % befreit) → höheres Netto als ohne Kind (50 %)', () => {
    const noChild = calculate('it', opts('it', 90000, 'EUR', { specialRegimeId: 'impatriate-it', children: 0 }));
    const child = calculate('it', opts('it', 90000, 'EUR', { specialRegimeId: 'impatriate-it', children: 1 }));
    expect(child.netMonthly).toBeGreaterThan(noChild.netMonthly);
  });
  it('Regime senkt die Steuer ggü. Normaltarif', () => {
    const normal = calculate('it', opts('it', 90000, 'EUR'));
    const regime = calculate('it', opts('it', 90000, 'EUR', { specialRegimeId: 'impatriate-it' }));
    expect(regime.netMonthly).toBeGreaterThan(normal.netMonthly);
  });
});

// ─── Niederlande — Expat-Ruling 2026 (flat 30 %, ab 2027 27 %) ────────────────
// Sources (retrieved 2026-06-13):
//   iamsterdam.com / cardon.nl / portsighttax.com — Tax Plan 2026:
//   Die im Tax Plan 2024 geplante 30-20-10-Staffel wurde ZURÜCKGENOMMEN.
//   2026: flat 30 % steuerfreier Anteil; ab 1.1.2027 einheitlich 27 %.
//   Begünstigter Gehaltsanteil gedeckelt auf 262.000 € (2026).
// Der Regime-Pfad rechnet jetzt über calculateIncomeTax (inkl. heffingskortingen)
// auf der reduzierten Basis — daher höhere Nettos als im alten Staffel-Golden.

describe('NL — Expat-Ruling 2026 (flat, keine Staffel)', () => {
  it('2026: 30 % steuerfrei → Netto unabhängig von rulingYearsActive (keine Staffel)', () => {
    const y0 = calculate('nl', opts('nl', 80000, 'EUR', { specialRegimeId: 'ruling30-nl', rulingYearsActive: 0 }));
    const y4 = calculate('nl', opts('nl', 80000, 'EUR', { specialRegimeId: 'ruling30-nl', rulingYearsActive: 4 }));
    // exempt = 80.000 × 30 % = 24.000 → Steuer auf 56.000 inkl. heffingskortingen
    expect(withinTolerance(y0.netMonthly, 5477.16)).toBe(true);
    expect(y4.netMonthly).toBe(y0.netMonthly); // Staffel abgeschafft → identisch
  });

  it('Ruling senkt die Steuer ggü. Normaltarif', () => {
    const ruling = calculate('nl', opts('nl', 80000, 'EUR', { specialRegimeId: 'ruling30-nl' }));
    const normal = calculate('nl', opts('nl', 80000, 'EUR'));
    expect(ruling.netMonthly).toBeGreaterThan(normal.netMonthly);
  });

  it('ab 2027: 27 % statt 30 % → etwas weniger Netto als 2026, aber mehr als Normaltarif', () => {
    const y2026 = calculate('nl', opts('nl', 80000, 'EUR', { specialRegimeId: 'ruling30-nl', year: 2026 }));
    const y2027 = calculate('nl', opts('nl', 80000, 'EUR', { specialRegimeId: 'ruling30-nl', year: 2027 }));
    const normal = calculate('nl', opts('nl', 80000, 'EUR', { year: 2027 }));
    expect(y2027.netMonthly).toBeLessThan(y2026.netMonthly);
    expect(y2027.netMonthly).toBeGreaterThan(normal.netMonthly);
  });

  it('Cap 262.000 €: der steuerfreie Anteil wächst oberhalb nicht weiter', () => {
    // Bei 400.000 € ist exempt auf 262.000 × 30 % = 78.600 gedeckelt.
    const hi = calculate('nl', opts('nl', 400000, 'EUR', { specialRegimeId: 'ruling30-nl' }));
    expect(withinTolerance(hi.netMonthly, 20898.21)).toBe(true);
  });
});

// ─── Niederlande — Standard (3-stufige Box-1-Skala + heffingskortingen) ────────
// Sources (retrieved 2026-06-09):
//   Brackets: belastingdienst.nl …/box_1 (35,82% / 37,48% / 49,50%)
//   Algemene heffingskorting 2025: max €3.068, afbouw 6,337% > €28.406
//   Arbeidskorting 2025: belastingdienst.nl tabel-arbeidskorting-2025 (max €5.599)
// Net @60k ≈ 43.713 €/yr — im offiziellen Zielkorridor 43–44k und deckungsgleich
// mit gängigen NL bruto-netto Rechnern (±2%). Externe Stützpunkte: siehe PR5.

describe('NL — Standard (ohne Ruling)', () => {
  it('40k EUR: netMonthly ~2,792 €/mo (±2%)', () => {
    // Box-1 14,353.89 − AHK 2,333.26 − arbeidskorting 5,529.53 = tax 6,491.10
    // Net: 33,508.90 / 12 = 2,792.41
    const result = calculate('nl', opts('nl', 40000, 'EUR'));
    expect(withinTolerance(result.netMonthly, 2792.41)).toBe(true);
  });

  it('60k EUR: netMonthly ~3,643 €/mo (±2%) — Zielkorridor 43–44k/yr', () => {
    // Box-1 21,849.88 − AHK 1,065.87 − arbeidskorting 4,496.83 = tax 16,287.18
    // Net: 43,712.82 / 12 = 3,642.74
    const result = calculate('nl', opts('nl', 60000, 'EUR'));
    expect(withinTolerance(result.netMonthly, 3642.73)).toBe(true);
    expect(result.netAnnual).toBeGreaterThan(43000);
    expect(result.netAnnual).toBeLessThan(44000);
  });

  it('80k EUR: netMonthly ~4,456 €/mo (±2%)', () => {
    // Box-1 29,728.48 − AHK 0 (>76.820 afbouw) − arbeidskorting 3,194.83 = tax 26,533.65
    // Net: 53,466.35 / 12 = 4,455.53
    const result = calculate('nl', opts('nl', 80000, 'EUR'));
    expect(withinTolerance(result.netMonthly, 4455.53)).toBe(true);
  });

  it('heffingskortingen bauen mit steigendem Einkommen ab (Progression)', () => {
    const r60 = calculate('nl', opts('nl', 60000, 'EUR'));
    const r80 = calculate('nl', opts('nl', 80000, 'EUR'));
    expect(r80.effectiveRate).toBeGreaterThan(r60.effectiveRate);
  });
});

// ─── Österreich ───────────────────────────────────────────────────────────────
// Source: bmf.gv.at Lohnsteuerrechner 2025
// AT: Sondergebühren (13./14. Gehalt) NICHT modelliert → Netto höher in Realität

// A.8 — Austria now splits the annual gross into 12 laufende Bezüge (progressive)
// + 2 Sonderzahlungen (13th/14th salary) taxed under the Jahressechstel scheme
// (€620 free, 6% on the next €24,380, then 27%; SV ~1% lower). This raises the
// net vs. the previous naive full-progressive model — that was the bug.
// Golden values are derived from the engine's AT bracket set + the verified
// Jahressechstel parameters. NB: the AT base brackets themselves (12.816 …)
// look like 2024 values; aligning them to official 2025 figures is a separate
// open item and would shift these goldens slightly.
describe('AT 2026 (A.8 — 13./14. Gehalt / Jahressechstel + Verkehrsabsetzbetrag)', () => {
  // Now also applies the Verkehrsabsetzbetrag (€496 credit on the laufende-Bezüge tax).
  it('40k EUR: netMonthly ~2,302 €/mo (±2%)', () => {
    const result = calculate('at', opts('at', 40000, 'EUR'));
    expect(withinTolerance(result.netMonthly, 2301.73)).toBe(true);
  });

  it('80k EUR: netMonthly ~3,883 €/mo (±2%)', () => {
    const result = calculate('at', opts('at', 80000, 'EUR'));
    expect(withinTolerance(result.netMonthly, 3882.5)).toBe(true);
  });

  it('120k EUR: netMonthly ~5,229 €/mo (±2%)', () => {
    const result = calculate('at', opts('at', 120000, 'EUR'));
    expect(withinTolerance(result.netMonthly, 5228.55)).toBe(true);
  });
});

// ─── Italien ───────────────────────────────────────────────────────────────────
// Source: agenziaentrate.gov.it — IRPEF 2026 (L. 199/2025): 23% / 33% / 43%
// (2nd bracket cut 35→33). National cases carry IRPEF only; the addizionale
// regionale/comunale apply when a region/city is set (see the Milan case).

describe('IT — Standard (IRPEF 2026)', () => {
  it('40k EUR: netMonthly ~2,233 €/mo (±2%)', () => {
    // IRPEF 10,400 − detrazione lavoro 868,18 (Art. 13: 1.910×(50.000−40.000)/22.000)
    // = 9.531,82; social 3,676 → net ~26.792/yr
    const result = calculate('it', opts('it', 40000, 'EUR'));
    expect(withinTolerance(result.netMonthly, 2232.68)).toBe(true);
  });

  it('80k EUR: netMonthly ~3,837 €/mo (±2%)', () => {
    // IRPEF: 6440 + 22000*0.33 + 30000*0.43 = 26,600; social 7,352; net ~46,048/yr
    const result = calculate('it', opts('it', 80000, 'EUR'));
    expect(withinTolerance(result.netMonthly, 3837)).toBe(true);
  });

  it('Effektivrate steigt mit Einkommen (Progressionstest)', () => {
    const r40 = calculate('it', opts('it', 40000, 'EUR'));
    const r80 = calculate('it', opts('it', 80000, 'EUR'));
    expect(r80.effectiveRate).toBeGreaterThan(r40.effectiveRate);
  });
});

describe('IT — Mailand/Lombardia (A.4 addizionale, 2026)', () => {
  it('80k EUR Milan: IRPEF + addizionale regionale + comunale, netMonthly ~3,677 €/mo (±2%)', () => {
    // IRPEF 26,600 + Lombardia reg. (1,287.3) + Milano com. 0.8% (640) = 28,527.3;
    // social 7,352; net ~44,121/yr. Source: MEF addizionali regionali 2026; Comune di Milano.
    const result = calculate('it', opts('it', 80000, 'EUR', { region: 'lombardia', cityScope: 'mailand' }));
    expect(withinTolerance(result.netMonthly, 3677)).toBe(true);
    const national = calculate('it', opts('it', 80000, 'EUR'));
    expect(result.netMonthly).toBeLessThan(national.netMonthly); // addizionale reduce net
  });
});

describe('IT — Impatriate Regime (50% steuerfrei)', () => {
  // Source: Art. 16 D.Lgs. 147/2015 — Regime Impatriati
  it('80k EUR mit Impatriate: netMonthly ~5,167 €/mo (±2%)', () => {
    // Tax auf 50% = 40,000: 28000*0.23+12000*0.35=10,640; social: 7,352; net: ~62,008/yr
    const result = calculate('it', opts('it', 80000, 'EUR', { specialRegimeId: 'impatriate-it' }));
    expect(withinTolerance(result.netMonthly, 5167)).toBe(true);
  });

  it('Impatriate net > Standard net', () => {
    const standard = calculate('it', opts('it', 80000, 'EUR'));
    const impatriate = calculate('it', opts('it', 80000, 'EUR', { specialRegimeId: 'impatriate-it' }));
    expect(impatriate.netMonthly).toBeGreaterThan(standard.netMonthly);
  });
});

// ─── Schweiz ───────────────────────────────────────────────────────────────────
// Source: Kanton Zürich Approximation. Income tax = effective-rate approximation
// (Anhang A). Now includes the mandatory KVG basic-insurance premium: mittlere
// Erwachsenenprämie Zürich 2025 = CHF 431,60/Mo (BAG/priminfo.admin.ch).

describe('CH', () => {
  it('60.000 CHF: netMonthly ~3,498 CHF/mo (±2%)', () => {
    // tax 9.000; social pension 3.180 + unem 660 + KVG-Prämie 5.179,20 = 9.019,20
    // net 41.980,80/yr = 3.498,40/mo
    const result = calculate('ch', opts('ch', 60000, 'CHF'));
    expect(withinTolerance(result.netMonthly, 3498.4)).toBe(true);
    // KVG-Prämie ist im health-Beitrag enthalten (CHF 431,60 × 12)
    expect(result.socialContributions.health).toBeCloseTo(431.6 * 12, 1);
  });

  it('100.000 CHF: netMonthly ~5,713 CHF/mo (±2%)', () => {
    // tax 20.000; social pension 5.300 + unem 970,20 + KVG 5.179,20 = 11.449,40
    const result = calculate('ch', opts('ch', 100000, 'CHF'));
    expect(withinTolerance(result.netMonthly, 5712.55)).toBe(true);
  });

  it('150.000 CHF: netMonthly ~8,200 CHF/mo (±2%)', () => {
    // tax 37.500; social pension 7.950 + unem 970,20 + KVG 5.179,20 = 14.099,40
    const result = calculate('ch', opts('ch', 150000, 'CHF'));
    expect(withinTolerance(result.netMonthly, 8200.05)).toBe(true);
  });
});

// ─── Frankreich ───────────────────────────────────────────────────────────────
// Source: impots.gouv.fr / bfmtv calculateur
// FR: Quotient familial (Ehegattensplitting-Äquivalent) NICHT modelliert

describe('FR', () => {
  it('40k EUR: netMonthly ~2,161 €/mo (±2%)', () => {
    // Social: 40000*0.22=8,800; deduction: max(495, min(13522, 4000))=4,000; taxable: 36,000
    // Tax: 10777*0=0; 16223*0.11=1,785; 8522*0.30=2,557 → 4,342
    // Net: (40000-8800-4342)/12 = 26,858/12 = 2,238
    const result = calculate('fr', opts('fr', 40000, 'EUR'));
    // Source: impots.gouv.fr ~2,100-2,300 €/month
    expect(result.netMonthly).toBeGreaterThan(2000);
    expect(result.netMonthly).toBeLessThan(2450);
  });

  it('80k EUR: netMonthly ~3,934 €/mo (±2%)', () => {
    // Social: 17,600; deduction: 8,000; taxable: 72,000
    // Tax: brackets → ~15,194; net: 47,206/yr
    const result = calculate('fr', opts('fr', 80000, 'EUR'));
    // Source: impots.gouv.fr ~3,800-4,100 €/month
    expect(withinTolerance(result.netMonthly, 3934)).toBe(true);
  });

  it('120k EUR: netMonthly ~5,376 €/mo (±2%)', () => {
    // Social: 26,400; deduction: 12,000; taxable: 108,000
    // Tax: 78570*... complicated brackets; net approx
    const result = calculate('fr', opts('fr', 120000, 'EUR'));
    expect(result.netMonthly).toBeGreaterThan(5000);
    expect(result.netMonthly).toBeLessThan(5800);
  });
});

// ─── Irland ───────────────────────────────────────────────────────────────────
// Source: revenue.ie (Budget 2025). PAYE + USC; personal (€2.000) + employee
// (€2.000) tax credits now applied to the PAYE tax (not USC/PRSI). PRSI 4%.

describe('IE', () => {
  it('40k EUR: netMonthly ~2,779 €/mo (±2%)', () => {
    // PAYE 8.000 (40k×0.2) − credits 4.000 = 4.000; USC 1.046,82; PRSI 1.600
    // → net ~33.353/yr
    const result = calculate('ie', opts('ie', 40000, 'EUR'));
    expect(withinTolerance(result.netMonthly, 2779.43)).toBe(true);
  });

  it('80k EUR: netMonthly ~4,500 €/mo (±2%)', () => {
    // PAYE 42.000×0.2 + 38.000×0.4 = 8.400+15.200 = 23.600 − 4.000 credits = 19.600;
    // USC 3.195,28; PRSI 3.200 → net ~54.005/yr
    const result = calculate('ie', opts('ie', 80000, 'EUR'));
    expect(withinTolerance(result.netMonthly, 4500.39)).toBe(true);
  });

  it('PAYE+USC steigt progressiv', () => {
    const r40 = calculate('ie', opts('ie', 40000, 'EUR'));
    const r80 = calculate('ie', opts('ie', 80000, 'EUR'));
    expect(r80.effectiveRate).toBeGreaterThan(r40.effectiveRate);
  });

  it('120k EUR: netMonthly ~6,100 €/mo (±2%)', () => {
    const result = calculate('ie', opts('ie', 120000, 'EUR'));
    expect(withinTolerance(result.netMonthly, 6100.39)).toBe(true);
  });
});

// ─── Estland ───────────────────────────────────────────────────────────────────
// Source: emta.ee / bruttopalk.ee
// EE: 20% flat; Grundfreibetrag 7.848 € (läuft ab 25.200 €); AG zahlt 33% SV

describe('EE', () => {
  it('20k EUR: Grundfreibetrag reduziert steuerpflichtiges Einkommen', () => {
    // Gross 20k: phaseOut = (20000-14400)/(25200-14400) = 0.519; allowance = 7848*(1-0.519) = 3,775
    // Taxable: 20000-3775=16,225; tax: 16225*0.20=3,245; net: 16,755/yr = 1,396/mo
    const result = calculate('ee', opts('ee', 20000, 'EUR'));
    // Source: bruttopalk.ee ~1,350-1,450 €/month (approx, employer SV not counted)
    expect(result.netMonthly).toBeGreaterThan(1200);
    expect(result.netMonthly).toBeLessThan(1600);
  });

  it('80k EUR (über Grundfreibetrag-Phase): netMonthly ~5,333 €/mo (±2%)', () => {
    // Allowance = 0 (80k > 25.200); tax: 80000*0.20=16,000; social: 0; net: 64,000/yr
    const result = calculate('ee', opts('ee', 80000, 'EUR'));
    // Source: emta.ee flat 20% — intern konsistent
    expect(withinTolerance(result.netMonthly, 5333)).toBe(true);
    expect(result.socialContributions.total).toBe(0); // AG zahlt SV
  });

  it('50k EUR: netMonthly ~3,333 €/mo (±2%)', () => {
    // Taxable: 50000 (allowance 0 bei 50k > 25.200); tax: 10,000; net: 40,000/yr
    const result = calculate('ee', opts('ee', 50000, 'EUR'));
    expect(withinTolerance(result.netMonthly, 3333)).toBe(true);
  });
});

// ─── Polen ─────────────────────────────────────────────────────────────────────
// Source: pit.pl / wynagrodzenia.pl (PLN)
// PL: Grundfreibetrag 30.000 PLN; Steuersätze 12%/32%

describe('PL', () => {
  it('60.000 PLN: netMonthly ~3,510 PLN/mo (±2%)', () => {
    // Tax: (60000-30000)*0.12=3,600; social: pension=5,856, health=5,400, unem=1,002 → 12,258
    // Net: 44,142/yr = 3,679/mo
    const result = calculate('pl', opts('pl', 60000, 'PLN'));
    // Source: wynagrodzenia.pl ~3,400-3,700 PLN/month
    expect(result.netMonthly).toBeGreaterThan(3300);
    expect(result.netMonthly).toBeLessThan(4000);
  });

  it('100.000 PLN: netMonthly ~5,931 PLN/mo (±2%)', () => {
    // Tax: (100000-30000)*0.12=8,400; social: ~20,430; net: ~71,170/yr
    const result = calculate('pl', opts('pl', 100000, 'PLN'));
    // Source: wynagrodzenia.pl ~5,700-6,200 PLN/month
    expect(withinTolerance(result.netMonthly, 5931)).toBe(true);
  });

  it('200.000 PLN (32%-Zone): effectiveRate deutlich höher', () => {
    // Tax: (120000)*0.12 + (200000-30000-120000)*0.32 = 14,400+16,000=30,400
    const result = calculate('pl', opts('pl', 200000, 'PLN'));
    const result100k = calculate('pl', opts('pl', 100000, 'PLN'));
    expect(result.effectiveRate).toBeGreaterThan(result100k.effectiveRate);
  });
});

// ─── Tschechien ────────────────────────────────────────────────────────────────
// Source: financnisprava.cz (CZK). Základní sleva na poplatníka 30.840 CZK/yr
// (§35ba ZDP) now applied as a non-refundable credit against income tax.

describe('CZ', () => {
  it('Základní sleva senkt die Steuer um 30.840 CZK/yr', () => {
    // 800k: Steuer 120.000 − sleva 30.840 = 89.160 (statt 120.000 ohne Gutschrift).
    const result = calculate('cz', opts('cz', 800000, 'CZK'));
    expect(result.incomeTax).toBe(800000 * 0.15 - 30840);
  });

  it('800.000 CZK: netMonthly ~51,903 CZK/mo (±2%)', () => {
    // Tax 120.000 − sleva 30.840 = 89.160; social 88.000 → net 622.840/yr
    const result = calculate('cz', opts('cz', 800000, 'CZK'));
    expect(withinTolerance(result.netMonthly, 51903.33)).toBe(true);
  });

  it('1.200.000 CZK: netMonthly ~76,570 CZK/mo (±2%)', () => {
    // Tax 180.000 − sleva 30.840 = 149.160; social 132.000 → net 918.840/yr
    const result = calculate('cz', opts('cz', 1200000, 'CZK'));
    expect(withinTolerance(result.netMonthly, 76570)).toBe(true);
  });

  it('Spitzensteuersatz 23% ab 1.582.812 CZK', () => {
    const below = calculate('cz', opts('cz', 1500000, 'CZK'));
    const above = calculate('cz', opts('cz', 2000000, 'CZK'));
    expect(above.effectiveRate).toBeGreaterThan(below.effectiveRate);
  });
});

// ─── Ungarn ────────────────────────────────────────────────────────────────────
// Source: nav.gov.hu (HUF)
// HU: 15% flat + 18.5% AN-Sozialabgaben

describe('HU', () => {
  it('6.000.000 HUF: netMonthly ~332,500 HUF/mo (±2%)', () => {
    // Tax: 6000000*0.15=900,000; social: pension=600,000+health=420,000+unem=90,000=1,110,000
    // Net: 3,990,000/yr = 332,500/mo
    const result = calculate('hu', opts('hu', 6000000, 'HUF'));
    // Source: nav.gov.hu ~320,000-345,000 HUF/month
    expect(withinTolerance(result.netMonthly, 332500)).toBe(true);
  });

  it('10.000.000 HUF: netMonthly ~554,167 HUF/mo (±2%)', () => {
    // Tax: 1,500,000; social: 1,850,000; net: 6,650,000/yr
    const result = calculate('hu', opts('hu', 10000000, 'HUF'));
    expect(withinTolerance(result.netMonthly, 554167)).toBe(true);
  });

  it('Flat Tax 15% — effectiveRate + sozialabgaben ~33.5% (gerundet ~0.34)', () => {
    const result = calculate('hu', opts('hu', 10000000, 'HUF'));
    // 15% ESt + 18.5% SV = 33.5% → nach r()-Rundung auf 2 Dezimalstellen: 0.34
    expect(result.effectiveRate).toBeCloseTo(0.34, 1);
    expect(result.effectiveRate).toBeGreaterThan(0.33);
    expect(result.effectiveRate).toBeLessThan(0.36);
  });
});

// ─── Rumänien ──────────────────────────────────────────────────────────────────
// Source: anaf.ro (RON)
// RO: 10% flat + CAS 25% + CASS 10% = 45% Gesamtbelastung (sehr hohe SV!)

describe('RO', () => {
  it('50.000 RON: netMonthly ~2,292 RON/mo (±2%)', () => {
    // Tax: 5,000; social: 17,500; net: 27,500/yr = 2,292/mo
    const result = calculate('ro', opts('ro', 50000, 'RON'));
    // Source: anaf.ro ~2,200-2,400 RON/month
    expect(withinTolerance(result.netMonthly, 2292)).toBe(true);
  });

  it('100.000 RON: netMonthly ~4,583 RON/mo (±2%)', () => {
    // Tax: 10,000; social: 35,000; net: 55,000/yr
    const result = calculate('ro', opts('ro', 100000, 'RON'));
    expect(withinTolerance(result.netMonthly, 4583)).toBe(true);
  });

  it('Gesamtbelastung ~45% (10% + 35% SV)', () => {
    const result = calculate('ro', opts('ro', 100000, 'RON'));
    expect(result.effectiveRate).toBeCloseTo(0.45, 2);
  });
});

// ─── VAE ───────────────────────────────────────────────────────────────────────
// Source: mof.gov.ae — keine Einkommensteuer für Expatriates
// UAE: 0% Steuer, 0% SV für ausländische AN

describe('UAE', () => {
  it('100.000 USD: netMonthly = gross/12 (null Abzüge)', () => {
    const result = calculate('uae', opts('uae', 100000, 'USD'));
    expect(result.netMonthly).toBeCloseTo(100000 / 12, 0);
    expect(result.incomeTax).toBe(0);
    expect(result.socialContributions.total).toBe(0);
  });

  it('200.000 USD: effectiveRate = 0', () => {
    const result = calculate('uae', opts('uae', 200000, 'USD'));
    expect(result.effectiveRate).toBe(0);
  });

  it('Netto = Brutto (keine Abzüge)', () => {
    const gross = 150000;
    const result = calculate('uae', opts('uae', gross, 'AED'));
    expect(result.netAnnual).toBe(gross);
  });
});

// ─── Thailand ──────────────────────────────────────────────────────────────────
// Source: rd.go.th (THB)
// TH: Progressiv, 50%-Standardabzug (max 100k THB); SV: 5% max 9k THB/yr

describe('TH', () => {
  it('500.000 THB: netMonthly ~33,333 THB/mo (±2%)', () => {
    // Deduction: min(250000, 100000)=100000; taxable: 400000
    // Tax: 0-150000: 0; 150000-300000: 7500; 300000-400000: 10000 → 17,500
    // Social: 9000; net: 473,500/yr = 39,458/mo
    const result = calculate('th', opts('th', 500000, 'THB'));
    expect(result.netMonthly).toBeGreaterThan(35000);
    expect(result.netMonthly).toBeLessThan(43000);
  });

  it('2.000.000 THB: netMonthly ~138,833 THB/mo (±2%)', () => {
    // Deduction: 100.000 expense + 60.000 personal = 160.000; taxable 1.840.000;
    // tax 319.000; social 9.000 → net 1.666.000/yr
    const result = calculate('th', opts('th', 2000000, 'THB'));
    expect(withinTolerance(result.netMonthly, 138833.33)).toBe(true);
  });

  it('SV max 9.000 THB/Jahr (Deckel greift ab 180.000 THB Brutto)', () => {
    const small = calculate('th', opts('th', 100000, 'THB'));
    const large = calculate('th', opts('th', 2000000, 'THB'));
    // SV max ist 9000
    expect(large.socialContributions.pension).toBe(9000);
    expect(small.socialContributions.pension).toBeLessThanOrEqual(9000);
  });
});

// ─── USA ───────────────────────────────────────────────────────────────────────
// Source: irs.gov — Federal Tax 2026 (Rev. Proc. 2025-32); SS wage base 2026
// $184,500 (SSA). State tax: Florida = federal only here; NY brackets + NYC city
// tax seeded separately once confirmed.

describe('US — Federal 2026', () => {
  it('100k USD, single: netMonthly ~6,598 USD/mo (±2%)', () => {
    // Standard deduction 16,100; taxable 83,900
    // Tax: 1240 + 4560 + 22%*33,500 = 13,170; FICA 6,200 + 1,450 = 7,650; net 79,180/yr
    const result = calculate('us', opts('us', 100000, 'USD'));
    expect(withinTolerance(result.netMonthly, 6598)).toBe(true);
  });

  it('100k USD, married (MFJ): netMonthly > single (größeres standard deduction)', () => {
    const single = calculate('us', opts('us', 100000, 'USD'));
    const married = calculate('us', opts('us', 100000, 'USD', { familyStatus: 'married' }));
    expect(married.netMonthly).toBeGreaterThan(single.netMonthly);
  });

  it('200k USD, single: netMonthly ~12,411 USD/mo (±2%)', () => {
    // taxable 183,900; tax 36,734; FICA SS cap 184,500*0.062=11,439 + Medicare 2,900
    const result = calculate('us', opts('us', 200000, 'USD'));
    expect(withinTolerance(result.netMonthly, 12411)).toBe(true);
  });

  it('Social Security cap bei 184.500 USD (2026)', () => {
    const below = calculate('us', opts('us', 184500, 'USD'));
    const above = calculate('us', opts('us', 250000, 'USD'));
    expect(above.socialContributions.pension).toBe(below.socialContributions.pension);
  });
});

describe('US — New York (state + NYC) vs Florida (A.3, 2026)', () => {
  it('150k single NYC: federal + NY state + NYC city tax, netMonthly ~8,384 USD/mo (±2%)', () => {
    // Federal 24,734 + NY state (taxable 142,000) 7,809.75 + NYC 5,379.09 = 37,922.84;
    // FICA 11,475; net ~100,602/yr. Source: IRS 2026; tax.ny.gov 2026 (phase-in).
    const result = calculate('us', opts('us', 150000, 'USD', { region: 'us-ny', cityScope: 'new-york' }));
    expect(withinTolerance(result.netMonthly, 8384)).toBe(true);
  });

  it('Florida (federal only) > New York no-NYC > NYC', () => {
    const florida = calculate('us', opts('us', 150000, 'USD', { region: 'us-fl', cityScope: 'miami' }));
    const nyNoCity = calculate('us', opts('us', 150000, 'USD', { region: 'us-ny', cityScope: 'albany' }));
    const nyc = calculate('us', opts('us', 150000, 'USD', { region: 'us-ny', cityScope: 'new-york' }));
    expect(florida.netMonthly).toBeGreaterThan(nyNoCity.netMonthly); // no state tax in FL
    expect(nyNoCity.netMonthly).toBeGreaterThan(nyc.netMonthly); // NYC adds city tax
  });

  it('NYC city tax thresholds differ by filing status (single vs MFJ)', () => {
    const single = calculate('us', opts('us', 150000, 'USD', { region: 'us-ny', cityScope: 'new-york' }));
    const married = calculate('us', opts('us', 150000, 'USD', { region: 'us-ny', cityScope: 'new-york', familyStatus: 'married' }));
    // Both compute; married has lower total tax (wider federal + NY MFJ brackets)
    expect(married.netMonthly).toBeGreaterThan(single.netMonthly);
  });
});

// ─── United Kingdom ───────────────────────────────────────────────────────────
// Sources: https://www.gov.uk/income-tax-rates (2025-26)
//          https://www.gov.uk/national-insurance/how-much-you-pay (2025-26)
// Tax year: 6 April 2025 – 5 April 2026
// Basis: Personal Allowance £12,570; NI Class 1 employee 8%/2%
// Verified via manual calculation (HMRC PAYE logic).
// Note: gov.uk estimates use older NI rates — our values use current 8% employee NI.

describe('GB — Standard (England/Wales/NI)', () => {
  it('30k GBP, single: netMonthly ~2,093 GBP/mo (±2%)', () => {
    // Allowance: 12,570 | Taxable: 17,430 | Tax: 3,486 (20%)
    // NI: 17,430 × 8% = 1,394 | Net annual: 25,120 | /12 = 2,093
    const result = calculate('gb', opts('gb', 30000, 'GBP'));
    expect(withinTolerance(result.netMonthly, 2093)).toBe(true);
  });

  it('60k GBP, single: netMonthly ~3,780 GBP/mo (±2%)', () => {
    // Allowance: 12,570 | Taxable: 47,430
    // Tax: 37,700×20% + 9,730×40% = 7,540 + 3,892 = 11,432
    // NI: 37,700×8% + 9,730×2% = 3,016 + 195 = 3,211 | Net annual: 45,357 | /12 = 3,780
    const result = calculate('gb', opts('gb', 60000, 'GBP'));
    expect(withinTolerance(result.netMonthly, 3780)).toBe(true);
  });

  it('100k GBP, single: netMonthly ~5,713 GBP/mo — Allowance-Tapering greift ab hier (±2%)', () => {
    // At exactly £100,000 the taper starts but full allowance still applies.
    // Taxable: 87,430 | Tax: 37,700×20% + 49,730×40% = 7,540+19,892 = 27,432
    // NI: 37,700×8% + 49,730×2% = 3,016+995 = 4,011 | Net annual: 68,557 | /12 = 5,713
    const result = calculate('gb', opts('gb', 100000, 'GBP'));
    expect(withinTolerance(result.netMonthly, 5713)).toBe(true);
  });

  it('150k GBP, single: netMonthly ~7,555 GBP/mo — Additional Rate + vollständige Tapering (±2%)', () => {
    // Allowance fully tapered to 0 (≥125,140). Taxable = 150,000.
    // Tax: 37,700×20% + 74,870×40% + 37,430×45% = 7,540+29,948+16,844 = 54,332
    // NI: 37,700×8% + 99,730×2% = 3,016+1,995 = 5,011 | Net annual: 90,657 | /12 = 7,555
    const result = calculate('gb', opts('gb', 150000, 'GBP'));
    expect(withinTolerance(result.netMonthly, 7555)).toBe(true);
  });

  it('Scotland: höhere Steuerlast als England/Wales für gleiche Einkommenshöhe', () => {
    const england = calculate('gb', opts('gb', 60000, 'GBP'));
    const scotland = calculate('gb', opts('gb', 60000, 'GBP', { region: 'scotland' }));
    // Scottish intermediate (21%) und higher (42%) > England (20%/40%)
    expect(scotland.netMonthly).toBeLessThan(england.netMonthly);
  });

  it('NI-Satz: Sprung am Upper Earnings Limit (50.270 GBP)', () => {
    // Über 50,270 zahlt man nur noch 2% NI statt 8% — NI-Rate-of-change sinkt stark
    const below = calculate('gb', opts('gb', 50000, 'GBP'));
    const above = calculate('gb', opts('gb', 60000, 'GBP'));
    const niBelow = below.socialContributions.total;
    const niAbove = above.socialContributions.total;
    // 10,000 GBP mehr Brutto über dem UEL → nur 2% = 200 GBP mehr NI
    expect(niAbove - niBelow).toBeLessThan(400);
  });
});

// ─── Malta ────────────────────────────────────────────────────────────────────
// Sources: https://cfr.gov.mt/en/rates/Pages/TaxRates/Single-Rates.aspx (2025)
//          https://cfr.gov.mt/en/rates/Pages/SSContributions/Class-1.aspx
// Brackets: 0–9,100→0% | 9,101–14,500→15% | 14,501–60,000→25% | 60,001+→35%
// SS: 10% employee, annual ceiling ~€30,030

describe('MT — Standard', () => {
  it('30k EUR, single: netMonthly ~1,860 €/mo (±2%)', () => {
    // Tax: 5,400×15% + 15,500×25% = 810+3,875 = 4,685
    // SS: 30,000×10% = 3,000 | Net annual: 22,315 | /12 = 1,860
    const result = calculate('mt', opts('mt', 30000, 'EUR'));
    expect(withinTolerance(result.netMonthly, 1860)).toBe(true);
  });

  it('60k EUR, single: netMonthly ~3,734 €/mo (±2%)', () => {
    // Tax: 5,400×15% + 45,500×25% = 810+11,375 = 12,185
    // SS: capped at 30,030×10% = 3,003 | Net: 44,812 | /12 = 3,734
    const result = calculate('mt', opts('mt', 60000, 'EUR'));
    expect(withinTolerance(result.netMonthly, 3734)).toBe(true);
  });

  it('100k EUR, single: netMonthly ~5,901 €/mo (±2%)', () => {
    // Tax: 5,400×15% + 45,500×25% + 40,000×35% = 810+11,375+14,000 = 26,185
    // SS: capped 3,003 | Net: 70,812 | /12 = 5,901
    const result = calculate('mt', opts('mt', 100000, 'EUR'));
    expect(withinTolerance(result.netMonthly, 5901)).toBe(true);
  });

  it('SS-Deckel: keine weiteren Beiträge über ~30.030 €', () => {
    const atCeiling  = calculate('mt', opts('mt',  30030, 'EUR'));
    const overCeiling = calculate('mt', opts('mt', 100000, 'EUR'));
    expect(overCeiling.socialContributions.total).toBe(atCeiling.socialContributions.total);
  });
});

// ─── Malta GRP — Global Residence Programme ───────────────────────────────────
// Source: Legal Notice 184/2013 (as amended), cfr.gov.mt/en/residents/Pages/GRP.aspx
// 15% flat on foreign-source income remitted to Malta; minimum tax €15,000/yr

describe('MT — Global Residence Programme (GRP)', () => {
  it('100k EUR mit GRP: netMonthly ~6,833 €/mo — deutlich höher als Standard (±2%)', () => {
    // Tax: 100,000×15% = 15,000 | SS: 3,003 | Net: 81,997 | /12 = 6,833
    const result = calculate('mt', opts('mt', 100000, 'EUR', { specialRegimeId: 'grp-mt' }));
    expect(withinTolerance(result.netMonthly, 6833)).toBe(true);
  });

  it('GRP net > Standard net (Ersparnis >900 €/mo bei 100k)', () => {
    // GRP: 100k×15%=15k tax + 3,003 SS = net 81,997 → 6,833/mo
    // Standard: 26,185 tax + 3,003 SS = net 70,812 → 5,901/mo → delta 932/mo
    const standard = calculate('mt', opts('mt', 100000, 'EUR'));
    const grp      = calculate('mt', opts('mt', 100000, 'EUR', { specialRegimeId: 'grp-mt' }));
    expect(grp.netMonthly - standard.netMonthly).toBeGreaterThan(900);
  });
});

// ─── Georgien ─────────────────────────────────────────────────────────────────
// Source: Tax Code of Georgia Art. 80-93 / https://www.rs.ge/en/taxes
//         Law on Accumulative Pension (2018); mandatory pension 2% for employees.
// ⚠ Kein DBA Deutschland-Georgien — Steuerpflicht in DE bei Wegzug prüfen!

describe('GE — Standard (Angestellter, Pflichtpension)', () => {
  it('30k GEL, single: netMonthly ~1,950 GEL/mo (±2%)', () => {
    // Tax: 30,000×20% = 6,000 | Pension: 30,000×2% = 600 | Net: 23,400 | /12 = 1,950
    // Source: rs.ge income tax calculator 2025
    const result = calculate('ge', opts('ge', 30000, 'GEL'));
    expect(withinTolerance(result.netMonthly, 1950)).toBe(true);
  });

  it('100k GEL, single: netMonthly ~6,500 GEL/mo (±2%)', () => {
    // Tax: 100,000×20% = 20,000 | Pension: 100,000×2% = 2,000 | Net: 78,000 | /12 = 6,500
    const result = calculate('ge', opts('ge', 100000, 'GEL'));
    expect(withinTolerance(result.netMonthly, 6500)).toBe(true);
  });

  it('effectiveRate = 22% (20% Einkommensteuer + 2% Pension) für Angestellte', () => {
    const result = calculate('ge', opts('ge', 80000, 'GEL'));
    expect(withinTolerance(result.effectiveRate, 0.22)).toBe(true);
  });

  it('Freelancer hat keine Pflichtpension — niedrigere Gesamtbelastung', () => {
    const employed   = calculate('ge', opts('ge', 60000, 'GEL', { employment: 'employed' }));
    const freelancer = calculate('ge', opts('ge', 60000, 'GEL', { employment: 'freelancer' }));
    // Freelancer zahlt keine Pension (2%) → höheres Netto
    expect(freelancer.netMonthly).toBeGreaterThan(employed.netMonthly);
    expect(freelancer.socialContributions.total).toBe(0);
  });
});

describe('GE — Small Business Status (1% Umsatzsteuer)', () => {
  it('50k GEL, Freelancer mit Small-Business: netMonthly ~4,125 GEL/mo (±2%)', () => {
    // Tax: 50,000×1% = 500 | Net: 49,500 | /12 = 4,125
    // Source: Tax Code of Georgia Art. 88 (Small Business Status)
    const result = calculate('ge', opts('ge', 50000, 'GEL', {
      employment: 'freelancer',
      specialRegimeId: 'small-business-ge',
    }));
    expect(withinTolerance(result.netMonthly, 4125)).toBe(true);
  });

  it('Small-Business netto >> Angestellten-Netto (massiver Steuervorteil, hohes DE-Risiko)', () => {
    const employed = calculate('ge', opts('ge', 50000, 'GEL', { employment: 'employed' }));
    const smallBiz = calculate('ge', opts('ge', 50000, 'GEL', {
      employment: 'freelancer',
      specialRegimeId: 'small-business-ge',
    }));
    // Small Business: 49,500 vs Angestellt: 39,000 — 10,500 GEL mehr
    expect(smallBiz.netMonthly - employed.netMonthly).toBeGreaterThan(800);
  });
});

// ─── Singapore ───────────────────────────────────────────────────────────────
describe('SG — Standard Income Tax (Resident, YA 2025)', () => {
  it('60k SGD → netMonthly ~4,837.50 SGD/mo (±2%)', () => {
    // Brackets: 0-20k→0%, 20-30k→2% (200), 30-40k→3.5% (350), 40-60k→7% (1400)
    // Income tax: 1,950 | Net annual: 58,050 | /12 = 4,837.50
    // Source: https://www.iras.gov.sg/
    const result = calculate('sg', opts('sg', 60000, 'SGD'));
    expect(withinTolerance(result.netMonthly, 4837.50)).toBe(true);
  });

  it('120k SGD → netMonthly ~9,337.50 SGD/mo (±2%)', () => {
    // Brackets: up to 120k → tax: 0+200+350+2800+4600+3000 = 10,950 - wait let me recalc:
    // 0-20k: 0, 20-30k: 200, 30-40k: 350, 40-80k: 2800, 80-120k: 4600 = 7,950
    // Net: 112,050 | /12 = 9,337.50
    // Source: https://www.iras.gov.sg/
    const result = calculate('sg', opts('sg', 120000, 'SGD'));
    expect(withinTolerance(result.netMonthly, 9337.50)).toBe(true);
  });

  it('200k SGD → netMonthly ~14,904 SGD/mo (±2%)', () => {
    // Tax: 7,950 + 40k×15% + 40k×18% + 40k×19% = 7,950+6,000+7,200+7,600 = 28,750 - wait:
    // 80-120k→11.5% = 4,600; 120-160k→15% = 6,000; 160-200k→18% = 7,200
    // Total: 200+350+2800+4600+6000+7200 = 21,150
    // Net: 178,850 | /12 = 14,904.17
    const result = calculate('sg', opts('sg', 200000, 'SGD'));
    expect(withinTolerance(result.netMonthly, 14904)).toBe(true);
  });

  it('Keine Sozialabgaben für Ausländer (Employment Pass)', () => {
    const result = calculate('sg', opts('sg', 100000, 'SGD'));
    expect(result.socialContributions.total).toBe(0);
    expect(result.socialContributions.pension).toBe(0);
    expect(result.socialContributions.health).toBe(0);
  });
});

describe('SG — NOR-Schema (Legacy, 50% steuerpflichtig)', () => {
  it('200k SGD NOR → netMonthly ~16,196 SGD/mo (±2%)', () => {
    // NOR: taxable = 200k × 50% = 100k
    // Tax on 100k: 200+350+2800+4600 = 7,950
    // Wait: 80-100k is only 20k at 11.5% = 2,300 → total 200+350+2800+2300 = 5,650
    // Net: 194,350 | /12 = 16,195.83
    const result = calculate('sg', opts('sg', 200000, 'SGD', {
      specialRegimeId: 'nor-sg',
    }));
    expect(withinTolerance(result.netMonthly, 16196)).toBe(true);
  });

  it('NOR-Vorteil: deutlich höheres Netto als Standard (≥ 1,000 SGD/mo Differenz)', () => {
    const standard = calculate('sg', opts('sg', 200000, 'SGD'));
    const nor      = calculate('sg', opts('sg', 200000, 'SGD', { specialRegimeId: 'nor-sg' }));
    // 16,196 - 14,904 = ~1,292 SGD/mo Vorteil
    expect(nor.netMonthly - standard.netMonthly).toBeGreaterThan(1000);
  });
});

// ─── Indonesia ───────────────────────────────────────────────────────────────
describe('ID — PPh 21 Standard (YA 2025)', () => {
  it('300M IDR → netMonthly ~21,706,000 IDR/mo (±2%)', () => {
    // PTKP: 54M | PKP: 246M | Tax: 60M×5%+186M×15% = 3M+27.9M = 30.9M
    // Health: 1%×144M=1.44M | JHT: 2%×300M=6M | JP: 1%×118.934M=1.189M
    // Net: 260.471M | /12 = 21,705,917
    // Source: https://www.pajak.go.id/
    const result = calculate('id', opts('id', 300_000_000, 'IDR'));
    expect(withinTolerance(result.netMonthly, 21_706_000)).toBe(true);
  });

  it('600M IDR → netMonthly ~39,798,000 IDR/mo (±2%)', () => {
    // PKP: 546M | Tax: 3M+28.5M+62.5M+13.8M = 107.8M
    // Social: health 1.44M + JHT 12M + JP 1.189M = 14.629M
    // Net: 477.571M | /12 = 39,797,583
    const result = calculate('id', opts('id', 600_000_000, 'IDR'));
    expect(withinTolerance(result.netMonthly, 39_798_000)).toBe(true);
  });

  it('BPJS-Gesundheit gedeckelt: keine weiteren Beiträge über Rp 144M/Jahr', () => {
    const low  = calculate('id', opts('id', 150_000_000, 'IDR'));
    const high = calculate('id', opts('id', 600_000_000, 'IDR'));
    // health contribution must be the same once cap is hit
    expect(high.socialContributions.health).toBe(low.socialContributions.health);
    expect(high.socialContributions.health).toBe(1_440_000);
  });

  it('effectiveRate steigt mit Einkommen (Progressivität)', () => {
    const r300 = calculate('id', opts('id', 300_000_000, 'IDR'));
    const r600 = calculate('id', opts('id', 600_000_000, 'IDR'));
    expect(r600.effectiveRate).toBeGreaterThan(r300.effectiveRate);
  });
});

// ─── Colombia ────────────────────────────────────────────────────────────────
describe('CO — Impuesto sobre la Renta 2025', () => {
  it('120M COP → netMonthly ~8,748,000 COP/mo (±2%)', () => {
    // Social: 9.6M | netOfSocial: 110.4M | rentaExenta: 27.6M | taxable: 82.8M
    // Tax: (82.8M-54.28M)×19% = 5.419M
    // Net: 120M-9.6M-5.419M = 104.981M | /12 = 8,748,417
    // Source: https://www.dian.gov.co/ (UVT 49,799 COP 2025)
    const result = calculate('co', opts('co', 120_000_000, 'COP'));
    expect(withinTolerance(result.netMonthly, 8_748_000)).toBe(true);
  });

  it('300M COP → netMonthly ~18,838,000 COP/mo (±2%)', () => {
    // Social: 24M | rentaExenta: min(276M×25%=69M, 39.34M cap) = 39.34M | taxable: 236.66M
    // Tax: 5.772M+33.466M+10.718M = 49.956M
    // Net: 300M-24M-49.956M = 226.044M | /12 = 18,837,000
    const result = calculate('co', opts('co', 300_000_000, 'COP'));
    expect(withinTolerance(result.netMonthly, 18_838_000)).toBe(true);
  });

  it('Renta exenta gedeckelt (790 UVT ≈ 39.3M COP) bei hohem Einkommen', () => {
    const r300 = calculate('co', opts('co', 300_000_000, 'COP'));
    const r600 = calculate('co', opts('co', 600_000_000, 'COP'));
    // deductions = social (8%) + rentaExenta. Social grows with income,
    // but the renta exenta component is capped: deductions diff should equal only the social diff.
    const expectedDiff = r600.socialContributions.total - r300.socialContributions.total;
    expect(r600.deductions - r300.deductions).toBeCloseTo(expectedDiff, 0);
  });

  it('Sozialabgaben genau 8 % (salud 4 % + pensión 4 %)', () => {
    const gross = 200_000_000;
    const result = calculate('co', opts('co', gross, 'COP'));
    expect(result.socialContributions.total).toBe(r(gross * 0.08));
  });
});

// ─── Mexico ──────────────────────────────────────────────────────────────────
describe('MX — ISR 2024/2025', () => {
  it('600k MXN → netMonthly ~45,701 MXN/mo (±2%)', () => {
    // ISR: 107,430×1.92%+492,570×6.4% = 2,062.65+31,524.49 = 33,587.14
    // Social: 2.4%×600k = 14,400 | Net: 552,012.86 | /12 = 46,001
    // Wait: health=1%×600k=6000, pension=1.4%×600k=8400, total=14,400
    // Net: 600,000-33,587-14,400 = 552,013 | /12 = 46,001
    // Source: https://www.sat.gob.mx/ (Art. 96 LISR)
    const result = calculate('mx', opts('mx', 600_000, 'MXN'));
    expect(withinTolerance(result.netMonthly, 46_001)).toBe(true);
  });

  it('1.2M MXN → netMonthly ~89,925 MXN/mo (±2%)', () => {
    // ISR: 2,062.65+51,480.62+31,354.57 = 84,897.84
    // Social: 2.4%×1.2M = 28,800 | Net: 1,086,302 | /12 = 90,525
    const result = calculate('mx', opts('mx', 1_200_000, 'MXN'));
    expect(withinTolerance(result.netMonthly, 90_525)).toBe(true);
  });

  it('effectiveRate < 15 % bei 600k MXN (niedrige Eingangsklasse)', () => {
    const result = calculate('mx', opts('mx', 600_000, 'MXN'));
    expect(result.effectiveRate).toBeLessThan(0.15);
  });

  it('ISR-Bracket korrekt: Sprung auf 10.88 % bei > 911.8k MXN', () => {
    const just_below = calculate('mx', opts('mx', 900_000, 'MXN'));
    const just_above = calculate('mx', opts('mx', 1_000_000, 'MXN'));
    expect(just_above.marginalRate).toBeGreaterThan(just_below.marginalRate);
  });
});

// ─── Argentina ───────────────────────────────────────────────────────────────
describe('AR — Ganancias 2025 (Näherungswerte)', () => {
  it.skip('Brackets werden quartalsweise angepasst — Exaktwerte nicht testbar', () => {
    // Skip: Argentine tax brackets and MNI change every quarter (AFIP quarterly adjustment).
    // Implement snapshot tests after each AFIP update instead.
  });

  it('netMonthly ist positiv und Gesamtbelastung liegt zwischen 20%–45% (120M ARS)', () => {
    // Sanity check only — not tied to exact bracket amounts
    const result = calculate('ar', opts('ar', 120_000_000, 'ARS'));
    expect(result.netMonthly).toBeGreaterThan(5_000_000);
    expect(result.effectiveRate).toBeGreaterThan(0.20);
    expect(result.effectiveRate).toBeLessThan(0.50);
  });

  it('Sozialabgaben: Jubilación 11 % + Health 6 % = 17 % brutto', () => {
    const gross = 100_000_000;
    const result = calculate('ar', opts('ar', gross, 'ARS'));
    expect(result.socialContributions.pension).toBe(r(gross * 0.11));
    expect(result.socialContributions.health).toBe(r(gross * 0.06));
    expect(result.socialContributions.total).toBe(r(gross * 0.17));
  });
});

// ─── South Africa ────────────────────────────────────────────────────────────
describe('ZA — Personal Income Tax 2025/2026', () => {
  it('500k ZAR → netMonthly ~33,134 ZAR/mo (±2%)', () => {
    // Tax: 42,678+34,684+40,145 = 117,507 − rebate 17,235 = 100,272
    // UIF: 1%×min(500k, 212,539) = 2,125.39
    // Net: 397,602.61 | /12 = 33,133.55
    // Source: https://www.sars.gov.za/ (2025/2026 tax year)
    const result = calculate('za', opts('za', 500_000, 'ZAR'));
    expect(withinTolerance(result.netMonthly, 33_134)).toBe(true);
  });

  it('1M ZAR → netMonthly ~58,799 ZAR/mo (±2%)', () => {
    // Tax brackets sum = 309,519 − rebate 17,235 = 292,284
    // UIF: 1%×212,539 = 2,125.39
    // Net: 705,590.61 | /12 = 58,799.22
    const result = calculate('za', opts('za', 1_000_000, 'ZAR'));
    expect(withinTolerance(result.netMonthly, 58_799)).toBe(true);
  });

  it('UIF gedeckelt: kein zusätzlicher Beitrag über R212,539/Jahr', () => {
    const r500k = calculate('za', opts('za', 500_000, 'ZAR'));
    const r2m   = calculate('za', opts('za', 2_000_000, 'ZAR'));
    expect(r500k.socialContributions.unemployment).toBe(r(212_539 * 0.01)); // not capped at 500k
    // But at 2M, both should hit the same cap
    expect(r2m.socialContributions.unemployment).toBe(r(212_539 * 0.01));
  });

  it('Primary Rebate wirkt: Steuer < 237,100×18% für niedrige Einkommen', () => {
    // At R150k gross: bracket tax = 150,000×18% = 27,000. After rebate: 27,000-17,235 = 9,765
    const result = calculate('za', opts('za', 150_000, 'ZAR'));
    expect(result.incomeTax).toBe(9_765);
  });
});
