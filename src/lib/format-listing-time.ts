/** Timp relativ scurt pentru carduri anunț (ex. „acum 2 zile”). */
export function formatListingRelativeTime(iso: string | Date, locale: string): string {
  const date = typeof iso === "string" ? new Date(iso) : iso;
  const diffSec = Math.round((date.getTime() - Date.now()) / 1000);
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

  const absSec = Math.abs(diffSec);
  if (absSec < 60) return rtf.format(diffSec, "second");

  const diffMin = Math.round(diffSec / 60);
  if (Math.abs(diffMin) < 60) return rtf.format(diffMin, "minute");

  const diffHr = Math.round(diffMin / 60);
  if (Math.abs(diffHr) < 24) return rtf.format(diffHr, "hour");

  const diffDay = Math.round(diffHr / 24);
  if (Math.abs(diffDay) < 30) return rtf.format(diffDay, "day");

  return date.toLocaleDateString(locale, { day: "numeric", month: "short" });
}
