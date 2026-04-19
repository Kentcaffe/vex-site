"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { deleteOwnListing } from "@/app/actions/listings";

type Props = {
  listingId: string;
  /** După ștergere — ex. `/cont/anunturi` */
  redirectHref: string;
  /** Chei `AccountHub.myListing*` sau `ListingDetail.owner*` */
  variant: "account" | "detail";
};

export function OwnListingDeleteButton({ listingId, redirectHref, variant }: Props) {
  const tHub = useTranslations("AccountHub");
  const tDetail = useTranslations("ListingDetail");
  const router = useRouter();
  const [err, setErr] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const confirmMsg =
    variant === "account" ? tHub("myListingDeleteConfirm") : tDetail("ownerDeleteConfirm");
  const labelDelete = variant === "account" ? tHub("myListingDelete") : tDetail("ownerDelete");
  const labelDeleting = variant === "account" ? tHub("myListingDeleting") : tDetail("ownerDeleting");
  const labelErr = variant === "account" ? tHub("myListingDeleteError") : tDetail("ownerDeleteError");

  function onDelete() {
    if (!window.confirm(confirmMsg)) {
      return;
    }
    setErr(null);
    startTransition(async () => {
      const r = await deleteOwnListing(listingId);
      if (r.ok) {
        router.push(redirectHref);
        router.refresh();
        return;
      }
      if (r.error === "unauthorized") {
        setErr(variant === "account" ? tHub("myListingDeleteLogin") : tDetail("ownerDeleteLogin"));
      } else {
        setErr(labelErr);
      }
    });
  }

  return (
    <div className="min-w-0">
      <button
        type="button"
        disabled={pending}
        onClick={onDelete}
        className="inline-flex min-h-[48px] w-full touch-manipulation items-center justify-center rounded-xl border border-red-300 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-900 shadow-sm transition active:bg-red-100 disabled:opacity-60 dark:border-red-800 dark:bg-red-950/50 dark:text-red-100 dark:active:bg-red-950/70 sm:w-auto"
      >
        {pending ? labelDeleting : labelDelete}
      </button>
      {err ? <p className="mt-2 text-xs text-red-600 dark:text-red-400">{err}</p> : null}
    </div>
  );
}
