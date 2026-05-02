import type { UserRole } from "@prisma/client";

export function isStaff(role: UserRole | undefined): boolean {
  return role === "MODERATOR" || role === "ADMIN";
}

export function isAdmin(role: UserRole | undefined): boolean {
  return role === "ADMIN";
}

/** Pagina /tester și raportarea: testeri + staff (`isStaff`: moderator, admin). */
export function canAccessTesterDashboard(role: unknown): boolean {
  const v = String(role ?? "").toUpperCase();
  if (v === "TESTER") return true;
  return isStaff(v as UserRole);
}
