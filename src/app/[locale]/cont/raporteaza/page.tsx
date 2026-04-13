import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ReportOtherContentForm } from "@/components/ReportOtherContentForm";
import { localizedHref } from "@/lib/paths";
import { Link } from "@/i18n/navigation";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function RaporteazaContinutPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await auth();
  const t = await getTranslations("ReportOther");

  if (!session?.user) {
    redirect(localizedHref(locale, "/cont"));
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:py-14">
      <header className="mb-8 text-center sm:mb-10 sm:text-left">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">{t("pageTitle")}</h1>
        <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-zinc-600 dark:text-zinc-400 sm:mx-0">
          {t("pageSubtitle")}
        </p>
      </header>
      <ReportOtherContentForm />
      <p className="mt-10 text-center text-sm sm:text-left">
        <Link href="/cont" className="font-medium text-emerald-700 transition hover:text-emerald-800 hover:underline dark:text-emerald-400 dark:hover:text-emerald-300">
          ← {t("backToAccount")}
        </Link>
      </p>
    </div>
  );
}
