/** Monedă pentru prețuri la anunțuri. */
export type PriceCurrencyCode = "MDL" | "EUR";

/** Compatibilitate: moneda implicită site-wide din env (fără legătură cu anunțul). */
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

/**
 * Formatează suma. Pentru anunțuri folosește `currency` din baza de date (`listing.priceCurrency`).
 * Dacă lipsește al treilea argument, se folosește MDL (comportament vechi / liste fără monedă).
 */
export function formatPrice(amount: number, locale: string, currency: PriceCurrencyCode = "MDL"): string {
  return new Intl.NumberFormat(numberFormatLocale(locale, currency), {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}
