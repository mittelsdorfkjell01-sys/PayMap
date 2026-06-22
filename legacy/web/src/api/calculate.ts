import api from "./client";

export interface InsuranceOverrides {
  health?: number;
  care?: number;
  pension?: number;
  unemployment?: number;
}

export interface BreakdownLine {
  label: string;
  labelEN: string;
  amount: number;
  isDeduction: boolean;
  category: string;
}

export interface SocialContributions {
  health: number;
  pension: number;
  unemployment: number;
  care: number;
  total: number;
}

export interface SpecialRegime {
  slug: string;
  nameDE: string;
  nameEN: string;
  flatRate: number;
  durationYears: number;
  conditionsDE: string;
}

export interface CalcSide {
  slug: string;
  country: string;
  netAnnual: number;
  netMonthly: number;
  effectiveRate: number;
  social: SocialContributions;
  breakdown: BreakdownLine[];
  col: Record<string, number>;
  regime?: SpecialRegime | null;
}

export interface CalculateResponse {
  home: CalcSide;
  target: CalcSide;
  delta: { monthly: number; annual: number; percent: number };
}

export interface CalculateParams {
  gross: number; // annual
  homeCitySlug: string;
  targetCitySlug: string;
  year?: number;
  employment?: "employed" | "freelancer" | "founder" | "passive";
  familyStatus?: "single" | "married" | "divorced";
  children?: number;
  kvType?: "statutory" | "private";
  insuranceOverrides?: InsuranceOverrides;
  specialRegimeId?: string;
}

export async function calculate(params: CalculateParams): Promise<CalculateResponse> {
  const { data } = await api.post<CalculateResponse>("/api/calculate", params);
  return data;
}
