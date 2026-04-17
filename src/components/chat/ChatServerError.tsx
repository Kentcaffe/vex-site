import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

/** Fallback când încărcarea datelor chat eșuează pe server — nu aruncă excepții către RSC. */
export async function ChatServerError() {
  const t = await getTranslations("Chat");
  return (
    <div className="app-shell app-section max-w-4xl w-full min-w-0">
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center dark:border-amber-900/50 dark:bg-amber-950/30">
        <p className="text-base font-semibold text-amber-950 dark:text-amber-100">{t("loadError")}</p>
        <Link href="/chat" className="btn-primary mt-5 inline-flex justify-center">
          {t("backToInbox")}
        </Link>
      </div>
    </div>
  );
}
