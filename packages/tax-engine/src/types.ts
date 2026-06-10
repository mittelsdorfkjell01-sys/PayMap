export interface TaxOptions {
  gross: number;
  currency: string;
  employment: 'employed' | 'freelancer' | 'founder' | 'passive';
  familyStatus: 'single' | 'married' | 'divorced';
  children: number;
  kvType?: 'statutory' | 'private';
  // DE PKV: the user's monthly private health-insurance premium. When kvType is
  // 'private' and this is set, it is used as the health contribution instead of
  // the (statutory) percentage. Monthly amount in the local currency.
  privateKvPremium?: number;
  year: number;
  specialRegimeId?: string;
  partnerGross?: number;
  // For NL 30%-ruling: number of full years the ruling has been active (1 = first year, 2 = second, etc.)
  rulingYearsActive?: number;
  // For GB: 'scotland' applies Scottish income tax rates instead of England/Wales/NI rates
  region?: string;
  // City-level scope for municipal surcharges (e.g. 'new-york' → NYC city tax,
  // 'rom'/'mailand' → addizionale comunale). Matches Surcharge.cityScope.
  cityScope?: string;
  // DE church tax: only levied when churchMember is true. `bundesland` selects
  // the rate variant (8% in BY/BW, 9% elsewhere). No UI yet → defaults mean no
  // church tax.
  churchMember?: boolean;
  bundesland?: string;
}

export interface TaxBreakdownLine {
  label: string;
  labelEN: string;
  amount: number;
  isDeduction: boolean;
}

export interface SocialContributions {
  health: number;
  pension: number;
  unemployment: number;
  care: number;
  total: number;
}

export interface TaxResult {
  gross: number;
  currency: string;
  deductions: number;
  taxableIncome: number;
  incomeTax: number;
  socialContributions: SocialContributions;
  soli?: number;
  churchTax?: number;
  totalDeductions: number;
  netAnnual: number;
  netMonthly: number;
  effectiveRate: number;
  marginalRate: number;
  specialRegimeApplied?: string;
  specialRegimeNetAnnual?: number;
  breakdown: TaxBreakdownLine[];
  disclaimer: string;
}

export interface ApproximateResult extends TaxResult {
  netMonthlyMin: number;
  netMonthlyMax: number;
  assumptions: string[];
}

export interface SpecialRegimeInfo {
  id: string;
  nameDE: string;
  nameEN: string;
  flatRate: number;
  durationYears: number;
}

// ─── Data-driven tax tables ──────────────────────────────────────────────────
// The engine algorithms (DE §32a polynomial, splitting, CH effective-rate
// approximation, Jahressechstel, …) stay in code. Every *value* they consume —
// bracket thresholds/rates, social rates/ceilings, deduction amounts,
// surcharge percentages, fixed amounts — is supplied at runtime via `TaxData`,
// loaded from the database (admin-editable, year-versioned). In unit tests and
// as a fallback, `getDefaultTaxData()` provides the canonical seed values.

export interface BracketRow {
  from: number;
  to: number | null; // null = no upper bound (Infinity)
  rate: number;
  // Which income scale this row belongs to. Defaults to "employed" (the
  // standard progressive scale). Special regimes use their own key
  // (e.g. "beckham", "impatriate", "ruling30").
  employmentType?: string;
  // "single" / "married" for status-dependent scales (US MFJ); null = any.
  filingStatus?: string | null;
  // Region slug for sub-national scales (ES comunidad, US state); null = national.
  regionId?: string | null;
}

export interface SocialRow {
  type: string;
  rate: number;
  ceiling: number | null;
}

export interface DeductionRow {
  type: string;
  amount?: number | null;
  percentage?: number | null;
  condition?: string | null;
}

export interface SurchargeBracket {
  from: number;
  to: number | null;
  rate: number;
}

export interface SurchargeRow {
  type: string; // "soli" | "church" | "addizionale_regionale" | "addizionale_comunale" | "nyc_city"
  baseType: 'income_tax' | 'taxable_income';
  regionId?: string | null;
  cityScope?: string | null;
  rate?: number | null; // flat rate, or null when progressive (then `brackets`)
  brackets?: SurchargeBracket[] | null;
  allowance?: number | null;
  variantKey?: string | null;
}

export interface FixedAmountRow {
  type: string;
  regionId?: string | null;
  amount: number;
  period: 'monthly' | 'yearly';
}

export interface TaxData {
  countryCode: string;
  year: number;
  brackets: BracketRow[];
  social: SocialRow[];
  deductions: DeductionRow[];
  surcharges: SurchargeRow[];
  fixedAmounts: FixedAmountRow[];
}

export interface CountryModule {
  countryCode: string;
  calculateIncomeTax(taxable: number, opts: TaxOptions, taxData?: TaxData): number;
  getSocialContributions(gross: number, opts: TaxOptions, taxData?: TaxData): SocialContributions;
  getDeductions(gross: number, opts: TaxOptions, taxData?: TaxData): number;
  getAvailableRegimes(): SpecialRegimeInfo[];
  applySpecialRegime(gross: number, regimeId: string, opts: TaxOptions, taxData?: TaxData): number;
  getDisclaimer(locale: string): string;
}
