import type { Prisma } from "@prisma/client";
import { parsePreferences } from "@/lib/user-preferences";

export function publicDisplayName(name: string | null | undefined, fallback = "User"): string {
  const safe = (name ?? "").trim();
  return safe || fallback;
}

export function canShowPublicPhone(
  preferencesRaw: Prisma.JsonValue | null | undefined,
  isViewerAuthenticated: boolean,
): boolean {
  const prefs = parsePreferences(preferencesRaw);
  if (!prefs.showPhonePublic) {
    return false;
  }
  if (prefs.profileVisibility === "minimal") {
    return false;
  }
  if (prefs.profileVisibility === "registered" && !isViewerAuthenticated) {
    return false;
  }
  return true;
}

export function canShowPublicEmail(
  preferencesRaw: Prisma.JsonValue | null | undefined,
  isViewerAuthenticated: boolean,
): boolean {
  const prefs = parsePreferences(preferencesRaw);
  if (!prefs.showEmailPublic) {
    return false;
  }
  if (prefs.profileVisibility === "minimal") {
    return false;
  }
  if (prefs.profileVisibility === "registered" && !isViewerAuthenticated) {
    return false;
  }
  return true;
}

