import { useTranslations } from "next-intl";
import { accountInputClass, accountLabelClass } from "@/components/account-settings/account-ui-classes";
import { SectionShell } from "@/components/account-settings/SectionShell";
import { Switch } from "@/components/account-settings/Switch";
import type { UserPrefsShape } from "@/lib/user-preferences";

type Props = {
  locale: string;
  hasPassword: boolean;
  prefs: UserPrefsShape;
  savePrefsPatch: (patch: Partial<UserPrefsShape>) => Promise<void>;
  pwAction: (formData: FormData) => void;
  pwPending: boolean;
};

export function SecuritySection({ locale, hasPassword, prefs, savePrefsPatch, pwAction, pwPending }: Props) {
  const t = useTranslations("AccountSettings");

  return (
    <SectionShell kicker={t("nav.security")} title={t("security.heading")} lead={t("security.lead")}>
      {!hasPassword ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50/80 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100">
          {t("security.oauthOnly")}
        </p>
      ) : (
        <form action={pwAction} className="max-w-md space-y-4">
          <input type="hidden" name="locale" value={locale} />
          <div>
            <label className={accountLabelClass} htmlFor="cur-pw">
              {t("security.current")}
            </label>
            <input
              id="cur-pw"
              name="currentPassword"
              type="password"
              required
              autoComplete="current-password"
              className={accountInputClass}
            />
          </div>
          <div>
            <label className={accountLabelClass} htmlFor="new-pw">
              {t("security.new")}
            </label>
            <input
              id="new-pw"
              name="newPassword"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              className={accountInputClass}
            />
          </div>
          <button
            type="submit"
            disabled={pwPending}
            className="rounded-xl bg-[#0b57d0] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#0842a0] disabled:opacity-60"
          >
            {pwPending ? t("security.changing") : t("security.change")}
          </button>
        </form>
      )}

      <div className="mt-8 border-t border-zinc-100 pt-6 dark:border-zinc-800">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{t("security.twoFactor")}</p>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">{t("security.twoFactorHint")}</p>
          </div>
          <Switch
            id="twofa"
            checked={prefs.twoFactorEnabled}
            onChange={(v) => void savePrefsPatch({ twoFactorEnabled: v })}
          />
        </div>
      </div>

      <div className="mt-8 border-t border-zinc-100 pt-6 dark:border-zinc-800">
        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{t("security.loginHistory")}</p>
        <p className="text-xs text-zinc-600 dark:text-zinc-400">{t("security.loginHistoryHint")}</p>
        <ul className="mt-4 space-y-2 text-sm">
          <li className="flex items-center justify-between rounded-xl border border-zinc-100 bg-zinc-50/80 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-950/50">
            <span className="text-zinc-600 dark:text-zinc-300">{t("security.mockDevice")}</span>
            <span className="text-xs text-zinc-400">{t("security.mockIp")}</span>
          </li>
        </ul>
      </div>
    </SectionShell>
  );
}
