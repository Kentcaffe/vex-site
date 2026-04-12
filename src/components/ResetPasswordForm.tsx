"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { completePasswordReset, type CompleteResetState } from "@/app/actions/password-reset";

type Props = {
  token: string;
};

export function ResetPasswordForm({ token }: Props) {
  const t = useTranslations("Auth");
  const [state, action, pending] = useActionState(completePasswordReset, undefined as CompleteResetState | undefined);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="token" value={token} />
      <div>
        <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400" htmlFor="new-password">
          {t("passwordMin")}
        </label>
        <input
          id="new-password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400" htmlFor="confirm-password">
          {t("resetConfirmPassword")}
        </label>
        <input
          id="confirm-password"
          name="confirm"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950"
        />
      </div>
      {state?.ok === false ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {state.error === "invalidToken"
            ? t("resetInvalidToken")
            : state.error === "expired"
              ? t("resetExpired")
              : state.error === "mismatch"
                ? t("resetMismatch")
                : t("validationError")}
        </p>
      ) : null}
      {state?.ok === true ? (
        <p className="text-sm text-emerald-700 dark:text-emerald-400" role="status">
          {t("resetPasswordSuccess")}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending || state?.ok === true}
        className="w-full rounded-lg bg-emerald-600 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
      >
        {pending ? t("resetSaving") : t("resetPasswordSubmit")}
      </button>
      <p className="text-center text-sm">
        <Link href="/cont" className="font-medium text-emerald-700 hover:underline dark:text-emerald-400">
          {t("backToLogin")}
        </Link>
      </p>
    </form>
  );
}
