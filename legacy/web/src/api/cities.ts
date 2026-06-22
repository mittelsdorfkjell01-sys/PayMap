import api from "./client";

export interface City {
  id: string;
  slug: string;
  flag: string;
  nameDE: string;
  nameEN: string;
  currency: string;
  countrySlug: string | null;
  countryDE: string;
  countryEN: string;
}

export interface CitiesResponse {
  homeCities: City[];
  targetCities: City[];
}

export async function fetchCities(): Promise<CitiesResponse> {
  const { data } = await api.get<CitiesResponse>("/api/cities");
  return data;
}
