import { getTranslations, setRequestLocale } from "next-intl/server";
import { ResetPasswordForm } from "@/components/ResetPasswordForm";
import { Link } from "@/i18n/navigation";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ token?: string }>;
};

export default async function ResetPasswordPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { token } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("Auth");

  if (!token || token.length < 20) {
    return (
      <div className="mx-auto max-w-md px-4 py-10 sm:px-6">
        <h1 className="text-2xl font-bold tracking-tight">{t("resetTitle")}</h1>
        <p className="mt-4 text-red-600 dark:text-red-400">{t("resetInvalidToken")}</p>
        <p className="mt-6 text-center text-sm">
          <Link href="/cont/forgot-password" className="font-medium text-emerald-700 hover:underline dark:text-emerald-400">
            {t("forgotTitle")}
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold tracking-tight">{t("resetTitle")}</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">{t("resetSubtitle")}</p>
      <div className="mt-8">
        <ResetPasswordForm token={token} />
      </div>
    </div>
  );
}
