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
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">{t("subtitle")}</p>
      <div className="mt-8">
        <AuthForms oauth={oauth} />
      </div>
    </div>
  );
}
