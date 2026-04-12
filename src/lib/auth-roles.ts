import type { UserRole } from "@prisma/client";

export function isStaff(role: UserRole | undefined): boolean {
  return role === "MODERATOR" || role === "ADMIN";
}

export function isAdmin(role: UserRole | undefined): boolean {
  return role === "ADMIN";
}
