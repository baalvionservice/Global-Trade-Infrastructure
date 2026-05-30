import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Standardized institutional currency formatter.
 */
export function formatCurrency(amount: number, currency: string = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Standardized number formatter for large institutional volumes.
 * Supports Trillions (T), Billions (B), Millions (M).
 */
export function formatNumber(value: number | string) {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return value;
  if (num >= 1000000000000) return `${(num / 1000000000000).toFixed(2)}T`;
  if (num >= 1000000000) return `${(num / 1000000000).toFixed(2)}B`;
  if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
  return num.toString();
}

/**
 * Jurisdictional Flag Mapping (ISO Alpha-2 to Emoji)
 */
export const COUNTRY_FLAGS: Record<string, string> = {
  'United States': '🇺🇸',
  'USA': '🇺🇸',
  'China': '🇨🇳',
  'India': '🇮🇳',
  'Singapore': '🇸🇬',
  'Vietnam': '🇻🇳',
  'Germany': '🇩🇪',
  'European Union': '🇪🇺',
  'EU': '🇪🇺',
  'United Kingdom': '🇬🇧',
  'UK': '🇬🇧',
  'Japan': '🇯🇵',
};

export function getFlag(country: string): string {
  return COUNTRY_FLAGS[country] || '🌐';
}
