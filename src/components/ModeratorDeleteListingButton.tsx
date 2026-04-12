"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { deleteListingAsStaff } from "@/app/actions/admin-listings";

type Props = {
  listingId: string;
  variant?: "default" | "dangerInline";
};

export function ModeratorDeleteListingButton({ listingId, variant = "default" }: Props) {
  const t = useTranslations("Admin");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const base =
    variant === "dangerInline"
      ? "rounded-lg border border-red-300 bg-white px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50 dark:border-red-800 dark:bg-zinc-950 dark:text-red-300 dark:hover:bg-red-950/40"
      : "rounded-xl border border-red-300 bg-red-50 px-4 py-2 text-sm font-medium text-red-900 hover:bg-red-100 disabled:opacity-50 dark:border-red-900 dark:bg-red-950/50 dark:text-red-100 dark:hover:bg-red-900/60";

  return (
    <button
      type="button"
      disabled={pending}
      className={base}
      onClick={() => {
        if (!window.confirm(t("deleteConfirm"))) {
          return;
        }
        startTransition(async () => {
          const r = await deleteListingAsStaff(listingId);
          if (r.ok) {
            router.push("/anunturi");
            router.refresh();
          } else {
            const msg =
              r.error === "unauthorized"
                ? t("deleteError.unauthorized")
                : r.error === "forbidden"
                  ? t("deleteError.forbidden")
                  : t("deleteError.not_found");
            window.alert(msg);
          }
        });
      }}
    >
      {pending ? "…" : t("deleteListing")}
    </button>
  );
}
