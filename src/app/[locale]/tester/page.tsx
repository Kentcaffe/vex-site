import { setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { canAccessTesterDashboard } from "@/lib/auth-roles";
import { localizedHref } from "@/lib/paths";

type Props = {
  params: Promise<{ locale: string }>;
};

/** Ruta veche `/tester` redirecționează către panoul principal. */
export default async function TesterIndexPage({ params }: Props) {
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

  redirect(localizedHref(locale, "/tester/dashboard"));
}
