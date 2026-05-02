import { setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { TesterDashboardClient } from "@/components/tester/TesterDashboardClient";
import { canAccessTesterDashboard } from "@/lib/auth-roles";
import { localizedHref } from "@/lib/paths";
import { listOwnBugs } from "@/lib/tester-bugs";

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

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-zinc-950 px-4 py-8 sm:px-8">
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <header className="rounded-2xl border border-zinc-800 bg-gradient-to-r from-zinc-950 via-violet-950/70 to-zinc-950 p-6 shadow-2xl shadow-black/30">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-100">Tester Dashboard 🧪</h1>
          <p className="mt-2 text-sm text-zinc-300">
            Raportează bug-uri, urmărește statusul și ajută echipa Vex să livreze o platformă mai stabilă și mai sigură.
          </p>
          <p className="mt-3 text-xs text-zinc-400">
            Pont: rapoartele cu pași clari de reproducere și capturi relevante sunt validate mai rapid.
          </p>
        </header>
        <TesterDashboardClient bugs={bugs} />
      </div>
    </div>
  );
}

