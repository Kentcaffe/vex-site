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
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold tracking-tight">{t("pageTitle")}</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">{t("pageSubtitle")}</p>
      <div className="mt-8">
        <ReportOtherContentForm />
      </div>
      <p className="mt-8 text-center text-sm">
        <Link href="/cont" className="text-emerald-700 hover:underline dark:text-emerald-400">
          ← {t("backToAccount")}
        </Link>
      </p>
    </div>
  );
}
