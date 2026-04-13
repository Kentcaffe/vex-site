import { useTranslations } from "next-intl";
import { SectionShell } from "@/components/account-settings/SectionShell";
import { Switch } from "@/components/account-settings/Switch";
import type { UserPrefsShape } from "@/lib/user-preferences";

type Props = {
  prefs: UserPrefsShape;
  setPrefs: React.Dispatch<React.SetStateAction<UserPrefsShape>>;
  savePrefsPatch: (patch: Partial<UserPrefsShape>) => Promise<void>;
};

export function NotificationsSection({ prefs, setPrefs, savePrefsPatch }: Props) {
  const t = useTranslations("AccountSettings");

  return (
    <SectionShell kicker={t("nav.notifications")} title={t("notifications.heading")} lead={t("notifications.lead")}>
      <div className="space-y-4">
        {(
          [
            ["notifyEmail", t("notifications.email")],
            ["notifyPush", t("notifications.push")],
            ["notifyMessages", t("notifications.messages")],
          ] as const
        ).map(([key, label]) => (
          <div
            key={key}
            className="flex items-center justify-between gap-4 rounded-xl border border-zinc-100 bg-zinc-50/50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950/40"
          >
            <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{label}</span>
            <Switch id={key} checked={prefs[key]} onChange={(v) => setPrefs((p) => ({ ...p, [key]: v }))} />
          </div>
        ))}
        <button
          type="button"
          onClick={() => void savePrefsPatch(prefs)}
          className="rounded-xl bg-[#0b57d0] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#0842a0]"
        >
          {t("notifications.save")}
        </button>
      </div>
    </SectionShell>
  );
}
