import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ContactFeedbackForm } from "@/components/contact/ContactFeedbackForm";
import { Link } from "@/i18n/navigation";
import { localizedHref } from "@/lib/paths";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "Contact.feedback" });
    return {
      title: t("title"),
      description: t("accountLead"),
    };
  } catch (error) {
    console.error("[cont/feedback] generateMetadata failed", error);
    return {
      title: "Feedback",
      description: "Trimite feedback către echipa VEX.",
    };
  }
}

export default async function ContFeedbackPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  let session: Awaited<ReturnType<typeof auth>> = null;
  try {
    session = await auth();
  } catch (error) {
    console.error("[cont/feedback] auth failed", error);
    return (
      <div className="app-shell app-section max-w-xl">
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-100">
          Serviciul de autentificare este temporar indisponibil. Încearcă din nou în câteva momente.
        </div>
      </div>
    );
  }
  if (!session?.user?.id) {
    redirect(localizedHref(locale, "/cont"));
  }

  let t: Awaited<ReturnType<typeof getTranslations>>;
  let tHub: Awaited<ReturnType<typeof getTranslations>>;
  try {
    [t, tHub] = await Promise.all([getTranslations("Contact.feedback"), getTranslations("AccountHub")]);
  } catch (error) {
    console.error("[cont/feedback] translations failed", error);
    return (
      <div className="app-shell app-section max-w-xl">
        <p className="text-sm text-zinc-600 dark:text-zinc-300">Feedback-ul nu poate fi încărcat momentan. Reîncearcă puțin mai târziu.</p>
      </div>
    );
  }

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
