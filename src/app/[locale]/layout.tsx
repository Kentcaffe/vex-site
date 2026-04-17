import type { ReactNode } from "react";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Providers } from "@/components/Providers";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

type Props = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

/** Env-based UI (OAuth buttons) must see runtime secrets — avoid baking empty env at build. */
export const dynamic = "force-dynamic";

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as "ro" | "ru" | "en")) {
    notFound();
  }
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <Providers>
        <div className="flex min-h-screen flex-col overflow-x-clip">
          <SiteHeader />
          <div className="flex min-h-0 flex-1 flex-col pb-[calc(4.5rem+env(safe-area-inset-bottom,0px))] md:pb-0">
            <main className="flex min-h-0 min-w-0 flex-1 flex-col">{children}</main>
            <SiteFooter />
          </div>
          <MobileBottomNav />
        </div>
      </Providers>
    </NextIntlClientProvider>
  );
}
