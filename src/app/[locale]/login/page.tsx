import { setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { UserRole } from "@prisma/client";
import { auth } from "@/auth";
import { localizedHref } from "@/lib/paths";
import TesterLoginClient from "./TesterLoginClient";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string }>;
};

export default async function LoginPage({ params, searchParams }: Props) {
  const { locale } = await params;
  await searchParams;
  setRequestLocale(locale);

  const session = await auth();
  if (session?.user?.id) {
    if (session.user.mustChangePassword) {
      redirect(localizedHref(locale, "/change-password"));
    }
    if (session.user.role === UserRole.TESTER) {
      redirect(localizedHref(locale, "/tester/dashboard"));
    }
  }

  const dashboardPath = localizedHref(locale, "/tester/dashboard");
  const changePasswordPath = localizedHref(locale, "/change-password");

  return (
    <main
      data-tester-login-page="true"
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#030712] px-4 py-12 text-white"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(38rem 24rem at 50% -6%, rgba(56,189,248,0.3), transparent 70%), radial-gradient(28rem 20rem at 90% 16%, rgba(59,130,246,0.24), transparent 72%), linear-gradient(to bottom, #030712 0%, #020617 50%, #01040f 100%)",
        }}
      />
      <TesterLoginClient
        dashboardPath={dashboardPath}
        changePasswordPath={changePasswordPath}
        maintenancePath="/maintenance"
      />
      <style>{`
        body:has([data-tester-login-page="true"]) header.sticky,
        body:has([data-tester-login-page="true"]) footer.mt-12,
        body:has([data-tester-login-page="true"]) nav.fixed.bottom-0 {
          display: none !important;
        }
      `}</style>
    </main>
  );
}
