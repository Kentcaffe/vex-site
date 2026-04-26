import { setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { TesterDashboardClient } from "@/components/tester/TesterDashboardClient";
import { localizedHref } from "@/lib/paths";
import { isTesterLikeRole, listOwnBugs } from "@/lib/tester-bugs";

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
  if (!isTesterLikeRole(role)) {
    redirect(localizedHref(locale, "/"));
  }

  const bugs = await listOwnBugs(supabaseUserId);

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-zinc-950 px-4 py-8 sm:px-8">
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <header className="rounded-2xl border border-zinc-800 bg-gradient-to-r from-zinc-950 via-violet-950/70 to-zinc-950 p-6 shadow-2xl shadow-black/30">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-100">Tester Dashboard 🧪</h1>
          <p className="mt-2 text-sm text-zinc-300">
            Raporteaza bug-uri, urmareste statusul si ajuta echipa Vex sa livreze o platforma mai sigura.
          </p>
        </header>
        <TesterDashboardClient bugs={bugs} />
      </div>
    </div>
  );
}

