import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

const CATEGORY_SLUGS = ["vehicule", "imobiliare", "electronice", "moda", "servicii"] as const;

const CAT_MSG = {
  vehicule: "cat_vehicule",
  imobiliare: "cat_imobiliare",
  electronice: "cat_electronice",
  moda: "cat_moda",
  servicii: "cat_servicii",
} as const;

export async function HomeLanding() {
  const t = await getTranslations("Home");

  return (
    <>
      <section className="relative overflow-hidden border-b border-zinc-200/80 bg-zinc-50 dark:border-zinc-800/80 dark:bg-zinc-950">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(16,185,129,0.22),transparent)] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(16,185,129,0.12),transparent)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35] dark:opacity-[0.2]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2391818a' fill-opacity='0.22'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-16 sm:px-6 sm:pb-24 sm:pt-20">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-400">
            {t("badge")}
          </p>
          <h1 className="mx-auto mt-4 max-w-3xl text-center text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl sm:leading-tight">
            {t("title")}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-center text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
            {t("subtitle")}
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/anunturi"
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-emerald-600 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/25 transition hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
            >
              {t("browse")}
            </Link>
            <Link
              href="/publica"
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-zinc-300 bg-white/80 px-8 py-3 text-sm font-semibold text-zinc-900 backdrop-blur transition hover:bg-white dark:border-zinc-600 dark:bg-zinc-900/80 dark:text-zinc-100 dark:hover:bg-zinc-800"
            >
              {t("publish")}
            </Link>
          </div>
          <dl className="mx-auto mt-16 grid max-w-3xl grid-cols-1 gap-6 border-t border-zinc-200/80 pt-10 sm:grid-cols-3 dark:border-zinc-800/80">
            <div className="text-center">
              <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">{t("stat1Label")}</dt>
              <dd className="mt-1 text-2xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">{t("stat1Value")}</dd>
            </div>
            <div className="text-center">
              <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">{t("stat2Label")}</dt>
              <dd className="mt-1 text-2xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">{t("stat2Value")}</dd>
            </div>
            <div className="text-center">
              <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">{t("stat3Label")}</dt>
              <dd className="mt-1 text-2xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">{t("stat3Value")}</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">{t("exploreTitle")}</h2>
          <p className="mx-auto mt-2 max-w-2xl text-zinc-600 dark:text-zinc-400">{t("exploreSubtitle")}</p>
        </div>
        <ul className="mt-10 flex flex-wrap justify-center gap-3">
          {CATEGORY_SLUGS.map((slug) => (
            <li key={slug}>
              <Link
                href={`/anunturi?category=${slug}`}
                className="inline-flex rounded-full border border-zinc-200 bg-white px-5 py-2.5 text-sm font-medium text-zinc-800 shadow-sm transition hover:border-emerald-500/50 hover:bg-emerald-50/80 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-emerald-500/40 dark:hover:bg-emerald-950/40"
              >
                {t(CAT_MSG[slug])}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="border-y border-zinc-200 bg-white py-16 dark:border-zinc-800 dark:bg-zinc-900/40">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-center text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">{t("howTitle")}</h2>
          <ol className="mt-12 grid gap-8 md:grid-cols-3">
            <li className="relative rounded-2xl border border-zinc-200 bg-zinc-50/80 p-6 dark:border-zinc-700 dark:bg-zinc-950/50">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white">
                1
              </span>
              <h3 className="mt-4 font-semibold text-zinc-900 dark:text-zinc-50">{t("how1Title")}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{t("how1Body")}</p>
            </li>
            <li className="relative rounded-2xl border border-zinc-200 bg-zinc-50/80 p-6 dark:border-zinc-700 dark:bg-zinc-950/50">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white">
                2
              </span>
              <h3 className="mt-4 font-semibold text-zinc-900 dark:text-zinc-50">{t("how2Title")}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{t("how2Body")}</p>
            </li>
            <li className="relative rounded-2xl border border-zinc-200 bg-zinc-50/80 p-6 dark:border-zinc-700 dark:bg-zinc-950/50">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white">
                3
              </span>
              <h3 className="mt-4 font-semibold text-zinc-900 dark:text-zinc-50">{t("how3Title")}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{t("how3Body")}</p>
            </li>
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="text-center text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">{t("trustTitle")}</h2>
        <ul className="mt-10 grid gap-6 md:grid-cols-3">
          <li className="flex gap-4 rounded-2xl border border-transparent p-2">
            <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </span>
            <div>
              <p className="font-semibold text-zinc-900 dark:text-zinc-50">{t("trust1Title")}</p>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{t("trust1Body")}</p>
            </div>
          </li>
          <li className="flex gap-4 rounded-2xl border border-transparent p-2">
            <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </span>
            <div>
              <p className="font-semibold text-zinc-900 dark:text-zinc-50">{t("trust2Title")}</p>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{t("trust2Body")}</p>
            </div>
          </li>
          <li className="flex gap-4 rounded-2xl border border-transparent p-2">
            <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </span>
            <div>
              <p className="font-semibold text-zinc-900 dark:text-zinc-50">{t("trust3Title")}</p>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{t("trust3Body")}</p>
            </div>
          </li>
        </ul>
      </section>

      <section className="border-t border-zinc-200 bg-gradient-to-b from-emerald-600 to-emerald-700 py-16 text-white dark:from-emerald-800 dark:to-emerald-900">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="text-2xl font-bold tracking-tight">{t("ctaTitle")}</h2>
          <p className="mt-3 text-emerald-50/95">{t("ctaSubtitle")}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/anunturi"
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-white px-8 py-3 text-sm font-semibold text-emerald-800 shadow hover:bg-emerald-50"
            >
              {t("browse")}
            </Link>
            <Link
              href="/publica"
              className="inline-flex min-h-11 items-center justify-center rounded-xl border-2 border-white/80 bg-transparent px-8 py-3 text-sm font-semibold text-white hover:bg-white/10"
            >
              {t("publish")}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
