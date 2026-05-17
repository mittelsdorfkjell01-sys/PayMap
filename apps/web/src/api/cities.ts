import api from "./client";
import i18n from "@/i18n";

export interface CityTranslated {
  id: string;
  slug: string;
  flag: string;
  isHomeCity: boolean;
  sortOrder: number;
  name: string;
  country: string;
  col: { rent: number; food: number; transport: number } | null;
  regimes: Array<{
    id: string;
    slug: string;
    label: string;
    incomeRate: number;
    socialRate: number;
    exemptFrac: number | null;
    isDefault: boolean;
    sortOrder: number;
  }>;
  details: Record<string, string[]>;
}

export interface CitiesResponse {
  homeCities: CityTranslated[];
  targetCities: CityTranslated[];
}

export async function fetchCities(): Promise<CitiesResponse> {
  const locale = i18n.language?.slice(0, 2) ?? "de";
  const { data } = await api.get<CitiesResponse>(`/api/cities?locale=${locale}`);
  return data;
}
