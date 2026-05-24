export type AgeRange = '0-3' | '4-6' | '7-12' | '13-18' | '18+';

export interface TaxOptions {
  gross: number;
  currency: string;
  employment: 'employed' | 'freelancer' | 'founder' | 'passive';
  familyStatus: 'single' | 'married' | 'divorced';
  children: number;
  childrenAges?: AgeRange[];
  kvType?: 'statutory' | 'private';
  year: number;
  specialRegimeId?: string;
  partnerGross?: number;
  // For NL 30%-ruling: number of full years the ruling has been active (1 = first year, 2 = second, etc.)
  rulingYearsActive?: number;
  // For GB: 'scotland' applies Scottish income tax rates instead of England/Wales/NI rates
  region?: string;
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

export interface CountryModule {
  countryCode: string;
  calculateIncomeTax(taxable: number, opts: TaxOptions): number;
  getSocialContributions(gross: number, opts: TaxOptions): SocialContributions;
  getDeductions(gross: number, opts: TaxOptions): number;
  getAvailableRegimes(): SpecialRegimeInfo[];
  applySpecialRegime(gross: number, regimeId: string, opts: TaxOptions): number;
  getDisclaimer(locale: string): string;
}
