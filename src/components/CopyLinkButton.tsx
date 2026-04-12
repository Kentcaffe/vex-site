"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

export function CopyLinkButton() {
  const t = useTranslations("ListingDetail");
  const [done, setDone] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setDone(true);
      setTimeout(() => setDone(false), 2000);
    } catch {
      /* ignore */
    }
  }

  return (
    <button
      type="button"
      onClick={() => void copy()}
      className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium hover:bg-zinc-50 dark:border-zinc-600 dark:hover:bg-zinc-800"
    >
      {done ? t("copied") : t("copyLink")}
    </button>
  );
}
