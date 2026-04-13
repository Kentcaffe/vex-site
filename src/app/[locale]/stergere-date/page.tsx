import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LegalDocumentShell } from "@/components/legal/LegalDocumentShell";
import { StergereDateContentRo } from "@/components/legal/content/StergereDateContentRo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Legal.stergere" });
  const title = `${t("pageTitle")} | VEX`;
  return {
    title,
    description: "Ștergerea datelor personale pe VEX (vex.md) — cereri GDPR, termene, contact support@vex.md.",
    openGraph: { title, type: "article" },
  };
}

export default async function StergereDatePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Legal.stergere");

  return (
    <LegalDocumentShell slug="stergere-date">
      <header className="border-b border-zinc-100 pb-8 dark:border-zinc-800">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">{t("pageTitle")}</h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">{t("pageUpdated")}</p>
        {locale !== "ro" ? (
          <p className="mt-4 rounded-xl border border-amber-200/80 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-950 dark:border-amber-900/40 dark:bg-amber-950/25 dark:text-amber-100">
            {t("languageNote")}
          </p>
        ) : null}
      </header>
      <div className="mt-10 space-y-10">
        <StergereDateContentRo />
      </div>
    </LegalDocumentShell>
  );
}
