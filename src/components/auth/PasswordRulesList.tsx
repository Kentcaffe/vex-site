"use client";

import { Check, X } from "lucide-react";
import { useTranslations } from "next-intl";
import type { PasswordRulesState } from "@/lib/auth-password-rules";

type Props = {
  rules: PasswordRulesState;
  passwordTouched: boolean;
};

export function PasswordRulesList({ rules, passwordTouched }: Props) {
  const t = useTranslations("Auth");
  const items: { key: keyof PasswordRulesState; label: string }[] = [
    { key: "min8", label: t("passwordRuleMin") },
    { key: "digit", label: t("passwordRuleDigit") },
    { key: "special", label: t("passwordRuleSpecial") },
  ];

  return (
    <ul className="space-y-2 rounded-xl border border-zinc-100 bg-zinc-50/80 px-3 py-3 text-[13px] dark:border-zinc-700/80 dark:bg-zinc-900/50">
      {items.map(({ key, label }) => {
        const ok = rules[key];
        return (
          <li key={key} className="flex items-start gap-2.5">
            <span
              className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                ok ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" : "bg-zinc-200 text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400"
              }`}
            >
              {ok ? <Check className="h-3 w-3" strokeWidth={3} /> : <X className="h-3 w-3 opacity-60" />}
            </span>
            <span
              className={
                passwordTouched || ok
                  ? ok
                    ? "text-zinc-800 dark:text-zinc-200"
                    : "text-zinc-500 dark:text-zinc-400"
                  : "text-zinc-400 dark:text-zinc-500"
              }
            >
              {label}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
