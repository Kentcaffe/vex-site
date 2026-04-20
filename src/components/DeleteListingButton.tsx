"use client";

import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { deleteListingAsStaff } from "@/app/actions/admin-listings";

type Props = {
  listingId: string;
};

export function DeleteListingButton({ listingId }: Props) {
  const t = useTranslations("Admin");
  const router = useRouter();
  const [err, setErr] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onDelete() {
    if (!window.confirm(t("confirmDelete"))) {
      return;
    }
    setErr(null);
    startTransition(async () => {
      const r = await deleteListingAsStaff(listingId);
      if (r.ok) {
        router.refresh();
        return;
      }
      if (r.error === "forbidden") {
        setErr(t("forbidden"));
      } else if (r.error === "not_found") {
        setErr(t("notFound"));
      } else {
        setErr(t("deleteError"));
      }
    });
  }

  return (
    <div>
      <button
        type="button"
        disabled={pending}
        onClick={onDelete}
        className="rounded-lg border border-red-300 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-800 hover:bg-red-100 disabled:opacity-60 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200 dark:hover:bg-red-950"
      >
        {pending ? t("deleting") : t("delete")}
      </button>
      {err ? <p className="mt-2 text-xs text-red-600">{err}</p> : null}
    </div>
  );
}
