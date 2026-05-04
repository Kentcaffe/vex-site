import { setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ChangePasswordForm } from "@/components/auth/ChangePasswordForm";
import { localizedHref } from "@/lib/paths";

type Props = { params: Promise<{ locale: string }> };

export default async function ChangePasswordPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await auth();
  if (!session?.user?.id) {
    redirect(localizedHref(locale, "/login"));
  }
  if (!session.user.mustChangePassword) {
    redirect(localizedHref(locale, "/"));
  }

  return (
    <div className="app-shell app-section">
      <ChangePasswordForm />
    </div>
  );
}
