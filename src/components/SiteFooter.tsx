import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export async function SiteFooter() {
  const t = await getTranslations("Footer");
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <p className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50">{t("siteName")}</p>
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{t("tagline")}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{t("explore")}</p>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link href="/anunturi" className="text-zinc-700 hover:text-emerald-600 dark:text-zinc-300 dark:hover:text-emerald-400">
                  {t("linkListings")}
                </Link>
              </li>
              <li>
                <Link href="/publica" className="text-zinc-700 hover:text-emerald-600 dark:text-zinc-300 dark:hover:text-emerald-400">
                  {t("linkPublish")}
                </Link>
              </li>
              <li>
                <Link href="/cont" className="text-zinc-700 hover:text-emerald-600 dark:text-zinc-300 dark:hover:text-emerald-400">
                  {t("linkAccount")}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{t("legal")}</p>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link href="/termeni" className="text-zinc-700 hover:text-emerald-600 dark:text-zinc-300 dark:hover:text-emerald-400">
                  {t("terms")}
                </Link>
              </li>
              <li>
                <Link href="/confidentialitate" className="text-zinc-700 hover:text-emerald-600 dark:text-zinc-300 dark:hover:text-emerald-400">
                  {t("privacy")}
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-10 flex flex-col gap-2 border-t border-zinc-200 pt-8 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-500">
          <p>{t("rights", { year })}</p>
          <p className="text-zinc-400 dark:text-zinc-600">{t("disclaimer")}</p>
        </div>
      </div>
    </footer>
  );
}
