"use client";

import { useEffect } from "react";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ContactFeedbackError({ error, reset }: Props) {
  useEffect(() => {
    console.error("[cont/feedback] route error", error);
  }, [error]);

  return (
    <div className="app-shell app-section max-w-xl">
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-100">
        Nu am putut încărca formularul de feedback.
      </div>
      <button
        type="button"
        onClick={() => reset()}
        className="mt-4 rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-500"
      >
        Reîncearcă
      </button>
    </div>
  );
}
