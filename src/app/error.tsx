"use client";

import { useEffect } from "react";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

/** Erori în copiii `app/layout` (ex. `[locale]`), nu în root layout. */
export default function AppError({ error, reset }: Props) {
  useEffect(() => {
    console.error("[app-error]", error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 py-16">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-700 shadow-md">
        <span className="text-lg font-black text-white">VEX</span>
      </div>
      <h2 className="mb-2 text-lg font-semibold text-zinc-900">Nu am putut încărca pagina</h2>
      <p className="mb-6 max-w-md text-center text-sm text-zinc-600">
        Eroare temporară. Poți încerca din nou.
      </p>
      {error.digest ? (
        <p className="mb-6 font-mono text-xs text-zinc-400">Ref: {error.digest}</p>
      ) : null}
      <button
        type="button"
        onClick={() => reset()}
        className="rounded-xl bg-orange-600 px-6 py-3 text-sm font-semibold text-white hover:bg-orange-500"
      >
        Reîncearcă
      </button>
    </div>
  );
}
