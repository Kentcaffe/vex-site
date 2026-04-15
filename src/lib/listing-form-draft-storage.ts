/** Ciornă formular „publică anunț” — supraviețuiește navigării între pagini (sessionStorage). */

export const LISTING_DRAFT_STORAGE_VERSION = 1 as const;

export type ListingFormDraftV1 = {
  v: typeof LISTING_DRAFT_STORAGE_VERSION;
  categoryId: string;
  imagesRaw: string;
  values: Record<string, string | boolean>;
};

export function listingDraftStorageKey(locale: string): string {
  return `vex:listing-draft:v${LISTING_DRAFT_STORAGE_VERSION}:${locale}`;
}

/** Citește tot din DOM ca să nu folosim valori învechite din closure la debounce. */
export function collectListingFormDraft(form: HTMLFormElement): ListingFormDraftV1 {
  const cat = form.elements.namedItem("categoryId");
  const img = form.elements.namedItem("imagesRaw");
  const categoryId = cat instanceof HTMLInputElement ? cat.value : "";
  const imagesRaw = img instanceof HTMLTextAreaElement ? img.value : "";

  const fd = new FormData(form);
  const values: Record<string, string | boolean> = {};
  for (const [k, v] of fd.entries()) {
    if (k === "locale") continue;
    if (typeof v !== "string") continue;
    values[k] = v;
  }
  const negotiable = form.elements.namedItem("negotiable");
  if (negotiable instanceof HTMLInputElement && negotiable.type === "checkbox") {
    values.negotiable = negotiable.checked;
  }
  return {
    v: LISTING_DRAFT_STORAGE_VERSION,
    categoryId,
    imagesRaw,
    values,
  };
}

function setField(
  form: HTMLFormElement,
  name: string,
  val: string | boolean,
): boolean {
  const el = form.elements.namedItem(name);
  if (el instanceof RadioNodeList) {
    return false;
  }
  if (el instanceof HTMLInputElement) {
    if (el.type === "checkbox") {
      el.checked = Boolean(val);
      return true;
    }
    if (el.type === "file") {
      return false;
    }
    el.value = String(val ?? "");
    return true;
  }
  if (el instanceof HTMLTextAreaElement) {
    el.value = String(val ?? "");
    return true;
  }
  if (el instanceof HTMLSelectElement) {
    el.value = String(val ?? "");
    return true;
  }
  return false;
}

/**
 * Aplică câmpuri din ciornă pe măsură ce apar în DOM (ex. detalii după schimbarea categoriei).
 * Returnează `true` dacă mai rămân chei de aplicat.
 */
export function applyListingDraftPartial(
  form: HTMLFormElement,
  draft: ListingFormDraftV1,
): { next: ListingFormDraftV1 | null } {
  const nextValues = { ...draft.values };
  for (const name of Object.keys(nextValues)) {
    const val = nextValues[name];
    if (setField(form, name, val)) {
      delete nextValues[name];
    }
  }
  const remaining = Object.keys(nextValues).length;
  if (remaining === 0) {
    return { next: null };
  }
  return { next: { ...draft, values: nextValues } };
}

export function loadListingDraftFromStorage(
  key: string,
): ListingFormDraftV1 | null {
  if (typeof sessionStorage === "undefined") {
    return null;
  }
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const data = JSON.parse(raw) as unknown;
    if (!data || typeof data !== "object") return null;
    const d = data as Partial<ListingFormDraftV1>;
    if (d.v !== LISTING_DRAFT_STORAGE_VERSION) return null;
    if (typeof d.categoryId !== "string" || typeof d.imagesRaw !== "string") return null;
    if (!d.values || typeof d.values !== "object") return null;
    return {
      v: LISTING_DRAFT_STORAGE_VERSION,
      categoryId: d.categoryId,
      imagesRaw: d.imagesRaw,
      values: d.values as Record<string, string | boolean>,
    };
  } catch {
    return null;
  }
}

export function saveListingDraftToStorage(key: string, draft: ListingFormDraftV1): void {
  try {
    sessionStorage.setItem(key, JSON.stringify(draft));
  } catch {
    /* quota / private mode */
  }
}

export function clearListingDraftStorage(key: string): void {
  try {
    sessionStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

/** Nimic de păstrat — evităm să umplem storage la formular gol. */
export function isListingDraftEffectivelyEmpty(d: ListingFormDraftV1): boolean {
  if (d.categoryId.trim().length > 0) return false;
  if (d.imagesRaw.trim().length > 0) return false;
  for (const v of Object.values(d.values)) {
    if (typeof v === "boolean") {
      if (v) return false;
    } else if (String(v ?? "").trim().length > 0) {
      return false;
    }
  }
  return true;
}
