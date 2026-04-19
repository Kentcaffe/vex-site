import { getTranslations, setRequestLocale } from "next-intl/server";
import { ForgotPasswordForm } from "@/components/ForgotPasswordForm";
import { isSupabaseAuthConfigured } from "@/lib/supabase-auth-server";
import { Link } from "@/i18n/navigation";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function ForgotPasswordPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Auth");
  const authOk = isSupabaseAuthConfigured();

  return (
    <div className="mx-auto max-w-md px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold tracking-tight">{t("forgotTitle")}</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">{t("forgotSubtitle")}</p>
      {!authOk ? (
        <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
          {t("resetMailNotConfigured")}
        </p>
      ) : null}
      <div className="mt-8">
        <ForgotPasswordForm disabled={!authOk} />
      </div>
      <p className="mt-6 text-center text-xs text-zinc-500 dark:text-zinc-400">{t("resetOAuthHint")}</p>
      <p className="mt-4 text-center text-sm">
        <Link href="/cont" className="text-emerald-700 hover:underline dark:text-emerald-400">
          ← {t("backToLogin")}
        </Link>
      </p>
    </div>
  );
}
