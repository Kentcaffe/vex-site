"use client";

import { useActionState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { requestPasswordReset, type RequestResetState } from "@/app/actions/password-reset";

type ForgotProps = {
  disabled?: boolean;
};

export function ForgotPasswordForm({ disabled = false }: ForgotProps) {
  const t = useTranslations("Auth");
  const locale = useLocale();
  const [state, action, pending] = useActionState(requestPasswordReset, undefined as RequestResetState | undefined);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="locale" value={locale} />
      <div>
        <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400" htmlFor="forgot-email">
          {t("email")}
        </label>
        <input
          id="forgot-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950"
          disabled={disabled}
        />
      </div>
      {state?.ok === false ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {state.error === "mailNotConfigured" ? t("resetMailNotConfigured") : t("validationError")}
        </p>
      ) : null}
      {state?.ok === true ? (
        <div className="space-y-2" role="status">
          <p className="text-sm text-emerald-700 dark:text-emerald-400">{t("resetEmailSent")}</p>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">{t("resetEmailSentHint")}</p>
        </div>
      ) : null}
      <button
        type="submit"
        disabled={pending || disabled}
        className="w-full rounded-lg bg-emerald-600 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
      >
        {pending ? t("resetSending") : t("resetRequestSubmit")}
      </button>
      <p className="text-center text-sm">
        <Link href="/cont" className="font-medium text-emerald-700 hover:underline dark:text-emerald-400">
          {t("backToLogin")}
        </Link>
      </p>
    </form>
  );
}
