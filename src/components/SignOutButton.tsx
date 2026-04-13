"use client";

import type { ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import { logout } from "@/app/actions/auth";

type Props = {
  className?: string;
  children?: ReactNode;
};

export function SignOutButton({ className, children }: Props) {
  const t = useTranslations("Auth");
  const locale = useLocale();

  return (
    <form action={logout}>
      <input type="hidden" name="locale" value={locale} />
      <button
        type="submit"
        className={
          className ??
          "rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-800 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
        }
      >
        {children ?? t("logout")}
      </button>
    </form>
  );
}
