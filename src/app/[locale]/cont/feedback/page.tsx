import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ContactFeedbackForm } from "@/components/contact/ContactFeedbackForm";
import { Link } from "@/i18n/navigation";
import { localizedHref } from "@/lib/paths";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Contact.feedback" });
  return {
    title: t("title"),
    description: t("accountLead"),
  };
}

export default async function ContFeedbackPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await auth();
  if (!session?.user?.id) {
    redirect(localizedHref(locale, "/cont"));
  }

  const t = await getTranslations("Contact.feedback");
  const tHub = await getTranslations("AccountHub");

  return (
    <div className="app-shell app-section max-w-xl">
      <p className="text-center sm:text-left">
        <Link href="/cont" className="text-sm font-medium text-orange-600 hover:underline">
          ← {tHub("backToAccount")}
        </Link>
      </p>
      <header className="mt-4">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">{t("title")}</h1>
        <p className="mt-2 text-sm leading-relaxed text-zinc-600">{t("accountLead")}</p>
      </header>
      <div className="mt-8">
        <ContactFeedbackForm showHeading={false} idSuffix="-account" />
      </div>
    </div>
  );
}
