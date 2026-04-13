"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

/**
 * Bloc informativ (pagini legale): confirmare că utilizatorul a luat la cunoștință documentele.
 * Nu înlocuiește acceptarea la înregistrare din cont.
 */
export function LegalAcknowledgment() {
  const t = useTranslations("Legal.document");

  return (
    <div className="mt-14 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900/80">
      <label className="flex cursor-pointer gap-3">
        <input
          type="checkbox"
          className="mt-1 h-4 w-4 shrink-0 rounded border-zinc-300 text-[#2563eb] focus:ring-[#2563eb]"
          aria-describedby="legal-ack-desc"
        />
        <span id="legal-ack-desc" className="text-[14px] leading-relaxed text-zinc-600 dark:text-zinc-400">
          {t("ackPrefix")}{" "}
          <Link href="/termeni" className="font-semibold text-[#2563eb] underline-offset-2 hover:underline dark:text-blue-400">
            {t("ackTerms")}
          </Link>{" "}
          {t("ackMiddle")}{" "}
          <Link href="/confidentialitate" className="font-semibold text-[#2563eb] underline-offset-2 hover:underline dark:text-blue-400">
            {t("ackPrivacy")}
          </Link>
          {t("ackSuffix")}
        </span>
      </label>
    </div>
  );
}
