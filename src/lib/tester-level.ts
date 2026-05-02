import type { UserRole } from "@prisma/client";
import { isStaff } from "@/lib/auth-roles";

export const TESTER_LEVEL_VALUES = ["trial", "tester", "advanced", "lead"] as const;
export type TesterLevel = (typeof TESTER_LEVEL_VALUES)[number];

/** Normalizează valoarea din DB / formular; valori necunoscute → trial. */
export function normalizeTesterLevel(raw: string | null | undefined): TesterLevel {
  const v = String(raw ?? "trial").toLowerCase().trim();
  if (v === "trial" || v === "tester" || v === "advanced" || v === "lead") {
    return v;
  }
  return "trial";
}

/** Denumiri afișate în română (cerință produs). */
export function testerLevelLabelRo(level: TesterLevel): string {
  switch (level) {
    case "trial":
      return "Tester Începător";
    case "tester":
      return "Tester";
    case "advanced":
      return "Tester Avansat";
    case "lead":
      return "Coordonator Testare";
    default:
      return "Tester Începător";
  }
}

/** Clase Tailwind pentru badge (trial gri, tester albastru, advanced mov, lead galben). */
export function testerLevelBadgeClasses(level: TesterLevel): string {
  switch (level) {
    case "trial":
      return "border border-zinc-300 bg-zinc-100 text-zinc-800";
    case "tester":
      return "border border-sky-300 bg-sky-100 text-sky-900";
    case "advanced":
      return "border border-violet-300 bg-violet-100 text-violet-900";
    case "lead":
      return "border border-amber-300 bg-amber-100 text-amber-950";
    default:
      return "border border-zinc-300 bg-zinc-100 text-zinc-800";
  }
}

/** trial: doar citește chatul. Staff (mod/admin) poate mereu trimite. */
export function canTesterSendChatMessage(level: TesterLevel, appRole: UserRole | undefined): boolean {
  if (isStaff(appRole)) return true;
  return level !== "trial";
}

/** advanced + lead: șterg mesaje; mod/admin pot șterge oricum. */
export function canTesterDeleteChatMessages(level: TesterLevel, appRole: UserRole | undefined): boolean {
  if (isStaff(appRole)) return true;
  return level === "advanced" || level === "lead";
}

/** lead + admin: moderare completă (inclusiv update conținut, dacă există UI). */
export function canTesterLeadModerateChat(level: TesterLevel, appRole: UserRole | undefined): boolean {
  if (appRole === "ADMIN") return true;
  return level === "lead";
}
