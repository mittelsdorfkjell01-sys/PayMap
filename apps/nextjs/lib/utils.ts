import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  amount: number,
  currency = 'EUR',
  fractionDigits = 0,
  locale = 'de',
): string {
  return new Intl.NumberFormat(locale === 'de' ? 'de-DE' : 'en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: fractionDigits,
  }).format(amount);
}

export function formatPercent(rate: number, locale = 'de'): string {
  return new Intl.NumberFormat(locale === 'de' ? 'de-DE' : 'en-US', {
    style: 'percent',
    maximumFractionDigits: 1,
  }).format(rate);
}
