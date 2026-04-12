"use client";

import { useLocale, useTranslations } from "next-intl";
import { logout } from "@/app/actions/auth";

export function SignOutButton() {
  const t = useTranslations("Auth");
  const locale = useLocale();

  return (
    <form action={logout}>
      <input type="hidden" name="locale" value={locale} />
      <button
        type="submit"
        className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-800 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
      >
        {t("logout")}
      </button>
    </form>
  );
}
