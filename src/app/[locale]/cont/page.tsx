import { getTranslations, setRequestLocale } from "next-intl/server";
import { auth } from "@/auth";
import { AuthForms } from "@/components/AuthForms";
import { SignOutButton } from "@/components/SignOutButton";
import { Link } from "@/i18n/navigation";

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
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/cont/favorite"
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            {t("linkFavorites")}
          </Link>
          <SignOutButton />
        </div>
      </div>
    );
  }

  const oauth = {
    google: Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET),
    facebook: Boolean(process.env.AUTH_FACEBOOK_ID && process.env.AUTH_FACEBOOK_SECRET),
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">{t("subtitle")}</p>
      <div className="mt-8">
        <AuthForms oauth={oauth} />
      </div>
    </div>
  );
}
