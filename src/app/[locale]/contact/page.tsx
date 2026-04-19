import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Mail, MapPin } from "lucide-react";
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
    <div className="app-shell app-section pb-16">
      <header className="mx-auto max-w-3xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-700">{t("kicker")}</p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl">{t("title")}</h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-zinc-600 sm:text-lg">{t("subtitle")}</p>
      </header>

      <div className="mx-auto mt-12 grid max-w-3xl gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-[var(--mp-shadow-md)]">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100 text-orange-700">
            <Mail className="h-5 w-5" aria-hidden />
          </div>
          <h2 className="mt-4 text-lg font-bold text-zinc-900">{t("emailSupportTitle")}</h2>
          <p className="mt-2 text-sm leading-relaxed text-zinc-600">{t("emailSupportBody")}</p>
          <a href="mailto:support@vex.md" className="mt-4 inline-flex min-h-[44px] items-center text-base font-semibold text-orange-700 underline-offset-4 hover:underline">
            support@vex.md
          </a>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-[var(--mp-shadow-md)]">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-100 text-zinc-700">
            <Mail className="h-5 w-5" aria-hidden />
          </div>
          <h2 className="mt-4 text-lg font-bold text-zinc-900">{t("emailGeneralTitle")}</h2>
          <p className="mt-2 text-sm leading-relaxed text-zinc-600">{t("emailGeneralBody")}</p>
          <a href="mailto:contact@vex.md" className="mt-4 inline-flex min-h-[44px] items-center text-base font-semibold text-orange-700 underline-offset-4 hover:underline">
            contact@vex.md
          </a>
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-3xl">
        <SupportContactLauncher />
      </div>

      <div className="mx-auto mt-10 flex max-w-3xl items-start gap-3 rounded-2xl border border-zinc-200/80 bg-zinc-50/80 px-4 py-4 text-sm text-zinc-600">
        <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-zinc-400" aria-hidden />
        <p>{t("regionNote")}</p>
      </div>
    </div>
  );
}
