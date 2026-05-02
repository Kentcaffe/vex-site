import { Prisma, UserRole } from "@prisma/client";
import { setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { TesterChatClient } from "@/components/tester/TesterChatClient";
import { canAccessTesterDashboard } from "@/lib/auth-roles";
import { normalizeTesterLevel } from "@/lib/tester-level";
import { localizedHref } from "@/lib/paths";
import { prisma } from "@/lib/prisma";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function TesterChatPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await auth();
  const role = session?.user?.role;
  const supabaseUserId = session?.user?.supabaseUserId;

  if (!session?.user?.id || !supabaseUserId) {
    redirect(localizedHref(locale, "/cont"));
  }
  if (!canAccessTesterDashboard(role)) {
    redirect(localizedHref(locale, "/"));
  }

  const levelRows = await prisma.$queryRaw<Array<{ tester_level: string }>>(
    Prisma.sql`SELECT tester_level FROM users WHERE id = ${session.user.id} LIMIT 1`,
  );
  const myTesterLevel = normalizeTesterLevel(levelRows[0]?.tester_level);

  return (
    <TesterChatClient
      locale={locale}
      supabaseUserId={supabaseUserId}
      displayName={session.user.name?.trim() || session.user.email}
      userRole={String(role)}
      appRole={role ?? UserRole.USER}
      myTesterLevel={myTesterLevel}
      avatarUrl={session.user.image ?? null}
    />
  );
}
