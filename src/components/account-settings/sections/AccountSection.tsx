import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { accountDangerInputClass } from "@/components/account-settings/account-ui-classes";
import { exportUserDataAction } from "@/app/actions/account-settings";
import { SignOutButton } from "@/components/SignOutButton";
import { SectionShell } from "@/components/account-settings/SectionShell";
import { useToast } from "@/components/ui/SimpleToast";
import { Link } from "@/i18n/navigation";

type Props = {
  locale: string;
  delAction: (formData: FormData) => void;
  delPending: boolean;
};

export function AccountSection({ locale, delAction, delPending }: Props) {
  const t = useTranslations("AccountSettings");
  const tAccount = useTranslations("Account");
  const { toast } = useToast();
  const [exporting, startExport] = useTransition();

  return (
    <SectionShell kicker={t("nav.account")} title={t("account.heading")} lead={t("account.lead")}>
      <div className="flex flex-col gap-3 rounded-xl border border-zinc-100 bg-zinc-50/40 p-4 dark:border-zinc-800 dark:bg-zinc-950/30 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{tAccount("accountActions")}</p>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/cont/notificari"
            className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-800 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            {tAccount("linkNotifications")}
          </Link>
          <Link
            href="/cont/favorite"
            className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-800 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            {tAccount("linkFavorites")}
          </Link>
          <Link
            href="/cont/raporteaza"
            className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-800 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            {tAccount("linkReportContent")}
          </Link>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
        <button
          type="button"
          disabled={exporting}
          onClick={() => {
            startExport(async () => {
              const r = await exportUserDataAction();
              if (r.ok) {
                const blob = new Blob([r.json], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `vex-export-${Date.now()}.json`;
                a.click();
                URL.revokeObjectURL(url);
                toast("success", t("toast.exported"));
              } else {
                toast("error", t("toast.error"));
              }
            });
          }}
          className="inline-flex items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-800 shadow-sm hover:bg-zinc-50 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
        >
          {exporting ? t("account.exporting") : t("account.export")}
        </button>
        <div className="inline-flex items-center">
          <SignOutButton className="rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-800 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800">
            {t("account.logout")}
          </SignOutButton>
        </div>
      </div>

      <div className="mt-10 border-t border-red-100 pt-8 dark:border-red-900/30">
        <h3 className="text-lg font-semibold text-red-700 dark:text-red-400">{t("account.deleteTitle")}</h3>
        <p className="mt-2 max-w-xl text-sm text-red-600/90 dark:text-red-300/90">{t("account.deleteWarning")}</p>
        <form action={delAction} className="mt-4 max-w-md space-y-3">
          <input type="hidden" name="locale" value={locale} />
          <input
            name="confirm"
            placeholder={t("account.deletePlaceholder")}
            className={accountDangerInputClass}
            autoComplete="off"
          />
          <button
            type="submit"
            disabled={delPending}
            className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
          >
            {delPending ? t("account.deleting") : t("account.deleteButton")}
          </button>
        </form>
      </div>
    </SectionShell>
  );
}
