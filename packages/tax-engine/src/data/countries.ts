import { TaxData } from '../types';

/**
 * Canonical tax tables (year 2025) — the single source of truth for the
 * engine's values. The DB seed imports these so that DB == engine, and unit
 * tests / the runtime fallback read them via `getDefaultTaxData()`.
 *
 * Values mirror the previously hardcoded module constants exactly. Formula and
 * approximation LOGIC (DE §32a polynomial, CH effective-rate, GB allowance
 * taper, EE allowance phase-out, AT Jahressechstel, …) stays in the country
 * modules; only the VALUES live here.
 *
 * Every entry is attributed to an official source via `sourceUrl`. Regional
 * scales, surcharges and fixed amounts (ES comunidades, IT addizionale, US
 * states, NYC city tax, DE Kirchensteuer, CH KVG premium) are added in a
 * dedicated step (fixes A.1–A.9) and seeded with their own sources.
 */

const YEAR = 2025;

// Official tax-authority sources (issuers of the figures below).
const SRC = {
  de: 'https://www.gesetze-im-internet.de/estg/__32a.html',
  de_social: 'https://www.bundesfinanzministerium.de/Content/DE/Standardartikel/Themen/Steuern/Sozialversicherungsrechengroessen-2025.html',
  at: 'https://www.bmf.gv.at/themen/steuern/arbeitnehmerinnen/lohnsteuertarif.html',
  ch: 'https://www.estv.admin.ch/',
  ch_ahv: 'https://www.ahv-iv.ch/de/Merkblätter-Formulare/Beiträge',
  es: 'https://sede.agenciatributaria.gob.es/',
  nl: 'https://www.belastingdienst.nl/',
  pt: 'https://www.portaldasfinancas.gov.pt/',
  fr: 'https://www.impots.gouv.fr/particulier/calcul-de-limpot-sur-le-revenu',
  it: 'https://www.agenziaentrate.gov.it/',
  ie: 'https://www.revenue.ie/en/jobs-and-pensions/calculating-your-income-tax/index.aspx',
  ee: 'https://www.emta.ee/',
  pl: 'https://www.podatki.gov.pl/',
  cz: 'https://www.financnisprava.cz/',
  hu: 'https://nav.gov.hu/',
  ro: 'https://www.anaf.ro/',
  uae: 'https://tax.gov.ae/',
  th: 'https://www.rd.go.th/english/',
  gb: 'https://www.gov.uk/income-tax-rates',
  gb_ni: 'https://www.gov.uk/national-insurance/how-much-you-pay',
  gb_scot: 'https://www.gov.scot/news/income-tax-rates-and-bands-2025-26/',
  us: 'https://www.irs.gov/filing/federal-income-tax-rates-and-brackets',
  us_fica: 'https://www.ssa.gov/oact/cola/cbb.html',
  mt: 'https://cfr.gov.mt/en/rates/Pages/TaxRates/Single-Rates.aspx',
  ge: 'https://www.rs.ge/en/taxes',
  sg: 'https://www.iras.gov.sg/taxes/individual-income-tax/basics-of-individual-income-tax/tax-residency-and-tax-rates/individual-income-tax-rates',
  id: 'https://www.pajak.go.id/',
  co: 'https://www.dian.gov.co/',
  mx: 'https://www.sat.gob.mx/',
  ar: 'https://www.afip.gob.ar/',
  za: 'https://www.sars.gov.za/',
} as const;

const UVT = 49_799; // Colombia UVT 2025

export const DEFAULT_TAX_DATA: Record<string, TaxData> = {
  // ── Germany — §32a formula in code; values externalised ──────────────────
  de: {
    countryCode: 'de',
    year: 2026,
    brackets: [], // income tax computed by §32a polynomial 2026 (logic, in de.ts)
    social: [
      // BBG 2026: RV/AV 101.400 €, KV/PV 69.750 € (Bundesregierung/DRV)
      { type: 'pension', rate: 0.093, ceiling: 101400 },
      { type: 'unemployment', rate: 0.013, ceiling: 101400 },
      { type: 'health', rate: 0.0875, ceiling: 69750 }, // 7.3% + 1.45% (½ of 2.9% Zusatzbeitrag 2026)
      { type: 'care', rate: 0.018, ceiling: 69750 }, // mit Kindern (½ of 3.6%)
      { type: 'care_childless', rate: 0.024, ceiling: 69750 }, // 1.8% + 0.6% Zuschlag
    ],
    deductions: [
      { type: 'werbungskosten', amount: 1230 },
      { type: 'grundfreibetrag', amount: 12348 },
      { type: 'kinderfreibetrag', amount: 6828, condition: 'per_child' },
      { type: 'kindergeld_monthly', amount: 259, condition: 'per_child' },
    ],
    surcharges: [
      // Soli 2026: 5.5% of income tax above the Freigrenze; 11.9% Milderungszone
      // is a formula constant kept in de.ts.
      { type: 'soli', baseType: 'income_tax', rate: 0.055, allowance: 20350, variantKey: 'single' },
      { type: 'soli', baseType: 'income_tax', rate: 0.055, allowance: 40700, variantKey: 'married' },
      // Kirchensteuer: 8% of income tax in Bavaria & Baden-Württemberg, 9%
      // elsewhere. Only when churchMember. Sonderausgaben-Abzugsfähigkeit
      // deliberately omitted (see Anhang A).
      { type: 'church', baseType: 'income_tax', rate: 0.08, variantKey: '8' }, // BY, BW
      { type: 'church', baseType: 'income_tax', rate: 0.09, variantKey: '9' }, // übrige Bundesländer
    ],
    fixedAmounts: [],
  },

  // ── Austria 2026 — progressive scale (kalte-Progression adjusted +1.733%,
  // WKO/BMF); Jahressechstel logic in at.ts (A.8) ─────────────────────────
  at: {
    countryCode: 'at',
    year: 2026,
    brackets: [
      { from: 0, to: 13539, rate: 0.0 },
      { from: 13539, to: 21992, rate: 0.2 },
      { from: 21992, to: 36458, rate: 0.3 },
      { from: 36458, to: 70365, rate: 0.4 },
      { from: 70365, to: 104859, rate: 0.48 },
      { from: 104859, to: 1000000, rate: 0.5 },
      { from: 1000000, to: null, rate: 0.55 },
    ],
    social: [
      { type: 'pension', rate: 0.1025, ceiling: null },
      { type: 'health', rate: 0.0387, ceiling: null },
      { type: 'unemployment', rate: 0.03, ceiling: null },
      { type: 'care', rate: 0.01, ceiling: null }, // UV
    ],
    deductions: [
      // Jahressechstel (A.8): special-payment (13th/14th salary) parameters.
      { type: 'sonderzahlung_freigrenze', amount: 2570 }, // below this → no tax
      { type: 'sonderzahlung_sv_reduction', percentage: 0.01 }, // SV ~1% lower on Sonderzahlungen
    ],
    surcharges: [
      // Sonderzahlungen scale: first €620 free, 6% on the next €24,380, then 27%.
      // The 35.75% / 50% top bands for very high special payments are
      // approximated as 27% (see Anhang A — bewusste Restungenauigkeiten).
      {
        type: 'sonderzahlung',
        baseType: 'taxable_income',
        brackets: [
          { from: 0, to: 620, rate: 0 },
          { from: 620, to: 25000, rate: 0.06 },
          { from: 25000, to: null, rate: 0.27 },
        ],
      },
    ],
    fixedAmounts: [],
  },

  // ── Switzerland — effective-rate approximation in code ───────────────────
  ch: {
    countryCode: 'ch',
    year: YEAR,
    brackets: [], // effective-rate function (approximation) lives in ch.ts
    social: [
      { type: 'pension', rate: 0.053, ceiling: null }, // AHV/IV/EO
      { type: 'unemployment', rate: 0.011, ceiling: 88200 }, // ALV
    ],
    deductions: [],
    surcharges: [],
    fixedAmounts: [],
  },

  // ── Spain — IRPF split into state scale + comunidad regional scale (A.1) ──
  // The taxable base is taxed by the state scale (regionId null) AND, on top,
  // by the city's comunidad regional scale; es.ts sums the two (esIncomeTax).
  // All scales below are the 2026 scales (state + Madrid unchanged since the
  // 2023 deflactación; Cataluña per DL 5/2025 in force from 2025; Valencia per
  // Ley 13/1997 as amended, in force since 2023 — all valid for 2026).
  es: {
    countryCode: 'es',
    year: 2026,
    brackets: [
      // ── State scale (regionId null) — Art. 63.1 LIRPF.
      // Source: sede.agenciatributaria.gob.es (Manual Renta, escala general estatal).
      { from: 0, to: 12450, rate: 0.095 },
      { from: 12450, to: 20200, rate: 0.12 },
      { from: 20200, to: 35200, rate: 0.15 },
      { from: 35200, to: 60000, rate: 0.185 },
      { from: 60000, to: 300000, rate: 0.225 },
      { from: 300000, to: null, rate: 0.245 },

      // ── Comunidad de Madrid — DLeg 1/2010 mod. Ley 13/2023 (deflactación).
      // Source: comunidad.madrid/atencion-contribuyente/irpf (BOCM). Unchanged 2024–2026.
      { from: 0, to: 13362.22, rate: 0.085, regionId: 'comunidad-madrid' },
      { from: 13362.22, to: 19004.63, rate: 0.107, regionId: 'comunidad-madrid' },
      { from: 19004.63, to: 35425.68, rate: 0.128, regionId: 'comunidad-madrid' },
      { from: 35425.68, to: 57320.40, rate: 0.174, regionId: 'comunidad-madrid' },
      { from: 57320.40, to: null, rate: 0.205, regionId: 'comunidad-madrid' },

      // ── Cataluña — DLeg 1/2024 art. 611-1 mod. DL 5/2025 (8 tramos, from 2025).
      // Source: atc.gencat.cat/es/tributs/irpf (Agència Tributària de Catalunya).
      { from: 0, to: 12500, rate: 0.095, regionId: 'cataluna' },
      { from: 12500, to: 22000, rate: 0.125, regionId: 'cataluna' },
      { from: 22000, to: 33000, rate: 0.16, regionId: 'cataluna' },
      { from: 33000, to: 53000, rate: 0.19, regionId: 'cataluna' },
      { from: 53000, to: 90000, rate: 0.215, regionId: 'cataluna' },
      { from: 90000, to: 120000, rate: 0.235, regionId: 'cataluna' },
      { from: 120000, to: 175000, rate: 0.245, regionId: 'cataluna' },
      { from: 175000, to: null, rate: 0.255, regionId: 'cataluna' },

      // ── Comunitat Valenciana — Ley 13/1997 art. 2 mod. Ley 9/2022 (11 tramos).
      // Source: atv.gva.es / Iberley (Ley 13/1997 consolidada). In force since 2023.
      { from: 0, to: 12000, rate: 0.09, regionId: 'comunitat-valenciana' },
      { from: 12000, to: 22000, rate: 0.12, regionId: 'comunitat-valenciana' },
      { from: 22000, to: 32000, rate: 0.15, regionId: 'comunitat-valenciana' },
      { from: 32000, to: 42000, rate: 0.175, regionId: 'comunitat-valenciana' },
      { from: 42000, to: 52000, rate: 0.20, regionId: 'comunitat-valenciana' },
      { from: 52000, to: 62000, rate: 0.225, regionId: 'comunitat-valenciana' },
      { from: 62000, to: 72000, rate: 0.25, regionId: 'comunitat-valenciana' },
      { from: 72000, to: 100000, rate: 0.265, regionId: 'comunitat-valenciana' },
      { from: 100000, to: 150000, rate: 0.275, regionId: 'comunitat-valenciana' },
      { from: 150000, to: 200000, rate: 0.285, regionId: 'comunitat-valenciana' },
      { from: 200000, to: null, rate: 0.295, regionId: 'comunitat-valenciana' },

      // ── Beckham Law (Art. 93 LIRPF): flat 24% to 600k, 47% above. Overrides region.
      { from: 0, to: 600000, rate: 0.24, employmentType: 'beckham' },
      { from: 600000, to: null, rate: 0.47, employmentType: 'beckham' },
    ],
    // NOTE: social contribution carried over from the 2025 baseline (cotización
    // general empleado; base máxima). Not re-verified for 2026 in the A.1 scope.
    social: [{ type: 'pension', rate: 0.0635, ceiling: 56064 }],
    deductions: [],
    surcharges: [],
    fixedAmounts: [],
  },

  // ── Netherlands 2025 — box-1 progressive scale + heffingskortingen ────────
  // Box-1 social insurance (volksverzekeringen) is baked into the bracket-1
  // rate, so it is not modelled separately. Source for ALL nl values below:
  // belastingdienst.nl, schijven/heffingskortingen 2025 (jonger dan AOW-leeftijd),
  // retrieved 2026-06-09.
  nl: {
    countryCode: 'nl',
    year: YEAR,
    brackets: [
      // ── Box-1 scale 2025 (3 brackets since 2025). Source: belastingdienst.nl
      // /…/box_1 ; rate 1 = 8.17% IB + 27.65% premies = 35.82%.
      { from: 0, to: 38441, rate: 0.3582 },
      { from: 38441, to: 76817, rate: 0.3748 },
      { from: 76817, to: null, rate: 0.495 },

      // ── Arbeidskorting 2025 (employee labour tax credit), modelled as a
      // piecewise-linear function via marginal "rates"; the build-up cumulates
      // to the €5,599 max at €43,071, then the phase-out is a NEGATIVE marginal
      // rate down to €0 at €129,078. nl.ts floors the result at 0.
      // Source: belastingdienst.nl tabel-arbeidskorting-2025.
      { from: 0, to: 12169, rate: 0.08053, employmentType: 'arbeidskorting' },
      { from: 12169, to: 26288, rate: 0.3003, employmentType: 'arbeidskorting' },
      { from: 26288, to: 43071, rate: 0.02258, employmentType: 'arbeidskorting' },
      { from: 43071, to: 129078, rate: -0.0651, employmentType: 'arbeidskorting' },
      { from: 129078, to: null, rate: 0, employmentType: 'arbeidskorting' },
    ],
    social: [],
    deductions: [
      // Algemene heffingskorting 2025 (general tax credit): flat €3,068 up to
      // €28,406, then tapered by 6.337% of income above that, floored at 0.
      // Source: belastingdienst.nl (algemene heffingskorting 2025, < AOW).
      { type: 'ahk_max', amount: 3068 },
      { type: 'ahk_phaseout_start', amount: 28406 },
      { type: 'ahk_phaseout_rate', percentage: 0.06337 },
    ],
    surcharges: [],
    fixedAmounts: [],
  },

  // ── Portugal ───────────────────────────────────────────────────────────
  pt: {
    countryCode: 'pt',
    year: YEAR,
    brackets: [
      { from: 0, to: 7703, rate: 0.1325 },
      { from: 7703, to: 11623, rate: 0.18 },
      { from: 11623, to: 16472, rate: 0.23 },
      { from: 16472, to: 21321, rate: 0.26 },
      { from: 21321, to: 27146, rate: 0.3275 },
      { from: 27146, to: 39791, rate: 0.37 },
      { from: 39791, to: 51997, rate: 0.435 },
      { from: 51997, to: 81199, rate: 0.45 },
      { from: 81199, to: null, rate: 0.48 },
    ],
    social: [{ type: 'social_security', rate: 0.11, ceiling: null }],
    deductions: [],
    surcharges: [],
    fixedAmounts: [],
  },

  // ── France — brackets + simplified 22% social + 10% abatement ────────────
  fr: {
    countryCode: 'fr',
    year: YEAR,
    brackets: [
      { from: 0, to: 10777, rate: 0.0 },
      { from: 10777, to: 27478, rate: 0.11 },
      { from: 27478, to: 78570, rate: 0.3 },
      { from: 78570, to: 168994, rate: 0.41 },
      { from: 168994, to: null, rate: 0.45 },
    ],
    social: [
      { type: 'total', rate: 0.22, ceiling: null }, // simplified aggregate
      { type: 'pension', rate: 0.1131, ceiling: null },
      { type: 'health', rate: 0.0975, ceiling: null }, // CSG + CRDS + KV
    ],
    deductions: [
      { type: 'abatement', percentage: 0.1 },
      { type: 'abatement_min', amount: 495 },
      { type: 'abatement_max', amount: 13522 },
    ],
    surcharges: [],
    fixedAmounts: [],
  },

  // ── Italy — IRPEF 2026 + addizionale regionale/comunale (A.4) ────────────
  // 2026 reform (L. 199/2025): 2nd bracket 35% → 33%.
  it: {
    countryCode: 'it',
    year: 2026,
    brackets: [
      { from: 0, to: 28000, rate: 0.23 },
      { from: 28000, to: 50000, rate: 0.33 },
      { from: 50000, to: null, rate: 0.43 },
    ],
    social: [{ type: 'pension', rate: 0.0919, ceiling: 119650 }],
    deductions: [],
    surcharges: [
      // Addizionale regionale (progressive) — MEF, anno d'imposta 2026.
      // Lazio: piano di rientro (max) — €60 detrazione 28.001–30.000 omitted (Anhang A).
      {
        type: 'addizionale_regionale',
        baseType: 'taxable_income',
        regionId: 'lazio',
        brackets: [
          { from: 0, to: 28000, rate: 0.0173 },
          { from: 28000, to: null, rate: 0.0333 },
        ],
      },
      {
        type: 'addizionale_regionale',
        baseType: 'taxable_income',
        regionId: 'lombardia',
        brackets: [
          { from: 0, to: 15000, rate: 0.0123 },
          { from: 15000, to: 28000, rate: 0.0158 },
          { from: 28000, to: 50000, rate: 0.0172 },
          { from: 50000, to: null, rate: 0.0173 },
        ],
      },
      // Addizionale comunale (flat) — Roma 0,9% / Milano 0,8%. Low-income
      // soglie di esenzione approximated away (Anhang A).
      { type: 'addizionale_comunale', baseType: 'taxable_income', cityScope: 'rom', rate: 0.009 },
      { type: 'addizionale_comunale', baseType: 'taxable_income', cityScope: 'mailand', rate: 0.008 },
    ],
    fixedAmounts: [],
  },

  // ── Ireland — PAYE + USC ladders ─────────────────────────────────────────
  ie: {
    countryCode: 'ie',
    year: YEAR,
    brackets: [
      { from: 0, to: 42000, rate: 0.2 },
      { from: 42000, to: null, rate: 0.4 },
      { from: 0, to: 12012, rate: 0.005, employmentType: 'usc' },
      { from: 12012, to: 22920, rate: 0.02, employmentType: 'usc' },
      { from: 22920, to: 70044, rate: 0.045, employmentType: 'usc' },
      { from: 70044, to: null, rate: 0.08, employmentType: 'usc' },
    ],
    social: [{ type: 'prsi', rate: 0.04, ceiling: null }],
    deductions: [],
    surcharges: [],
    fixedAmounts: [],
  },

  // ── Estonia — flat 20% + allowance phase-out (logic in ee.ts) ────────────
  ee: {
    countryCode: 'ee',
    year: YEAR,
    brackets: [{ from: 0, to: null, rate: 0.2 }],
    social: [],
    deductions: [
      { type: 'basic_allowance', amount: 7848 },
      { type: 'allowance_phaseout_start', amount: 14400 },
      { type: 'allowance_phaseout_end', amount: 25200 },
    ],
    surcharges: [],
    fixedAmounts: [],
  },

  // ── Poland — 12/32% over 30k allowance + 4% solidarity over 1M ───────────
  pl: {
    countryCode: 'pl',
    year: YEAR,
    brackets: [
      { from: 0, to: 120000, rate: 0.12 }, // applied to income after grundfreibetrag
      { from: 120000, to: null, rate: 0.32 },
    ],
    social: [
      { type: 'pension', rate: 0.0976, ceiling: null }, // ZUS
      { type: 'health', rate: 0.09, ceiling: null }, // NFZ
      { type: 'unemployment', rate: 0.0167, ceiling: null }, // Unfall
    ],
    deductions: [{ type: 'grundfreibetrag', amount: 30000 }],
    surcharges: [
      { type: 'solidarity', baseType: 'taxable_income', rate: 0.04, allowance: 1000000 },
    ],
    fixedAmounts: [],
  },

  // ── Czechia ───────────────────────────────────────────────────────────
  cz: {
    countryCode: 'cz',
    year: YEAR,
    brackets: [
      { from: 0, to: 1582812, rate: 0.15 },
      { from: 1582812, to: null, rate: 0.23 },
    ],
    social: [
      { type: 'pension', rate: 0.065, ceiling: null },
      { type: 'health', rate: 0.045, ceiling: null },
    ],
    deductions: [],
    surcharges: [],
    fixedAmounts: [],
  },

  // ── Hungary ───────────────────────────────────────────────────────────
  hu: {
    countryCode: 'hu',
    year: YEAR,
    brackets: [{ from: 0, to: null, rate: 0.15 }],
    social: [
      { type: 'pension', rate: 0.1, ceiling: null },
      { type: 'health', rate: 0.07, ceiling: null },
      { type: 'unemployment', rate: 0.015, ceiling: null },
    ],
    deductions: [],
    surcharges: [],
    fixedAmounts: [],
  },

  // ── Romania ───────────────────────────────────────────────────────────
  ro: {
    countryCode: 'ro',
    year: YEAR,
    brackets: [{ from: 0, to: null, rate: 0.1 }],
    social: [
      { type: 'pension', rate: 0.25, ceiling: null }, // CAS
      { type: 'health', rate: 0.1, ceiling: null }, // CASS
    ],
    deductions: [],
    surcharges: [],
    fixedAmounts: [],
  },

  // ── UAE — no income tax ─────────────────────────────────────────────────
  uae: {
    countryCode: 'uae',
    year: YEAR,
    brackets: [{ from: 0, to: null, rate: 0.0 }],
    social: [],
    deductions: [],
    surcharges: [],
    fixedAmounts: [],
  },

  // ── Thailand ───────────────────────────────────────────────────────────
  th: {
    countryCode: 'th',
    year: YEAR,
    brackets: [
      { from: 0, to: 150000, rate: 0.0 },
      { from: 150000, to: 300000, rate: 0.05 },
      { from: 300000, to: 500000, rate: 0.1 },
      { from: 500000, to: 750000, rate: 0.15 },
      { from: 750000, to: 1000000, rate: 0.2 },
      { from: 1000000, to: 2000000, rate: 0.25 },
      { from: 2000000, to: 5000000, rate: 0.3 },
      { from: 5000000, to: null, rate: 0.35 },
    ],
    // 5% with annual contribution cap 9,000 THB ⇒ salary ceiling 180,000.
    social: [{ type: 'social_security', rate: 0.05, ceiling: 180000 }],
    deductions: [
      { type: 'standard', percentage: 0.5 },
      { type: 'standard_max', amount: 100000 },
    ],
    surcharges: [],
    fixedAmounts: [],
  },

  // ── United Kingdom — England/Scotland bands + NI (logic in gb.ts) ────────
  gb: {
    countryCode: 'gb',
    year: YEAR,
    brackets: [
      // England/Wales/NI bands on TAXABLE income (gross − personal allowance)
      { from: 0, to: 37700, rate: 0.2 },
      { from: 37700, to: 112570, rate: 0.4 },
      { from: 112570, to: null, rate: 0.45 },
      // Scotland bands on TAXABLE income
      { from: 0, to: 2306, rate: 0.19, employmentType: 'scotland' },
      { from: 2306, to: 13991, rate: 0.2, employmentType: 'scotland' },
      { from: 13991, to: 31092, rate: 0.21, employmentType: 'scotland' },
      { from: 31092, to: 62430, rate: 0.42, employmentType: 'scotland' },
      { from: 62430, to: 112570, rate: 0.45, employmentType: 'scotland' },
      { from: 112570, to: null, rate: 0.48, employmentType: 'scotland' },
    ],
    social: [
      { type: 'ni_main', rate: 0.08, ceiling: 50270 }, // PT→UEL
      { type: 'ni_upper', rate: 0.02, ceiling: null }, // above UEL
    ],
    deductions: [
      { type: 'personal_allowance', amount: 12570 },
      { type: 'taper_threshold', amount: 100000 },
      { type: 'taper_zero', amount: 125140 },
      { type: 'ni_primary_threshold', amount: 12570 },
    ],
    surcharges: [],
    fixedAmounts: [],
  },

  // ── United States — federal scale 2026 (Rev. Proc. 2025-32). State layer
  // (NY brackets, NYC city tax) is seeded separately once confirmed; Florida
  // (us-fl) has no state brackets → federal only (A.3).
  us: {
    countryCode: 'us',
    year: 2026,
    brackets: [
      { from: 0, to: 12400, rate: 0.1, filingStatus: 'single' },
      { from: 12400, to: 50400, rate: 0.12, filingStatus: 'single' },
      { from: 50400, to: 105700, rate: 0.22, filingStatus: 'single' },
      { from: 105700, to: 201775, rate: 0.24, filingStatus: 'single' },
      { from: 201775, to: 256225, rate: 0.32, filingStatus: 'single' },
      { from: 256225, to: 640600, rate: 0.35, filingStatus: 'single' },
      { from: 640600, to: null, rate: 0.37, filingStatus: 'single' },
      { from: 0, to: 24800, rate: 0.1, filingStatus: 'married' },
      { from: 24800, to: 100800, rate: 0.12, filingStatus: 'married' },
      { from: 100800, to: 211400, rate: 0.22, filingStatus: 'married' },
      { from: 211400, to: 403550, rate: 0.24, filingStatus: 'married' },
      { from: 403550, to: 512450, rate: 0.32, filingStatus: 'married' },
      { from: 512450, to: 768700, rate: 0.35, filingStatus: 'married' },
      { from: 768700, to: null, rate: 0.37, filingStatus: 'married' },
      // ── New York State 2026 (phase-in-reduced rates; tax.ny.gov) ──
      { from: 0, to: 8500, rate: 0.039, filingStatus: 'single', regionId: 'us-ny' },
      { from: 8500, to: 11700, rate: 0.044, filingStatus: 'single', regionId: 'us-ny' },
      { from: 11700, to: 13900, rate: 0.0515, filingStatus: 'single', regionId: 'us-ny' },
      { from: 13900, to: 80650, rate: 0.054, filingStatus: 'single', regionId: 'us-ny' },
      { from: 80650, to: 215400, rate: 0.059, filingStatus: 'single', regionId: 'us-ny' },
      { from: 215400, to: 1077550, rate: 0.0685, filingStatus: 'single', regionId: 'us-ny' },
      { from: 1077550, to: 5000000, rate: 0.0965, filingStatus: 'single', regionId: 'us-ny' },
      { from: 5000000, to: 25000000, rate: 0.103, filingStatus: 'single', regionId: 'us-ny' },
      { from: 25000000, to: null, rate: 0.109, filingStatus: 'single', regionId: 'us-ny' },
      { from: 0, to: 17150, rate: 0.039, filingStatus: 'married', regionId: 'us-ny' },
      { from: 17150, to: 23600, rate: 0.044, filingStatus: 'married', regionId: 'us-ny' },
      { from: 23600, to: 27900, rate: 0.0515, filingStatus: 'married', regionId: 'us-ny' },
      { from: 27900, to: 161550, rate: 0.054, filingStatus: 'married', regionId: 'us-ny' },
      { from: 161550, to: 323200, rate: 0.059, filingStatus: 'married', regionId: 'us-ny' },
      { from: 323200, to: 2155350, rate: 0.0685, filingStatus: 'married', regionId: 'us-ny' },
      { from: 2155350, to: 5000000, rate: 0.0965, filingStatus: 'married', regionId: 'us-ny' },
      { from: 5000000, to: 25000000, rate: 0.103, filingStatus: 'married', regionId: 'us-ny' },
      { from: 25000000, to: null, rate: 0.109, filingStatus: 'married', regionId: 'us-ny' },
    ],
    social: [
      { type: 'social_security', rate: 0.062, ceiling: 184500 }, // SS wage base 2026
      { type: 'medicare', rate: 0.0145, ceiling: null },
    ],
    deductions: [
      { type: 'standard', amount: 16100, condition: 'single' }, // 2026 federal
      { type: 'standard', amount: 32200, condition: 'married' }, // 2026 federal
      // NY State standard deduction (condition "<region>:<filingStatus>")
      { type: 'standard_state', amount: 8000, condition: 'us-ny:single' },
      { type: 'standard_state', amount: 16050, condition: 'us-ny:married' },
    ],
    surcharges: [
      // NYC city tax 2026 — only NYC residents (cityScope new-york); thresholds
      // differ by filing status (variantKey). Applied to NY taxable income.
      {
        type: 'nyc_city',
        baseType: 'taxable_income',
        cityScope: 'new-york',
        variantKey: 'single',
        brackets: [
          { from: 0, to: 12000, rate: 0.03078 },
          { from: 12000, to: 25000, rate: 0.03762 },
          { from: 25000, to: 50000, rate: 0.03819 },
          { from: 50000, to: null, rate: 0.03876 },
        ],
      },
      {
        type: 'nyc_city',
        baseType: 'taxable_income',
        cityScope: 'new-york',
        variantKey: 'married',
        brackets: [
          { from: 0, to: 21600, rate: 0.03078 },
          { from: 21600, to: 45000, rate: 0.03762 },
          { from: 45000, to: 90000, rate: 0.03819 },
          { from: 90000, to: null, rate: 0.03876 },
        ],
      },
    ],
    fixedAmounts: [],
  },

  // ── Malta ───────────────────────────────────────────────────────────────
  mt: {
    countryCode: 'mt',
    year: YEAR,
    brackets: [
      { from: 0, to: 9100, rate: 0.0 },
      { from: 9100, to: 14500, rate: 0.15 },
      { from: 14500, to: 60000, rate: 0.25 },
      { from: 60000, to: null, rate: 0.35 },
    ],
    social: [{ type: 'social_security', rate: 0.1, ceiling: 30030 }],
    deductions: [{ type: 'ss_min', amount: 10148 }],
    surcharges: [],
    fixedAmounts: [],
  },

  // ── Georgia ───────────────────────────────────────────────────────────
  ge: {
    countryCode: 'ge',
    year: YEAR,
    brackets: [{ from: 0, to: null, rate: 0.2 }],
    social: [{ type: 'pension', rate: 0.02, ceiling: null }], // employees only (logic in ge.ts)
    deductions: [],
    surcharges: [],
    fixedAmounts: [],
  },

  // ── Singapore ───────────────────────────────────────────────────────────
  sg: {
    countryCode: 'sg',
    year: YEAR,
    brackets: [
      { from: 0, to: 20000, rate: 0.0 },
      { from: 20000, to: 30000, rate: 0.02 },
      { from: 30000, to: 40000, rate: 0.035 },
      { from: 40000, to: 80000, rate: 0.07 },
      { from: 80000, to: 120000, rate: 0.115 },
      { from: 120000, to: 160000, rate: 0.15 },
      { from: 160000, to: 200000, rate: 0.18 },
      { from: 200000, to: 240000, rate: 0.19 },
      { from: 240000, to: 280000, rate: 0.195 },
      { from: 280000, to: 320000, rate: 0.2 },
      { from: 320000, to: 500000, rate: 0.22 },
      { from: 500000, to: 1000000, rate: 0.23 },
      { from: 1000000, to: null, rate: 0.24 },
    ],
    social: [],
    deductions: [],
    surcharges: [],
    fixedAmounts: [],
  },

  // ── Indonesia ───────────────────────────────────────────────────────────
  id: {
    countryCode: 'id',
    year: YEAR,
    brackets: [
      { from: 0, to: 60_000_000, rate: 0.05 },
      { from: 60_000_000, to: 250_000_000, rate: 0.15 },
      { from: 250_000_000, to: 500_000_000, rate: 0.25 },
      { from: 500_000_000, to: 5_000_000_000, rate: 0.3 },
      { from: 5_000_000_000, to: null, rate: 0.35 },
    ],
    social: [
      { type: 'health', rate: 0.01, ceiling: 144_000_000 }, // BPJS Kesehatan
      { type: 'jht', rate: 0.02, ceiling: null }, // retirement savings
      { type: 'jp', rate: 0.01, ceiling: 118_934_400 }, // pension
    ],
    deductions: [{ type: 'ptkp', amount: 54_000_000 }],
    surcharges: [],
    fixedAmounts: [],
  },

  // ── Colombia (COP, UVT-based) ────────────────────────────────────────────
  co: {
    countryCode: 'co',
    year: YEAR,
    brackets: [
      { from: 0, to: 1_090 * UVT, rate: 0.0 },
      { from: 1_090 * UVT, to: 1_700 * UVT, rate: 0.19 },
      { from: 1_700 * UVT, to: 4_100 * UVT, rate: 0.28 },
      { from: 4_100 * UVT, to: 8_670 * UVT, rate: 0.33 },
      { from: 8_670 * UVT, to: 18_970 * UVT, rate: 0.35 },
      { from: 18_970 * UVT, to: 31_000 * UVT, rate: 0.37 },
      { from: 31_000 * UVT, to: null, rate: 0.39 },
    ],
    social: [
      { type: 'health', rate: 0.04, ceiling: null }, // salud
      { type: 'pension', rate: 0.04, ceiling: null }, // pensión
    ],
    deductions: [
      { type: 'renta_exenta', percentage: 0.25 },
      { type: 'renta_exenta_cap', amount: 790 * UVT },
    ],
    surcharges: [],
    fixedAmounts: [],
  },

  // ── Mexico (ISR annual) ──────────────────────────────────────────────────
  mx: {
    countryCode: 'mx',
    year: YEAR,
    brackets: [
      { from: 0, to: 107_429.88, rate: 0.0192 },
      { from: 107_429.88, to: 911_814.6, rate: 0.064 },
      { from: 911_814.6, to: 1_602_432.84, rate: 0.1088 },
      { from: 1_602_432.84, to: 1_862_757.6, rate: 0.16 },
      { from: 1_862_757.6, to: 2_230_230.84, rate: 0.1792 },
      { from: 2_230_230.84, to: 4_497_954.56, rate: 0.2136 },
      { from: 4_497_954.56, to: 7_089_551.88, rate: 0.2352 },
      { from: 7_089_551.88, to: 13_535_122.08, rate: 0.3 },
      { from: 13_535_122.08, to: 18_046_829.52, rate: 0.32 },
      { from: 18_046_829.52, to: 54_140_488.44, rate: 0.34 },
      { from: 54_140_488.44, to: null, rate: 0.35 },
    ],
    social: [
      { type: 'health', rate: 0.01, ceiling: null }, // EyM ≈ 1%
      { type: 'pension', rate: 0.014, ceiling: null }, // RCV ≈ 1.4%
    ],
    deductions: [],
    surcharges: [],
    fixedAmounts: [],
  },

  // ── Argentina (Ganancias, approximate Q1 2025) ──────────────────────────
  ar: {
    countryCode: 'ar',
    year: YEAR,
    brackets: [
      { from: 0, to: 8_000_000, rate: 0.05 },
      { from: 8_000_000, to: 16_000_000, rate: 0.09 },
      { from: 16_000_000, to: 24_000_000, rate: 0.12 },
      { from: 24_000_000, to: 32_000_000, rate: 0.15 },
      { from: 32_000_000, to: 48_000_000, rate: 0.19 },
      { from: 48_000_000, to: 64_000_000, rate: 0.23 },
      { from: 64_000_000, to: 96_000_000, rate: 0.27 },
      { from: 96_000_000, to: 128_000_000, rate: 0.31 },
      { from: 128_000_000, to: null, rate: 0.35 },
    ],
    social: [
      { type: 'pension', rate: 0.11, ceiling: null }, // jubilación
      { type: 'health', rate: 0.06, ceiling: null }, // PAMI 3% + obra social 3%
    ],
    deductions: [{ type: 'mni', amount: 38_400_000 }],
    surcharges: [],
    fixedAmounts: [],
  },

  // ── South Africa (2025/2026) ─────────────────────────────────────────────
  za: {
    countryCode: 'za',
    year: YEAR,
    brackets: [
      { from: 0, to: 237_100, rate: 0.18 },
      { from: 237_100, to: 370_500, rate: 0.26 },
      { from: 370_500, to: 512_800, rate: 0.31 },
      { from: 512_800, to: 673_000, rate: 0.36 },
      { from: 673_000, to: 857_900, rate: 0.39 },
      { from: 857_900, to: 1_817_000, rate: 0.41 },
      { from: 1_817_000, to: null, rate: 0.45 },
    ],
    social: [{ type: 'unemployment', rate: 0.01, ceiling: 212_539 }], // UIF
    deductions: [{ type: 'primary_rebate', amount: 17_235 }],
    surcharges: [],
    fixedAmounts: [],
  },
};

/** Per-country source URLs (issuer of the figures) for seeding `sourceUrl`. */
export const TAX_DATA_SOURCES: Record<string, string> = {
  de: SRC.de_social,
  at: SRC.at,
  ch: SRC.ch_ahv,
  es: SRC.es,
  nl: SRC.nl,
  pt: SRC.pt,
  fr: SRC.fr,
  it: SRC.it,
  ie: SRC.ie,
  ee: SRC.ee,
  pl: SRC.pl,
  cz: SRC.cz,
  hu: SRC.hu,
  ro: SRC.ro,
  uae: SRC.uae,
  th: SRC.th,
  gb: SRC.gb,
  us: SRC.us,
  mt: SRC.mt,
  ge: SRC.ge,
  sg: SRC.sg,
  id: SRC.id,
  co: SRC.co,
  mx: SRC.mx,
  ar: SRC.ar,
  za: SRC.za,
};

/**
 * Sub-national tax regions referenced by regional brackets / surcharges /
 * fixed amounts. The seed creates a Region row per entry and maps the slug used
 * in TaxData (regionId) to the DB Region id.
 */
export const REGIONS: Array<{ countryCode: string; slug: string; nameDE: string; nameEN: string }> = [
  { countryCode: 'es', slug: 'comunidad-madrid', nameDE: 'Madrid', nameEN: 'Madrid' },
  { countryCode: 'es', slug: 'cataluna', nameDE: 'Katalonien', nameEN: 'Catalonia' },
  { countryCode: 'es', slug: 'comunitat-valenciana', nameDE: 'Valencia', nameEN: 'Valencia' },
  { countryCode: 'it', slug: 'lazio', nameDE: 'Latium', nameEN: 'Lazio' },
  { countryCode: 'it', slug: 'lombardia', nameDE: 'Lombardei', nameEN: 'Lombardy' },
  { countryCode: 'us', slug: 'us-ny', nameDE: 'New York (Bundesstaat)', nameEN: 'New York State' },
  { countryCode: 'us', slug: 'us-fl', nameDE: 'Florida', nameEN: 'Florida' },
  { countryCode: 'ch', slug: 'kanton-zuerich', nameDE: 'Kanton Zürich', nameEN: 'Canton Zurich' },
];

/** City slug → region slug. The seed sets City.regionId accordingly. */
export const CITY_REGIONS: Record<string, string> = {
  madrid: 'comunidad-madrid',
  barcelona: 'cataluna',
  valencia: 'comunitat-valenciana',
  rom: 'lazio',
  mailand: 'lombardia',
  'new-york': 'us-ny',
  miami: 'us-fl',
  zuerich: 'kanton-zuerich',
};

/**
 * Returns the canonical TaxData for a country/year. Used as the engine fallback
 * (and by unit tests) when the caller does not supply DB-loaded data. `year` is
 * accepted for forward-compatibility; only 2025 is currently seeded.
 */
export function getDefaultTaxData(countryCode: string, _year: number = YEAR): TaxData {
  const key = countryCode.toLowerCase();
  const data = DEFAULT_TAX_DATA[key];
  if (!data) {
    // Unknown country: empty tables (modules without brackets fall back to 0).
    return { countryCode: key, year: _year, brackets: [], social: [], deductions: [], surcharges: [], fixedAmounts: [] };
  }
  return data;
}
