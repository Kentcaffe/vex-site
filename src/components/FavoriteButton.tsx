"use client";

import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { toggleListingFavorite } from "@/app/actions/favorites";
import { useRouter } from "@/i18n/navigation";

type Props = {
  listingId: string;
  initialFavorited: boolean;
};

export function FavoriteButton({ listingId, initialFavorited }: Props) {
  const t = useTranslations("Favorites");
  const router = useRouter();
  const [favorited, setFavorited] = useState(initialFavorited);
  const [err, setErr] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onClick() {
    setErr(null);
    startTransition(async () => {
      const r = await toggleListingFavorite(listingId);
      if (!r.ok) {
        if (r.error === "unauthorized") {
          setErr(t("loginRequired"));
        } else {
          setErr(t("toggleError"));
        }
        return;
      }
      setFavorited(r.favorited);
      router.refresh();
    });
  }

  return (
    <div>
      <button
        type="button"
        disabled={pending}
        onClick={onClick}
        className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition disabled:opacity-60 ${
          favorited
            ? "border-rose-400 bg-rose-50 text-rose-900 dark:border-rose-700 dark:bg-rose-950/40 dark:text-rose-100"
            : "border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
        }`}
        aria-pressed={favorited}
      >
        <span aria-hidden>{favorited ? "♥" : "♡"}</span>
        {favorited ? t("saved") : t("save")}
      </button>
      {err ? <p className="mt-1 text-xs text-red-600">{err}</p> : null}
    </div>
  );
}
