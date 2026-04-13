import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import type { InfoArticle } from "@/content/info-articles/types";

type Props = {
  article: InfoArticle;
  locale: string;
};

export async function InfoArticleView({ article, locale }: Props) {
  const t = await getTranslations({ locale, namespace: "InfoArticle" });
  const parentHref = article.category === "ajutor" ? "/ajutor" : "/siguranta";
  const parentLabel = article.category === "ajutor" ? t("breadcrumbHelp") : t("breadcrumbSafety");

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:py-20">
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
          <li>
            <Link
              href={parentHref}
              className="transition-colors hover:text-emerald-600 dark:hover:text-emerald-400"
            >
              {parentLabel}
            </Link>
          </li>
          <li className="text-zinc-300 dark:text-zinc-600" aria-hidden>
            /
          </li>
          <li className="font-medium text-zinc-700 dark:text-zinc-200">{article.title}</li>
        </ol>
      </nav>

      <header className="mb-14 border-b border-zinc-200/90 pb-10 dark:border-zinc-800">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
          {article.title}
        </h1>
        {article.intro ? (
          <p className="mt-6 text-base leading-relaxed text-zinc-600 dark:text-zinc-400">{article.intro}</p>
        ) : null}
      </header>

      <div className="space-y-14">
        {article.sections.map((section, si) => (
          <section key={si} className="scroll-mt-24">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 sm:text-2xl">{section.heading}</h2>
            <div className="mt-5 space-y-4 text-base leading-relaxed text-zinc-700 dark:text-zinc-300">
              {section.paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
            {section.bullets && section.bullets.length > 0 ? (
              <ul className="mt-5 list-disc space-y-2 pl-5 text-base leading-relaxed text-zinc-700 marker:text-emerald-600 dark:text-zinc-300 dark:marker:text-emerald-500">
                {section.bullets.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            ) : null}
          </section>
        ))}
      </div>
    </article>
  );
}
