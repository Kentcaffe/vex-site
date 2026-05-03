import { setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { TesterDashboardClient } from "@/components/tester/TesterDashboardClient";
import { canAccessTesterDashboard } from "@/lib/auth-roles";
import { localizedHref } from "@/lib/paths";
import { listLeaderboard, listOwnBugs } from "@/lib/tester-bugs";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function TesterDashboardPage({ params }: Props) {
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

  const bugs = await listOwnBugs(supabaseUserId);
  const leaderboard = await listLeaderboard(5);

  return <TesterDashboardClient bugs={bugs} leaderboard={leaderboard} />;
}

