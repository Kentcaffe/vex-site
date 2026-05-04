import { routing } from "@/i18n/routing";

/**
 * Rute de pagină permise cât timp `must_change_password` e true în JWT/metadata.
 * Edge middleware nu poate folosi Prisma — flag-ul e sincronizat din DB în `user_metadata`.
 */
export function isMandatoryPasswordChangePageExempt(basePath: string): boolean {
  if (basePath === "/change-password" || basePath.startsWith("/change-password/")) return true;
  for (const loc of routing.locales) {
    if (basePath === `/${loc}/change-password` || basePath.startsWith(`/${loc}/change-password/`)) return true;
  }
  return false;
}

/** API-uri minime necesare pentru login + schimbare parolă obligatorie. */
export function isMandatoryPasswordChangeAllowedApi(request: Request): boolean {
  const url = new URL(request.url);
  const p = url.pathname;
  const m = request.method.toUpperCase();
  if (p === "/api/auth/password-changed" && m === "POST") return true;
  if (p === "/api/auth/session" && m === "GET") return true;
  if (p === "/api/auth/sync-user" && m === "POST") return true;
  return false;
}
