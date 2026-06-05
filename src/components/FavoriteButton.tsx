"use client";

import { Heart } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useTransition, type MouseEvent } from "react";
import { toggleListingFavorite } from "@/app/actions/favorites";
import { useRouter } from "@/i18n/navigation";

type Props = {
  listingId: string;
  initialFavorited: boolean;
  /** Icon-only control for listing cards (overlay). */
  variant?: "default" | "icon";
  className?: string;
};

export function FavoriteButton({ listingId, initialFavorited, variant = "default", className = "" }: Props) {
  const t = useTranslations("Favorites");
  const router = useRouter();
  const [favorited, setFavorited] = useState(initialFavorited);
  const [err, setErr] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onClick(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();
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

  if (variant === "icon") {
    return (
      <div className={className}>
        <button
          type="button"
          disabled={pending}
          onClick={onClick}
          title={err ?? (favorited ? t("saved") : t("save"))}
          aria-label={favorited ? t("saved") : t("save")}
          aria-pressed={favorited}
          className="inline-flex h-9 w-9 min-h-[36px] min-w-[36px] shrink-0 touch-manipulation items-center justify-center rounded-lg border border-[#e2e8f0] bg-white transition hover:bg-[#f8fafc] disabled:opacity-60"
        >
          <Heart
            className={`h-5 w-5 ${favorited ? "fill-red-500 text-red-500" : "text-gray-400"}`}
            strokeWidth={1.75}
            aria-hidden
          />
        </button>
      </div>
    );
  }

  return (
    <div className={className}>
      <button
        type="button"
        disabled={pending}
        onClick={onClick}
        className={`inline-flex min-h-[48px] touch-manipulation items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition disabled:opacity-60 ${
          favorited
            ? "border-rose-400 bg-rose-50 text-rose-900 dark:border-rose-700 dark:bg-rose-950/40 dark:text-rose-100"
            : "border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
        }`}
        aria-pressed={favorited}
        aria-label={favorited ? t("saved") : t("save")}
      >
        <Heart className={`h-5 w-5 shrink-0 ${favorited ? "fill-red-500 text-red-500" : "text-gray-400"}`} strokeWidth={1.75} aria-hidden />
        {favorited ? t("saved") : t("save")}
      </button>
      {err ? <p className="mt-1 text-xs text-red-600">{err}</p> : null}
    </div>
  );
}
