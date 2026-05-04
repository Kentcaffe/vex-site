import { setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { TesterWorkspaceShell } from "@/components/tester/TesterWorkspaceShell";
import { TesterWorkspaceProvider } from "@/contexts/tester-workspace-context";
import { canAccessTesterDashboard } from "@/lib/auth-roles";
import { localizedHref } from "@/lib/paths";
import { TesterSessionTracker } from "@/components/tester/TesterSessionTracker";
import { listLeaderboard, listOwnBugs } from "@/lib/tester-bugs";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function TesterWorkspaceLayout({ children, params }: Props) {
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
  if (session.user.mustChangePassword) {
    redirect(localizedHref(locale, "/change-password"));
  }

  const bugs = await listOwnBugs(supabaseUserId);
  const leaderboard = await listLeaderboard(5);

  return (
    <TesterWorkspaceProvider bugs={bugs} leaderboard={leaderboard}>
      <TesterSessionTracker />
      <TesterWorkspaceShell>{children}</TesterWorkspaceShell>
    </TesterWorkspaceProvider>
  );
}
