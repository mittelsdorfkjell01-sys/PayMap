import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMoney(amount: number, locale: string): string {
  return new Intl.NumberFormat(locale === "en" ? "en-GB" : "de-DE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
}

export function formatNumber(amount: number, locale: string): string {
  return new Intl.NumberFormat(locale === "en" ? "en-GB" : "de-DE").format(
    Math.round(amount)
  );
}

export function formatDelta(amount: number, locale: string): string {
  const abs = Math.abs(Math.round(amount));
  const formatted = new Intl.NumberFormat(locale === "en" ? "en-GB" : "de-DE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(abs);
  // Use proper minus sign U+2212 for negative
  return amount < 0 ? `−${formatted}` : `+${formatted}`;
}
