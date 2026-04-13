import { useLocale, useTranslations } from "next-intl";
import { SectionShell } from "@/components/account-settings/SectionShell";
import type { UserPrefsShape } from "@/lib/user-preferences";

type Props = {
  memberSince: string;
  activityLog: UserPrefsShape["activityLog"];
};

export function ActivitySection({ memberSince, activityLog }: Props) {
  const t = useTranslations("AccountSettings");
  const uiLocale = useLocale();

  return (
    <SectionShell kicker={t("nav.activity")} title={t("activity.heading")} lead={t("activity.lead")}>
      <p className="text-sm text-zinc-500">
        {t("activity.memberSince")}: <span className="font-medium text-zinc-800 dark:text-zinc-200">{memberSince}</span>
      </p>
      {activityLog.length === 0 ? (
        <p className="mt-6 rounded-xl border border-dashed border-zinc-200 px-4 py-8 text-center text-sm text-zinc-500 dark:border-zinc-700">
          {t("activity.empty")}
        </p>
      ) : (
        <ul className="mt-4 max-h-80 space-y-2 overflow-auto">
          {[...activityLog].reverse().map((e, i) => (
            <li
              key={`${e.at}-${i}`}
              className="flex flex-col gap-0.5 rounded-xl border border-zinc-100 bg-zinc-50/80 px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950/50"
            >
              <span className="font-medium text-zinc-800 dark:text-zinc-200">{e.action}</span>
              {e.detail ? <span className="text-xs text-zinc-500">{e.detail}</span> : null}
              <span className="text-[11px] text-zinc-400">{new Date(e.at).toLocaleString(uiLocale)}</span>
            </li>
          ))}
        </ul>
      )}
    </SectionShell>
  );
}
