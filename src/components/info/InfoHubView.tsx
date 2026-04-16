import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

type HubLink = { href: string; labelKey: string };

type Props = {
  locale: string;
  variant: "ajutor" | "siguranta";
  links: HubLink[];
};

export async function InfoHubView({ locale, variant, links }: Props) {
  const tFooter = await getTranslations({ locale, namespace: "Footer" });
  const t = await getTranslations({ locale, namespace: "InfoArticle" });

  const title = variant === "ajutor" ? t("hubHelpTitle") : t("hubSafetyTitle");
  const intro = variant === "ajutor" ? t("hubHelpIntro") : t("hubSafetyIntro");

  return (
    <div className="app-shell app-section max-w-4xl overflow-x-clip">
      <nav className="mb-10 text-sm text-zinc-500 dark:text-zinc-400" aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <li>
            <Link href="/" className="transition-colors hover:text-emerald-600 dark:hover:text-emerald-400">
              {t("breadcrumbHome")}
            </Link>
          </li>
          <li className="text-zinc-300 dark:text-zinc-600" aria-hidden>
            /
          </li>
          <li className="font-medium text-zinc-700 dark:text-zinc-200">{title}</li>
        </ol>
      </nav>

      <header className="mb-12 border-b border-zinc-200/90 pb-10 dark:border-zinc-800">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">{title}</h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-zinc-600 dark:text-zinc-400">{intro}</p>
      </header>

      <ul className="space-y-4">
        {links.map((item) => (
          <li key={item.href}>
            <Link href={item.href} className="surface-card group flex min-h-[56px] items-start justify-between gap-4 px-5 py-4 text-base font-medium leading-snug text-zinc-800 transition active:scale-[0.99] dark:text-zinc-100 lg:hover:border-emerald-300/80 lg:hover:bg-emerald-50/50 lg:dark:hover:border-emerald-700 lg:dark:hover:bg-emerald-950/30">
              <span>{tFooter(item.labelKey)}</span>
              <span className="text-emerald-600 transition group-hover:translate-x-0.5 dark:text-emerald-400" aria-hidden>
                →
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
