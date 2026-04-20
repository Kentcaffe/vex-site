"use client";

import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { permanentlyDeleteListingAsAdmin, restoreListingAsAdmin } from "@/app/actions/admin-listings";

type Props = { listingId: string };

export function TrashListingActions({ listingId }: Props) {
  const t = useTranslations("Admin");
  const router = useRouter();
  const [err, setErr] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onRestore() {
    setErr(null);
    startTransition(async () => {
      const r = await restoreListingAsAdmin(listingId);
      if (r.ok) {
        router.refresh();
        return;
      }
      setErr(r.error === "forbidden" ? t("forbidden") : t("trashActionError"));
    });
  }

  function onPermanent() {
    if (!window.confirm(t("confirmPermanentDelete"))) {
      return;
    }
    setErr(null);
    startTransition(async () => {
      const r = await permanentlyDeleteListingAsAdmin(listingId);
      if (r.ok) {
        router.refresh();
        return;
      }
      setErr(r.error === "forbidden" ? t("forbidden") : t("trashActionError"));
    });
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <button
        type="button"
        disabled={pending}
        onClick={onRestore}
        className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-900 hover:bg-emerald-100 disabled:opacity-60 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200"
      >
        {pending ? t("restoring") : t("restore")}
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={onPermanent}
        className="rounded-lg border border-red-300 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-800 hover:bg-red-100 disabled:opacity-60 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200"
      >
        {t("deletePermanent")}
      </button>
      {err ? <p className="w-full text-right text-xs text-red-600">{err}</p> : null}
    </div>
  );
}
