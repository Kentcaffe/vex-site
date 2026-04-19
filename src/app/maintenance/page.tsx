"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Pagină statică de mentenanță — vizibilă când MAINTENANCE_MODE=true (middleware).
 * Design dark, branding VEX (accent portocaliu).
 */
export default function MaintenancePage() {
  const [checking, setChecking] = useState(false);
  const [pulse, setPulse] = useState(true);

  useEffect(() => {
    const id = window.setInterval(() => setPulse((p) => !p), 1600);
    return () => window.clearInterval(id);
  }, []);

  const retry = useCallback(async () => {
    setChecking(true);
    try {
      await fetch("/api/health", { cache: "no-store", credentials: "same-origin" });
    } catch {
      /* proces indisponibil — tot reîmprospătăm pagina */
    }
    window.location.reload();
  }, []);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#0a0a0b] px-4 py-16 text-zinc-100">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 20%, #ea580c 0%, transparent 45%),
            radial-gradient(circle at 80% 80%, #2563eb 0%, transparent 40%)`,
        }}
      />
      <div className="relative z-10 flex w-full max-w-lg flex-col items-center text-center">
        <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-orange-700 shadow-lg shadow-orange-900/40">
          <span className="text-2xl font-black tracking-tight text-white">VEX</span>
        </div>

        <div className="mb-6 flex h-12 w-12 items-center justify-center">
          <span
            className={`inline-block h-12 w-12 rounded-full border-2 border-orange-500/30 border-t-orange-500 transition ${
              pulse ? "opacity-100" : "opacity-70"
            }`}
            style={{ animation: "vex-spin 0.9s linear infinite" }}
            aria-hidden
          />
          <style>{`@keyframes vex-spin { to { transform: rotate(360deg); } }`}</style>
        </div>

        <h1 className="mb-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Suntem în mentenanță
        </h1>
        <p className="mb-2 text-base leading-relaxed text-zinc-400">
          Revenim în curând. Îmbunătățim platforma ca să ai o experiență mai bună.
        </p>
        <p className="mb-10 text-sm text-zinc-500">Cod: MAINTENANCE · VEX.MD</p>

        <button
          type="button"
          onClick={() => void retry()}
          disabled={checking}
          className="inline-flex min-h-[52px] min-w-[200px] touch-manipulation items-center justify-center rounded-xl bg-gradient-to-r from-orange-600 to-orange-700 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-orange-950/50 transition hover:from-orange-500 hover:to-orange-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0b] disabled:opacity-60"
        >
          {checking ? "Se verifică…" : "Reîncearcă"}
        </button>

        <p className="mt-10 max-w-sm text-xs leading-relaxed text-zinc-600">
          Dacă problema persistă, încearcă mai târziu sau verifică rețeaua. Pentru urgențe comerciale
          folosește canalele oficiale VEX.
        </p>
      </div>
    </div>
  );
}
