import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminBugsPanel } from "@/components/admin/AdminBugsPanel";
import { isAdmin } from "@/lib/auth-roles";
import { localizedHref } from "@/lib/paths";
import { listAllBugsForAdmin, listLeaderboard } from "@/lib/tester-bugs";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AdminBugsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Admin");
  const session = await auth();
  if (!session?.user?.id) {
    redirect(localizedHref(locale, "/cont"));
  }
  if (!isAdmin(session.user.role)) {
    redirect(localizedHref(locale, "/admin"));
  }

  const [bugs, leaderboard] = await Promise.all([listAllBugsForAdmin(), listLeaderboard(12)]);

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Bug Triage</h1>
      <p className="mt-2 max-w-2xl text-zinc-600 dark:text-zinc-400">
        Admin panel pentru moderarea rapoartelor din Tester Dashboard.
      </p>
      <div className="mt-6">
        <AdminBugsPanel bugs={bugs} leaderboard={leaderboard} />
      </div>
      <p className="mt-4 text-xs text-zinc-500 dark:text-zinc-400">{t("shellTitle")} · tester moderation</p>
    </div>
  );
}

