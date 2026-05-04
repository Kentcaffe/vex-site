import { setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { UserRole } from "@prisma/client";
import { auth } from "@/auth";
import { AuthForms } from "@/components/AuthForms";
import { getOAuthAvailability } from "@/lib/oauth-env";
import { localizedHref } from "@/lib/paths";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string }>;
};

export default async function LoginPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const sp = await searchParams;
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

  const callbackError = typeof sp.error === "string" && sp.error.length > 0 ? sp.error : undefined;
  const oauth = getOAuthAvailability();
  const callbackUrl = localizedHref(locale, "/tester/dashboard");

  return (
    <div className="app-shell flex min-h-[calc(100vh-10rem)] flex-col items-center justify-center px-4 py-12 sm:px-6">
      <AuthForms oauth={oauth} callbackError={callbackError} callbackUrl={callbackUrl} />
    </div>
  );
}
