/** Monedă afișată: MDL (implicit) sau EUR — setează `NEXT_PUBLIC_PRICE_CURRENCY=EUR` în `.env`. */
export type PriceCurrencyCode = "MDL" | "EUR";

export function getPriceCurrency(): PriceCurrencyCode {
  const v = process.env.NEXT_PUBLIC_PRICE_CURRENCY?.trim().toUpperCase();
  if (v === "EUR") {
    return "EUR";
  }
  return "MDL";
}

/** Locale pentru Intl în funcție de monedă și limbă UI. */
function numberFormatLocale(uiLocale: string, currency: PriceCurrencyCode): string {
  if (currency === "EUR") {
    return uiLocale === "en" ? "de-DE" : uiLocale === "ru" ? "ru-RU" : "ro-RO";
  }
  return "ro-MD";
}

export function formatPrice(amount: number, locale: string): string {
  const currency = getPriceCurrency();
  return new Intl.NumberFormat(numberFormatLocale(locale, currency), {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}
