import { CurrencyCode, CurrencyInfo } from '../types/finance';

export const CURRENCY_MAP: Record<CurrencyCode, CurrencyInfo> = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', rateToBaseUSD: 1.0 },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', rateToBaseUSD: 1.08 },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', rateToBaseUSD: 1.28 },
  JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen', rateToBaseUSD: 0.0065 },
  CAD: { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar', rateToBaseUSD: 0.73 },
  AUD: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', rateToBaseUSD: 0.65 },
  CHF: { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc', rateToBaseUSD: 1.13 },
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee', rateToBaseUSD: 0.012 },
  SGD: { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', rateToBaseUSD: 0.76 },
};

export const SUPPORTED_CURRENCIES = Object.values(CURRENCY_MAP);

/**
 * Converts an amount from source currency to target currency using base USD rates.
 */
export function convertCurrency(
  amount: number,
  from: CurrencyCode,
  to: CurrencyCode
): number {
  if (from === to) return amount;
  const fromRate = CURRENCY_MAP[from]?.rateToBaseUSD || 1.0;
  const toRate = CURRENCY_MAP[to]?.rateToBaseUSD || 1.0;
  // Convert from -> USD -> to
  const inUSD = amount * fromRate;
  return inUSD / toRate;
}

/**
 * Formats a monetary number with appropriate currency symbol and tabular figures
 */
export function formatCurrency(
  amount: number,
  currencyCode: CurrencyCode = 'USD',
  includeDecimals: boolean = true
): string {
  const info = CURRENCY_MAP[currencyCode] || CURRENCY_MAP.USD;
  const decimals = currencyCode === 'JPY' ? 0 : (includeDecimals ? 2 : 0);
  
  const formattedNumber = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(Math.abs(amount));

  const sign = amount < 0 ? '-' : '';
  return `${sign}${info.symbol}${formattedNumber}`;
}
