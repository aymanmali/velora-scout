export type CurrencyCode = "USD" | "EUR" | "GBP";

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  label: string;
  rateFromUsd: number;
  locale: string;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  USD: {
    code: "USD",
    symbol: "$",
    label: "$ USD",
    rateFromUsd: 1.0,
    locale: "en-US",
  },
  EUR: {
    code: "EUR",
    symbol: "€",
    label: "€ EUR",
    rateFromUsd: 0.92,
    locale: "de-DE",
  },
  GBP: {
    code: "GBP",
    symbol: "£",
    label: "£ GBP",
    rateFromUsd: 0.79,
    locale: "en-GB",
  },
};

export function convertFromUsd(amountUsd: number, currency: CurrencyCode = "USD"): number {
  const config = CURRENCIES[currency] || CURRENCIES.USD;
  return Number((amountUsd * config.rateFromUsd).toFixed(2));
}

export function formatPrice(amountUsd: number, currency: CurrencyCode = "USD"): string {
  const config = CURRENCIES[currency] || CURRENCIES.USD;
  const converted = convertFromUsd(amountUsd, currency);
  return `${config.symbol}${converted.toFixed(2)}`;
}
