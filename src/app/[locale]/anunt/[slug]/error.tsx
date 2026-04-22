"use client";

import { useEffect } from "react";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ListingSlugError({ error, reset }: Props) {
  useEffect(() => {
    console.error("[anunt/[slug]] route error", error);
  }, [error]);

  return (
    <div className="app-shell app-section">
      <div className="surface-card p-6 sm:p-8">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Nu am putut încărca anunțul</h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">A apărut o eroare temporară. Poți încerca din nou.</p>
        <button
          type="button"
          onClick={() => reset()}
          className="mt-4 rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-500"
        >
          Reîncearcă
        </button>
      </div>
    </div>
  );
}
