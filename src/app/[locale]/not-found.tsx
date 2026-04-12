import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

type Props = {
  params?: Promise<{ locale?: string }>;
};

export default async function NotFoundPage({ params }: Props) {
  const p = params ? await params : {};
  const raw = p?.locale;
  const locale =
    raw && (routing.locales as readonly string[]).includes(raw) ? raw : routing.defaultLocale;
  setRequestLocale(locale);
  const t = await getTranslations("NotFound");

  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <h1 className="text-2xl font-bold">{t("title")}</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">{t("body")}</p>
      <Link href="/" className="mt-6 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
        {t("home")}
      </Link>
    </div>
  );
}
