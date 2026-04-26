import type { Prisma } from "@prisma/client";

export type ThemePref = "light" | "dark" | "system";

export type UserPrefsShape = {
  notifyEmail: boolean;
  notifyPush: boolean;
  notifyMessages: boolean;
  theme: ThemePref;
  currency: string;
  profileVisibility: "everyone" | "registered" | "minimal";
  showEmailPublic: boolean;
  showPhonePublic: boolean;
  twoFactorEnabled: boolean;
  /** Last few UI-relevant events (best-effort, not a security audit log). */
  activityLog: Array<{ at: string; action: string; detail?: string }>;
};

export const defaultUserPreferences: UserPrefsShape = {
  notifyEmail: true,
  notifyPush: true,
  notifyMessages: true,
  theme: "light",
  currency: "MDL",
  profileVisibility: "registered",
  showEmailPublic: false,
  showPhonePublic: false,
  twoFactorEnabled: false,
  activityLog: [],
};

export function parsePreferences(raw: Prisma.JsonValue | null | undefined): UserPrefsShape {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { ...defaultUserPreferences };
  }
  const o = raw as Record<string, unknown>;
  return {
    notifyEmail: typeof o.notifyEmail === "boolean" ? o.notifyEmail : defaultUserPreferences.notifyEmail,
    notifyPush: typeof o.notifyPush === "boolean" ? o.notifyPush : defaultUserPreferences.notifyPush,
    notifyMessages: typeof o.notifyMessages === "boolean" ? o.notifyMessages : defaultUserPreferences.notifyMessages,
    theme: "light",
    currency: typeof o.currency === "string" && o.currency.length > 0 ? o.currency : defaultUserPreferences.currency,
    profileVisibility:
      o.profileVisibility === "everyone" || o.profileVisibility === "registered" || o.profileVisibility === "minimal"
        ? o.profileVisibility
        : defaultUserPreferences.profileVisibility,
    showEmailPublic:
      typeof o.showEmailPublic === "boolean" ? o.showEmailPublic : defaultUserPreferences.showEmailPublic,
    showPhonePublic:
      typeof o.showPhonePublic === "boolean" ? o.showPhonePublic : defaultUserPreferences.showPhonePublic,
    twoFactorEnabled:
      typeof o.twoFactorEnabled === "boolean" ? o.twoFactorEnabled : defaultUserPreferences.twoFactorEnabled,
    activityLog: Array.isArray(o.activityLog)
      ? o.activityLog
          .filter((e): e is { at: string; action: string; detail?: string } => {
            return (
              e !== null &&
              typeof e === "object" &&
              typeof (e as { at?: unknown }).at === "string" &&
              typeof (e as { action?: unknown }).action === "string"
            );
          })
          .slice(-20)
      : [],
  };
}

export function mergePreferences(
  current: UserPrefsShape,
  patch: Partial<UserPrefsShape>,
): UserPrefsShape {
  const out: UserPrefsShape = { ...current };
  (Object.entries(patch) as [keyof UserPrefsShape, UserPrefsShape[keyof UserPrefsShape]][]).forEach(([k, v]) => {
    if (v !== undefined && k !== "activityLog") {
      (out as Record<string, unknown>)[k] = v;
    }
  });
  return out;
}

export function pushActivity(prefs: UserPrefsShape, action: string, detail?: string): UserPrefsShape {
  const entry = { at: new Date().toISOString(), action, detail };
  const next = [...prefs.activityLog, entry].slice(-25);
  return { ...prefs, activityLog: next };
}
