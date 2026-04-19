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
      <nav className="mb-10 text-sm text-zinc-600" aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <li>
            <Link href="/" className="font-medium text-zinc-800 transition-colors hover:text-emerald-700">
              {t("breadcrumbHome")}
            </Link>
          </li>
          <li className="text-zinc-400" aria-hidden>
            /
          </li>
          <li className="font-semibold text-zinc-900">{title}</li>
        </ol>
      </nav>

      <header className="mb-12 border-b border-zinc-200 pb-10">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl">{title}</h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-zinc-700">{intro}</p>
      </header>

      <ul className="space-y-3">
        {links.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="surface-card group flex min-h-[56px] items-start justify-between gap-4 border border-zinc-200/90 px-5 py-4 text-base font-semibold leading-snug text-zinc-900 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50/60 active:scale-[0.99]"
            >
              <span className="pr-2">{tFooter(item.labelKey)}</span>
              <span className="shrink-0 text-emerald-700 transition group-hover:translate-x-0.5" aria-hidden>
                →
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
