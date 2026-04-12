import { getTranslations, setRequestLocale } from "next-intl/server";
import { auth } from "@/auth";
import { AuthForms } from "@/components/AuthForms";
import { SignOutButton } from "@/components/SignOutButton";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function ContPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await auth();
  const t = await getTranslations("Account");

  if (session?.user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          {t("signedInAs", { email: session.user.email ?? "" })}
        </p>
        <div className="mt-6">
          <SignOutButton />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">{t("subtitle")}</p>
      <div className="mt-8">
        <AuthForms />
      </div>
    </div>
  );
}
