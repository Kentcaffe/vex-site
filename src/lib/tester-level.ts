import type { UserRole } from "@prisma/client";
import { TesterProgramLevel } from "@prisma/client";
import { isStaff } from "@/lib/auth-roles";

export const TESTER_LEVEL_VALUES: readonly TesterProgramLevel[] = [
  TesterProgramLevel.trial,
  TesterProgramLevel.tester,
  TesterProgramLevel.advanced,
  TesterProgramLevel.lead,
];

/** Alias pentru claritate în UI / chat (valori = enum Prisma / Postgres). */
export type TesterLevel = TesterProgramLevel;

/** Normalizează valoarea din DB / formular / API; valori necunoscute → trial. */
export function normalizeTesterLevel(
  raw: string | TesterProgramLevel | null | undefined,
): TesterProgramLevel {
  const v = String(raw ?? TesterProgramLevel.trial)
    .toLowerCase()
    .trim();
  switch (v) {
    case "tester":
      return TesterProgramLevel.tester;
    case "advanced":
      return TesterProgramLevel.advanced;
    case "lead":
      return TesterProgramLevel.lead;
    case "trial":
      return TesterProgramLevel.trial;
    default:
      return TesterProgramLevel.trial;
  }
}

/** Denumiri afișate în română (cerință produs). */
export function testerLevelLabelRo(level: TesterLevel): string {
  switch (level) {
    case TesterProgramLevel.trial:
      return "Tester Începător";
    case TesterProgramLevel.tester:
      return "Tester";
    case TesterProgramLevel.advanced:
      return "Tester Avansat";
    case TesterProgramLevel.lead:
      return "Coordonator Testare";
    default:
      return "Tester Începător";
  }
}

/** Clase Tailwind pentru badge (trial gri, tester albastru, advanced mov, lead galben). */
export function testerLevelBadgeClasses(level: TesterLevel): string {
  switch (level) {
    case TesterProgramLevel.trial:
      return "border border-zinc-300 bg-zinc-100 text-zinc-800";
    case TesterProgramLevel.tester:
      return "border border-sky-300 bg-sky-100 text-sky-900";
    case TesterProgramLevel.advanced:
      return "border border-violet-300 bg-violet-100 text-violet-900";
    case TesterProgramLevel.lead:
      return "border border-amber-300 bg-amber-100 text-amber-950";
    default:
      return "border border-zinc-300 bg-zinc-100 text-zinc-800";
  }
}

/** trial: doar citește chatul. Staff (mod/admin) poate mereu trimite. */
export function canTesterSendChatMessage(level: TesterLevel, appRole: UserRole | undefined): boolean {
  if (isStaff(appRole)) return true;
  return level !== TesterProgramLevel.trial;
}

/** advanced + lead: șterg mesaje; mod/admin pot șterge oricum. */
export function canTesterDeleteChatMessages(level: TesterLevel, appRole: UserRole | undefined): boolean {
  if (isStaff(appRole)) return true;
  return level === TesterProgramLevel.advanced || level === TesterProgramLevel.lead;
}

/** lead + admin: moderare completă (inclusiv update conținut, dacă există UI). */
export function canTesterLeadModerateChat(level: TesterLevel, appRole: UserRole | undefined): boolean {
  if (appRole === "ADMIN") return true;
  return level === TesterProgramLevel.lead;
}
