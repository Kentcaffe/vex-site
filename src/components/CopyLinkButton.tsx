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
      className="inline-flex min-h-[48px] touch-manipulation items-center justify-center rounded-xl border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-50 active:bg-zinc-100 dark:border-zinc-600 dark:hover:bg-zinc-800 dark:active:bg-zinc-900"
    >
      {done ? t("copied") : t("copyLink")}
    </button>
  );
}
