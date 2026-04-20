/**
 * Rezolvă afișarea valorilor de specificații fără chei i18n cu puncte rupte
 * (ex. specValue.engine_l.1.2 interpretat greșit ca path ierarhic).
 */
export function resolveListingSpecValueDisplay(
  messages: Record<string, unknown>,
  detailKey: string | undefined,
  rawValue: string,
): string {
  if (!detailKey) {
    return rawValue;
  }

  const root = messages as Record<string, unknown>;
  const listing = root.ListingDetail as Record<string, unknown> | undefined;
  const specValue = listing?.specValue as Record<string, Record<string, string>> | undefined;
  const bucket = specValue?.[detailKey];
  if (bucket && typeof rawValue === "string" && rawValue in bucket) {
    const tr = bucket[rawValue];
    if (typeof tr === "string" && tr.length > 0) {
      return tr;
    }
  }

  if (detailKey === "engine_l") {
    if (rawValue === "electric") {
      return bucket?.electric ?? "Electric";
    }
    if (/^[\d.]+$/.test(rawValue)) {
      return `${rawValue.replace(/\./g, ",")} l`;
    }
  }

  if (detailKey === "generation" || detailKey === "processor") {
    return rawValue.replace(/_/g, " ").trim();
  }

  return rawValue;
}
