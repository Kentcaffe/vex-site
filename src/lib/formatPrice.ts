export function formatPrice(amount: number, locale: string): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "MDL",
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${amount} MDL`;
  }
}
