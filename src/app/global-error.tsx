"use client";

import { useEffect, useState } from "react";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

/**
 * Eroare critică în root layout. Arată UI calm (nu stack brut) + retry.
 * digest = id Next.js pentru corelare în loguri.
 */
export default function GlobalError({ error, reset }: Props) {
  const [copied, setCopied] = useState(false);
  const code = error.digest ?? "—";

  useEffect(() => {
    console.error("[global-error]", error);
  }, [error]);

  return (
    <html lang="ro">
      <body className="min-h-screen bg-[#0a0a0b] text-zinc-100 antialiased">
        <div className="flex min-h-screen flex-col items-center justify-center px-4 py-16">
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-orange-700 shadow-lg shadow-orange-900/40">
            <span className="text-xl font-black text-white">VEX</span>
          </div>
          <h1 className="mb-2 text-center text-2xl font-bold text-white">Ceva nu a funcționat</h1>
          <p className="mb-6 max-w-md text-center text-sm leading-relaxed text-zinc-400">
            A apărut o eroare neașteptată. Poți încerca din nou; dacă se repetă, revino mai târziu.
          </p>
          <p className="mb-8 font-mono text-xs text-zinc-500">
            Ref: <span className="text-zinc-300">{code}</span>
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => reset()}
              className="rounded-xl bg-orange-600 px-6 py-3 text-sm font-semibold text-white hover:bg-orange-500"
            >
              Reîncearcă
            </button>
            <button
              type="button"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(code);
                  setCopied(true);
                  window.setTimeout(() => setCopied(false), 2000);
                } catch {
                  /* ignore */
                }
              }}
              className="rounded-xl border border-zinc-700 px-4 py-3 text-sm text-zinc-300 hover:bg-zinc-900"
            >
              {copied ? "Copiat" : "Copiază ref."}
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
