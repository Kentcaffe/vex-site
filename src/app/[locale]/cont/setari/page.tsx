import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { AccountSettingsView } from "@/components/account-settings/AccountSettingsView";
import { Link } from "@/i18n/navigation";
import { type UserForAccountPage, userForAccountPageSelect } from "@/lib/prisma-account-settings";
import { parseSellerContactFromPreferences } from "@/lib/seller-contact-preferences";
import { parsePreferences } from "@/lib/user-preferences";
import { prisma } from "@/lib/prisma";
import { localizedHref } from "@/lib/paths";
import { siteUrl } from "@/lib/seo";

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
      id: true,
      isVerified: true,
      accountType: true,
      businessStatus: true,
      _count: {
        select: {
          listings: { where: { isDeleted: false } },
        },
      },
    },
  })) as
    | (UserForAccountPage & {
        id: string;
        isVerified: boolean;
        accountType: string;
        businessStatus: string;
        _count: { listings: number };
      })
    | null;

  if (!me) notFound();

  const t = await getTranslations("AccountHub");

  const publicProfileUrl =
    me.accountType === "business" && me.businessStatus === "approved"
      ? `${siteUrl()}${localizedHref(locale, `/firm/${me.id}`)}`
      : `${siteUrl()}${localizedHref(locale, "/anunturi")}`;

  return (
    <div className="app-shell app-section bg-[#f8fafc]">
      <Link
        href="/cont"
        className="mb-6 inline-flex text-sm font-semibold text-emerald-800 hover:underline"
      >
        ← {t("backToAccount")}
      </Link>
      <AccountSettingsView
        key={me.updatedAt.toISOString()}
        locale={locale}
        publicProfileUrl={publicProfileUrl}
        user={{
          email: me.email,
          name: me.name,
          phone: me.phone,
          city: me.city,
          bio: me.bio,
          avatarUrl: me.avatarUrl,
          createdAt: me.createdAt.toISOString(),
          updatedAt: me.updatedAt.toISOString(),
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
