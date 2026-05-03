import type { Prisma } from "@prisma/client";

export type SellerContactWindow = "anytime" | "hours" | "no_calls";

export type SellerContactChannels = {
  phone: boolean;
  siteMessages: boolean;
  whatsapp: boolean;
  viber: boolean;
  telegram: boolean;
};

export type SellerContactPrefs = {
  district: string;
  buyerNote: string;
  channels: SellerContactChannels;
  contactWindow: SellerContactWindow;
  contactHourFrom: string;
  contactHourTo: string;
};

export const defaultSellerContactPrefs = (): SellerContactPrefs => ({
  district: "",
  buyerNote: "",
  channels: {
    phone: true,
    siteMessages: true,
    whatsapp: false,
    viber: false,
    telegram: false,
  },
  contactWindow: "anytime",
  contactHourFrom: "09:00",
  contactHourTo: "21:00",
});

function isRecord(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}

function parseChannels(raw: unknown): SellerContactChannels {
  const d = defaultSellerContactPrefs().channels;
  if (!isRecord(raw)) {
    return d;
  }
  return {
    phone: typeof raw.phone === "boolean" ? raw.phone : d.phone,
    siteMessages: typeof raw.siteMessages === "boolean" ? raw.siteMessages : d.siteMessages,
    whatsapp: typeof raw.whatsapp === "boolean" ? raw.whatsapp : d.whatsapp,
    viber: typeof raw.viber === "boolean" ? raw.viber : d.viber,
    telegram: typeof raw.telegram === "boolean" ? raw.telegram : d.telegram,
  };
}

export function parseSellerContactFromPreferences(raw: Prisma.JsonValue | null | undefined): SellerContactPrefs {
  const base = defaultSellerContactPrefs();
  if (!isRecord(raw)) {
    return base;
  }
  const sc = raw.sellerContact;
  if (!isRecord(sc)) {
    return base;
  }
  const windowRaw = sc.contactWindow;
  const contactWindow: SellerContactWindow =
    windowRaw === "hours" || windowRaw === "no_calls" || windowRaw === "anytime" ? windowRaw : "anytime";
  return {
    district: typeof sc.district === "string" ? sc.district.slice(0, 80) : base.district,
    buyerNote: typeof sc.buyerNote === "string" ? sc.buyerNote.slice(0, 320) : base.buyerNote,
    channels: parseChannels(sc.channels),
    contactWindow,
    contactHourFrom: typeof sc.contactHourFrom === "string" ? sc.contactHourFrom.slice(0, 5) : base.contactHourFrom,
    contactHourTo: typeof sc.contactHourTo === "string" ? sc.contactHourTo.slice(0, 5) : base.contactHourTo,
  };
}

export function mergeSellerContactIntoPreferencesJson(
  existing: Prisma.JsonValue | null | undefined,
  patch: Partial<SellerContactPrefs>,
): Prisma.InputJsonValue {
  const root = isRecord(existing) ? { ...existing } : {};
  const prev = parseSellerContactFromPreferences(existing);
  const next: SellerContactPrefs = {
    ...prev,
    ...patch,
    channels: { ...prev.channels, ...(patch.channels ?? {}) },
  };
  return { ...root, sellerContact: next } as Prisma.InputJsonValue;
}

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

export function normalizeTimeHHMM(v: string | undefined): string {
  const t = (v ?? "").trim();
  if (!TIME_RE.test(t)) {
    return "09:00";
  }
  return t;
}

/** Scor 0–10 pentru bara „profil complet” (euristică UI, nu verificare legală). */
export function computeSellerProfileCompletionScore(input: {
  name: string;
  phone: string;
  city: string;
  bio: string;
  avatarUrl: string;
  seller: SellerContactPrefs;
}): { score: number; max: number } {
  const max = 10;
  let score = 0;
  if (input.name.trim().length >= 2) score += 1;
  if (input.phone.trim().length >= 8) score += 1;
  if (input.city.trim().length >= 2) score += 1;
  if (input.bio.trim().length >= 15) score += 1;
  if (/^https?:\/\//i.test(input.avatarUrl.trim())) score += 1;
  if (input.seller.district.trim().length >= 1) score += 1;
  if (input.seller.buyerNote.trim().length >= 10) score += 1;
  const ch = input.seller.channels;
  const nCh = [ch.phone, ch.siteMessages, ch.whatsapp, ch.viber, ch.telegram].filter(Boolean).length;
  if (nCh >= 2) score += 1;
  if (input.seller.contactWindow === "hours") {
    if (TIME_RE.test(input.seller.contactHourFrom) && TIME_RE.test(input.seller.contactHourTo)) score += 1;
  } else {
    score += 1;
  }
  if (input.seller.buyerNote.trim().length >= 48) score += 1;
  return { score: Math.min(score, max), max };
}
