import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Mail, MapPin } from "lucide-react";
import { ContactFeedbackForm } from "@/components/contact/ContactFeedbackForm";
import { SupportContactLauncher } from "@/components/support/SupportContactLauncher";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Contact" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Contact");

  return (
    <div className="app-shell app-section pb-20">
      <div className="mx-auto w-full max-w-xl">
        <div className="overflow-hidden rounded-3xl border border-zinc-200/90 bg-white shadow-[var(--mp-shadow-md)]">
          <header className="border-b border-zinc-100 bg-zinc-50/90 px-5 py-7 text-center sm:px-8 sm:py-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-700">{t("kicker")}</p>
            <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-zinc-900 sm:text-3xl">{t("pageTitle")}</h1>
            <p className="mx-auto mt-3 max-w-md text-base leading-relaxed text-zinc-600">{t("pageSubtitle")}</p>
          </header>

          <div className="space-y-8 px-5 py-7 sm:px-8 sm:py-9">
            <SupportContactLauncher unified headingId="contact-page-live-chat" />

            <section className="border-t border-zinc-100 pt-8 text-center sm:text-left" aria-labelledby="contact-email-heading">
              <h2 id="contact-email-heading" className="text-center text-sm font-bold uppercase tracking-[0.12em] text-zinc-500 sm:text-left">
                {t("emailSectionTitle")}
              </h2>
              <div className="mt-6 space-y-6">
                <div className="rounded-2xl border border-zinc-100 bg-zinc-50/80 p-5 text-center sm:text-left">
                  <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100 text-orange-700 sm:mx-0">
                    <Mail className="h-5 w-5 shrink-0" aria-hidden />
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-zinc-900">{t("emailSupportTitle")}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-600">{t("emailSupportBody")}</p>
                  <a
                    href="mailto:asistenta@vex.md"
                    className="mt-4 inline-flex min-h-[48px] w-full items-center justify-center break-all rounded-xl border border-orange-200/80 bg-white px-4 text-base font-semibold text-orange-700 shadow-sm transition hover:bg-orange-50 sm:inline-flex sm:w-auto"
                  >
                    asistenta@vex.md
                  </a>
                </div>
                <div className="rounded-2xl border border-zinc-100 bg-zinc-50/80 p-5 text-center sm:text-left">
                  <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-100 text-zinc-700 sm:mx-0">
                    <Mail className="h-5 w-5 shrink-0" aria-hidden />
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-zinc-900">{t("emailGeneralTitle")}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-600">{t("emailGeneralBody")}</p>
                  <a
                    href="mailto:contact@vex.md"
                    className="mt-4 inline-flex min-h-[48px] w-full items-center justify-center break-all rounded-xl border border-zinc-200 bg-white px-4 text-base font-semibold text-orange-700 shadow-sm transition hover:bg-zinc-50 sm:inline-flex sm:w-auto"
                  >
                    contact@vex.md
                  </a>
                </div>
              </div>
            </section>

            <ContactFeedbackForm />

            <div className="flex flex-col items-center gap-3 rounded-2xl border border-zinc-200/80 bg-zinc-50/90 px-4 py-5 text-center text-sm leading-relaxed text-zinc-600 sm:flex-row sm:items-start sm:text-left">
              <MapPin className="mx-auto h-5 w-5 shrink-0 text-zinc-400 sm:mx-0 sm:mt-0.5" aria-hidden />
              <p className="min-w-0">{t("regionNote")}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
