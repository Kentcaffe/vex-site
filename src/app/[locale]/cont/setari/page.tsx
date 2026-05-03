import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { AccountSettingsView } from "@/components/account-settings/AccountSettingsView";
import { Link } from "@/i18n/navigation";
import { type UserForAccountPage, userForAccountPageSelect } from "@/lib/prisma-account-settings";
import { parseSellerContactFromPreferences } from "@/lib/seller-contact-preferences";
import { parsePreferences } from "@/lib/user-preferences";
import { prisma } from "@/lib/prisma";

type Props = { params: Promise<{ locale: string }> };

export default async function ContSetariPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await auth();
  if (!session?.user?.id) {
    notFound();
  }

  const me = (await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      ...userForAccountPageSelect,
      isVerified: true,
      _count: {
        select: {
          listings: { where: { isDeleted: false } },
        },
      },
    },
  })) as
    | (UserForAccountPage & { isVerified: boolean; _count: { listings: number } })
    | null;

  if (!me) notFound();

  const t = await getTranslations("AccountHub");

  return (
    <div className="app-shell app-section">
      <Link
        href="/cont"
        className="mb-6 inline-flex text-sm font-semibold text-emerald-800 hover:underline"
      >
        ← {t("backToAccount")}
      </Link>
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
          isVerified: me.isVerified,
          listingsCount: me._count.listings,
          sellerContact: parseSellerContactFromPreferences(me.preferences),
        }}
        hasPassword={Boolean(me.passwordHash)}
        preferences={parsePreferences(me.preferences)}
      />
    </div>
  );
}
