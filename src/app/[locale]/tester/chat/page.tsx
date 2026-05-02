import { setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { TesterChatClient } from "@/components/tester/TesterChatClient";
import { canAccessTesterDashboard } from "@/lib/auth-roles";
import { localizedHref } from "@/lib/paths";

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

  return (
    <TesterChatClient
      locale={locale}
      supabaseUserId={supabaseUserId}
      displayName={session.user.name?.trim() || session.user.email}
      userRole={String(role)}
      avatarUrl={session.user.image ?? null}
    />
  );
}
