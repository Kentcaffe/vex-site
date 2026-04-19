import { useLocale, useTranslations } from "next-intl";
import { accountLabelClass, accountSelectClass } from "@/components/account-settings/account-ui-classes";
import { SectionShell } from "@/components/account-settings/SectionShell";
import { routing } from "@/i18n/routing";
import type { UserPrefsShape } from "@/lib/user-preferences";
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
          className="inline-flex min-h-[44px] min-w-[120px] items-center justify-center rounded-xl bg-[#0b57d0] px-5 text-sm font-semibold text-white shadow-sm hover:bg-[#0842a0]"
        >
          {t("preferences.save")}
        </button>
      </div>
    </SectionShell>
  );
}
