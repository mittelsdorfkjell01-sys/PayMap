import axios from "axios";

const BASE = import.meta.env.VITE_API_URL ?? "";

export const api = axios.create({
  baseURL: BASE,
});

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("paymap_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
