import { useLocale, useTranslations } from "next-intl";
import { accountLabelClass, accountSelectClass } from "@/components/account-settings/account-ui-classes";
import { SectionShell } from "@/components/account-settings/SectionShell";
import { routing } from "@/i18n/routing";
import type { ThemePref, UserPrefsShape } from "@/lib/user-preferences";
import { usePathname, useRouter } from "@/i18n/navigation";

type Props = {
  prefs: UserPrefsShape;
  setPrefs: React.Dispatch<React.SetStateAction<UserPrefsShape>>;
  savePrefsPatch: (patch: Partial<UserPrefsShape>) => Promise<void>;
};

export function PreferencesSection({ prefs, setPrefs, savePrefsPatch }: Props) {
  const t = useTranslations("AccountSettings");
  const uiLocale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <SectionShell kicker={t("nav.preferences")} title={t("preferences.heading")} lead={t("preferences.lead")}>
      <div className="grid max-w-lg gap-6">
        <div>
          <label className={accountLabelClass}>{t("preferences.language")}</label>
          <select
            value={uiLocale}
            onChange={(e) => {
              router.replace(pathname, { locale: e.target.value });
            }}
            className={accountSelectClass}
          >
            {routing.locales.map((loc) => (
              <option key={loc} value={loc}>
                {loc.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={accountLabelClass}>{t("preferences.theme")}</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {(
              [
                ["light", t("preferences.themeLight")],
                ["dark", t("preferences.themeDark")],
                ["system", t("preferences.themeSystem")],
              ] as const
            ).map(([val, lab]) => (
              <button
                key={val}
                type="button"
                onClick={() => {
                  setPrefs((p) => ({ ...p, theme: val as ThemePref }));
                }}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                  prefs.theme === val
                    ? "bg-[#0b57d0] text-white"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
                }`}
              >
                {lab}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className={accountLabelClass}>{t("preferences.currency")}</label>
          <select
            value={prefs.currency}
            onChange={(e) => setPrefs((p) => ({ ...p, currency: e.target.value }))}
            className={accountSelectClass}
          >
            {["MDL", "EUR", "RON", "USD"].map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={() => void savePrefsPatch(prefs)}
          className="w-fit rounded-xl bg-[#0b57d0] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#0842a0]"
        >
          {t("preferences.save")}
        </button>
      </div>
    </SectionShell>
  );
}
