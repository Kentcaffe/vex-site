import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { AccountSettingsView } from "@/components/account-settings/AccountSettingsView";
import { AuthForms } from "@/components/AuthForms";
import { getOAuthAvailability } from "@/lib/oauth-env";
import { type UserForAccountPage, userForAccountPageSelect } from "@/lib/prisma-account-settings";
import { parsePreferences } from "@/lib/user-preferences";
import { prisma } from "@/lib/prisma";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function ContPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await auth();
  const t = await getTranslations("Account");

  if (session?.user) {
    const me = (await prisma.user.findUnique({
      where: { id: session.user.id },
      select: userForAccountPageSelect,
    })) as UserForAccountPage | null;

    if (!me) notFound();

    return (
      <AccountSettingsView
        key={me.updatedAt.toISOString()}
        locale={locale}
        user={{
          email: me.email,
          name: me.name,
          phone: me.phone,
          city: me.city,
          bio: me.bio,
          avatarUrl: me.avatarUrl,
          createdAt: me.createdAt.toISOString(),
        }}
        hasPassword={Boolean(me.passwordHash)}
        preferences={parsePreferences(me.preferences)}
      />
    );
  }

  const oauth = getOAuthAvailability();

  return (
    <div className="flex min-h-[calc(100vh-12rem)] flex-col items-center px-4 py-10 sm:px-6">
      <div className="w-full max-w-4xl">
        <header className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">{t("title")}</h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 sm:text-base">{t("subtitle")}</p>
        </header>
        <AuthForms oauth={oauth} />
      </div>
    </div>
  );
}
