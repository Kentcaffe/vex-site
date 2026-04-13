import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata(): Promise<Metadata> {
  const title = "Data Deletion | VEX";
  const description =
    "Request deletion of your data from vex.md by emailing contact@vex.md. We process requests within 48 hours.";
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export default async function DataDeletionPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Legal.terms");

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Link href="/" className="text-sm font-medium text-emerald-700 hover:underline dark:text-emerald-400">
        ← {t("back")}
      </Link>
      <h1 className="mt-6 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Data Deletion</h1>
      <p className="mt-2 text-sm text-zinc-500">vex.md</p>
      <div className="mt-8 space-y-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        <p className="font-semibold text-zinc-800 dark:text-zinc-200">Data Deletion Instructions</p>
        <p>If you want your data deleted from vex.md, send a request to:</p>
        <p>
          <a href="mailto:contact@vex.md" className="font-medium text-emerald-700 underline hover:no-underline dark:text-emerald-400">
            contact@vex.md
          </a>
        </p>
        <p>We will delete your data within 48 hours.</p>
      </div>
    </div>
  );
}
