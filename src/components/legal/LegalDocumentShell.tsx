import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { LegalAcknowledgment } from "@/components/legal/LegalAcknowledgment";

export type LegalSlug = "termeni" | "confidentialitate" | "stergere-date";

type Props = {
  slug: LegalSlug;
  children: React.ReactNode;
};

const sectionClass = "space-y-4 text-base leading-relaxed text-zinc-700 dark:text-zinc-300";
const h2Class = "text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100";
const h3Class = "text-base font-semibold text-zinc-800 dark:text-zinc-200";
const ulClass = "list-disc space-y-2 pl-5 text-zinc-700 dark:text-zinc-300";

export async function LegalDocumentShell({ slug, children }: Props) {
  const t = await getTranslations("Legal.document");

  return (
    <div className="min-h-[60vh] w-full max-w-full overflow-x-clip bg-[#f9fafb] dark:bg-zinc-950">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14 lg:max-w-[42rem] lg:py-16">
        <Link
          href="/"
          className="inline-flex text-sm font-medium text-[#2563eb] transition hover:text-blue-700 hover:underline dark:text-blue-400"
        >
          ← {t("backHome")}
        </Link>

        <nav
          className="mt-8 flex flex-wrap gap-2 rounded-2xl border border-zinc-200/80 bg-white p-2 shadow-sm dark:border-zinc-700/80 dark:bg-zinc-900/80"
          aria-label={t("navAria")}
        >
          <NavPill href="/termeni" active={slug === "termeni"}>
            {t("navTerms")}
          </NavPill>
          <NavPill href="/confidentialitate" active={slug === "confidentialitate"}>
            {t("navPrivacy")}
          </NavPill>
          <NavPill href="/stergere-date" active={slug === "stergere-date"}>
            {t("navDeletion")}
          </NavPill>
        </nav>

        <article className="mt-8 rounded-2xl border border-zinc-200/90 bg-white px-4 py-8 text-base leading-relaxed shadow-[0_8px_30px_-12px_rgba(15,23,42,0.12)] dark:border-zinc-800 dark:bg-zinc-900/90 dark:shadow-black/20 sm:mt-10 sm:px-8 sm:py-10 md:px-10">
          {children}
        </article>

        <LegalAcknowledgment />
      </div>
    </div>
  );
}

function NavPill({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`min-h-[44px] rounded-xl px-4 py-2.5 text-sm font-medium transition sm:min-h-0 ${
        active
          ? "bg-[#2563eb] text-white shadow-sm"
          : "text-zinc-600 active:bg-zinc-100 dark:text-zinc-400 dark:active:bg-zinc-800 lg:hover:bg-zinc-100 lg:dark:hover:bg-zinc-800"
      }`}
      aria-current={active ? "page" : undefined}
    >
      {children}
    </Link>
  );
}

export { sectionClass, h2Class, h3Class, ulClass };
