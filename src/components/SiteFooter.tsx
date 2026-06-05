import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { FooterNav } from "@/components/FooterNav";

export async function SiteFooter() {
  const t = await getTranslations("Footer");
  const year = new Date().getFullYear();

  return (
    <footer className="mt-12 w-full max-w-full overflow-x-clip border-t border-[#e2e8f0] bg-white">
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          <div className="space-y-3">
            <Link href="/" className="text-xl font-medium tracking-tight text-[#0f172a]">
              VEX
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-[#64748b]">{t("tagline")}</p>
          </div>

          <FooterNav />
        </div>

        <div className="mt-10 border-t border-[#e2e8f0] pt-6">
          <p className="text-center text-xs text-[#64748b] sm:text-left">{t("rights", { year })}</p>
        </div>
      </div>
    </footer>
  );
}
