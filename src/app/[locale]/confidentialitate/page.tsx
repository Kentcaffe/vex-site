import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";

type Props = { params: Promise<{ locale: string }> };

export default async function ConfidentialitatePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Legal.privacy");

  const blocks = ["p1", "p2", "p3", "p4", "p5", "p6"] as const;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Link href="/" className="text-sm font-medium text-emerald-700 hover:underline dark:text-emerald-400">
        ← {t("back")}
      </Link>
      <h1 className="mt-6 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">{t("title")}</h1>
      <p className="mt-2 text-sm text-zinc-500">{t("updated")}</p>
      <div className="mt-8 space-y-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        {blocks.map((key) => (
          <p key={key}>
            {t(key)}
          </p>
        ))}
      </div>
    </div>
  );
}
