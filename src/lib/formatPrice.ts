export function formatPrice(amount: number, locale: string): string {
  return new Intl.NumberFormat(locale === "en" ? "en-GB" : locale, {
    style: "currency",
    currency: "RON",
    maximumFractionDigits: 0,
  }).format(amount);
}
