import api from "./client";
import i18n from "@/i18n";

export interface BreakdownItem {
  slug: string;
  labelDe: string;
  labelEn: string;
  amount: number;
}

export interface TaxSide {
  netto: number;
  monthly: number;
  breakdown: BreakdownItem[];
}

export interface ColSide {
  rent: number;
  food: number;
  transport: number;
  total: number;
}

export interface CalculateResponse {
  home: TaxSide;
  target: TaxSide;
  delta: { monthly: number; percent: number; effective: number; annual: number };
  col: { home: ColSide | null; target: ColSide | null; diff: number };
}

export async function calculate(params: {
  gross: number;
  homeCitySlug: string;
  targetCitySlug: string;
  regimeSlug: string;
}): Promise<CalculateResponse> {
  const locale = i18n.language?.slice(0, 2) ?? "de";
  const { data } = await api.post<CalculateResponse>("/api/calculate", {
    ...params,
    locale,
  });
  return data;
}
