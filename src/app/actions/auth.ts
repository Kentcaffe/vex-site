"use server";

import { redirect } from "next/navigation";
import { signOut } from "@/auth";
import { routing } from "@/i18n/routing";
import { localizedHref } from "@/lib/paths";

/** Logout via server action to keep auth cookies consistent in production. */
export async function logout(formData: FormData) {
  const raw = String(formData.get("locale") ?? routing.defaultLocale);
  const locale = (routing.locales as readonly string[]).includes(raw) ? raw : routing.defaultLocale;
  await signOut({ redirect: false });
  redirect(localizedHref(locale, "/"));
}
