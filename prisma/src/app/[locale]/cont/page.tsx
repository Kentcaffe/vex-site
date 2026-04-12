import { auth } from "@/auth";
import { AuthForms } from "@/components/AuthForms";
import { getTranslations, setRequestLocale } from "next-intl/server";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function ContPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await auth();
  const t = await getTranslations("Auth");

  if (session?.user?.email) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
        <p className="rounded-2xl border border-zinc-200 bg-white p-6 text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100">
          {t("signedIn", { email: session.user.email })}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-12 sm:px-6">
      <h1 className="mb-8 text-2xl font-semibold tracking-tight">{t("login")}</h1>
      <AuthForms />
    </div>
  );
}
