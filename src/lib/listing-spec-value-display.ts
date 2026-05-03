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
  const normalizedRawValue = rawValue.replace(/\./g, "_");
  const bucketValueKey =
    bucket && typeof rawValue === "string"
      ? rawValue in bucket
        ? rawValue
        : normalizedRawValue in bucket
          ? normalizedRawValue
          : null
      : null;
  if (bucket && bucketValueKey) {
    const tr = bucket[bucketValueKey];
    if (typeof tr === "string" && tr.length > 0) {
      return tr;
    }
  }

  if (detailKey === "engine_l") {
    if (rawValue === "electric") {
      const tr = bucket?.electric;
      if (typeof tr === "string" && tr.length > 0) {
        return tr;
      }
      return rawValue;
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
