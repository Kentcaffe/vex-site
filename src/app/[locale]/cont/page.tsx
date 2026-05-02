import type { Prisma } from "@prisma/client";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { AccountHubView } from "@/components/account/AccountHubView";
import { AuthForms } from "@/components/AuthForms";
import { getOAuthAvailability } from "@/lib/oauth-env";
import { canAccessTesterDashboard } from "@/lib/auth-roles";
import { listOwnBugs } from "@/lib/tester-bugs";
import { prisma } from "@/lib/prisma";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string }>;
};

export default async function ContPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const sp = await searchParams;
  const callbackError = typeof sp.error === "string" && sp.error.length > 0 ? sp.error : undefined;
  setRequestLocale(locale);
  const session = await auth();

  if (session?.user) {
    type MeRow = {
      id: string;
      email: string;
      name: string | null;
      role: string;
      avatarUrl: string | null;
      accountType: string;
      businessStatus: string;
      companyName: string | null;
      companyLogo: string | null;
      isVerified: boolean;
    };
    const me = await prisma.user.findUnique({
      where: { id: session.user.id } as Prisma.UserWhereUniqueInput,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatarUrl: true,
        accountType: true,
        businessStatus: true,
        companyName: true,
        companyLogo: true,
        isVerified: true,
      } as unknown as Prisma.UserSelect,
    }) as MeRow | null;

    if (!me) notFound();

    const supabaseUserId = session.user.supabaseUserId;
    const testerBugs =
      canAccessTesterDashboard(me.role) && supabaseUserId ? await listOwnBugs(supabaseUserId) : undefined;

    return (
      <AccountHubView
        user={{
          email: me.email,
          id: me.id,
          name: me.name,
          role: me.role,
          avatarUrl: me.avatarUrl,
          accountType: me.accountType,
          businessStatus: me.businessStatus,
          companyName: me.companyName,
          companyLogo: me.companyLogo,
          isVerified: me.isVerified,
        }}
        testerBugs={testerBugs}
      />
    );
  }

  const oauth = getOAuthAvailability();

  return (
    <div className="app-shell flex min-h-[calc(100vh-10rem)] flex-col items-center justify-center px-4 py-12 sm:px-6">
      <AuthForms oauth={oauth} callbackError={callbackError} />
    </div>
  );
}
