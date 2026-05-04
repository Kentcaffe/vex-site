import type { UserRole } from "@prisma/client";

export function isStaff(role: UserRole | undefined): boolean {
  return role === "MODERATOR" || role === "ADMIN";
}

export function isAdmin(role: UserRole | undefined): boolean {
  return role === "ADMIN";
}

/** Rol strict TESTER (program /tester/dashboard etc.). */
export function isTesterRole(role: unknown): boolean {
  return String(role ?? "").toUpperCase() === "TESTER";
}

/**
 * Panoul `/tester/*` (workspace): testeri + staff (ADMIN, MODERATOR) au acces complet fără pași extra.
 */
export function canAccessTesterDashboard(role: unknown): boolean {
  const v = String(role ?? "").toUpperCase() as UserRole;
  return isTesterRole(v) || isStaff(v);
}

/** Chat tester + unele API-uri: testeri și personal moderare. */
export function canAccessTesterChat(role: unknown): boolean {
  const v = String(role ?? "").toUpperCase() as UserRole;
  return isTesterRole(v) || isStaff(v);
}
