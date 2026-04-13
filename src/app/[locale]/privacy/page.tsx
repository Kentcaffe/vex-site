import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata(): Promise<Metadata> {
  const title = "Privacy Policy | VEX";
  const description =
    "How vex.md collects and uses account data from Google or Facebook login. We do not sell your data. Contact: contact@vex.md.";
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

export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Legal.privacy");

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Link href="/" className="text-sm font-medium text-emerald-700 hover:underline dark:text-emerald-400">
        ← {t("back")}
      </Link>
      <h1 className="mt-6 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Privacy Policy</h1>
      <p className="mt-2 text-sm text-zinc-500">{t("updated")}</p>
      <div className="mt-8 space-y-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        <p className="font-semibold text-zinc-800 dark:text-zinc-200">Privacy Policy</p>
        <p>
          This website (vex.md) collects basic user data such as name, email address, and profile information when users
          log in using Google or Facebook.
        </p>
        <p>
          We use this data only for authentication and improving user experience. We do not sell or share your data with
          third parties.
        </p>
        <p>All data is stored securely.</p>
        <p>
          Contact:{" "}
          <a href="mailto:contact@vex.md" className="font-medium text-emerald-700 underline hover:no-underline dark:text-emerald-400">
            contact@vex.md
          </a>
        </p>
      </div>
    </div>
  );
}
