"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Mentenanță globală — vizibilă când `MAINTENANCE_MODE=true` (middleware).
 * Parola se verifică doar pe server la `POST /api/beta-access` (niciodată în client bundle).
 */
export default function MaintenancePage() {
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pulse, setPulse] = useState(true);

  useEffect(() => {
    const id = window.setInterval(() => setPulse((p) => !p), 1600);
    return () => window.clearInterval(id);
  }, []);

  const submit = useCallback(async () => {
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/beta-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ password }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        retryAfterSec?: number;
      };

      if (res.ok && data.ok) {
        window.location.assign("/");
        return;
      }

      if (res.status === 429) {
        const sec = typeof data.retryAfterSec === "number" ? data.retryAfterSec : 60;
        setError(`Prea multe încercări. Reîncearcă peste ${sec}s.`);
        return;
      }

      if (data.error === "wrong_password") {
        setError("Parolă incorectă.");
        return;
      }

      if (data.error === "maintenance_inactive") {
        setError("Mentenanța nu mai este activă. Reîmprospătează pagina.");
        return;
      }

      if (data.error === "server_misconfigured") {
        setError("Accesul beta nu este configurat pe server.");
        return;
      }

      setError("Nu s-a putut verifica accesul. Încearcă din nou.");
    } catch {
      setError("Eroare de rețea. Verifică conexiunea.");
    } finally {
      setBusy(false);
    }
  }, [password]);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#07080d] px-4 py-16 text-zinc-100">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.12] transition-opacity duration-[2.4s] ease-in-out"
        style={{
          opacity: pulse ? 0.12 : 0.08,
          backgroundImage: `radial-gradient(circle at 20% 20%, #ea580c 0%, transparent 42%),
            radial-gradient(circle at 80% 75%, #6366f1 0%, transparent 38%)`,
        }}
      />

      <div className="relative z-10 w-full max-w-md transition-opacity duration-500">
        <div className="mb-10 flex flex-col items-center text-center">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-orange-700 shadow-lg shadow-orange-950/50 ring-1 ring-white/10">
            <span className="text-2xl font-black tracking-tight text-white">VEX</span>
          </div>

          <div className="mb-5 flex h-11 w-11 items-center justify-center" aria-hidden>
            <span
              className="inline-block h-11 w-11 rounded-full border-2 border-orange-500/25 border-t-orange-500"
              style={{ animation: "vex-spin 0.85s linear infinite" }}
            />
            <style>{`@keyframes vex-spin { to { transform: rotate(360deg); } }`}</style>
          </div>

          <h1 className="mb-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Site-ul este în mentenanță
          </h1>
          <p className="text-sm leading-relaxed text-zinc-400 sm:text-base">
            Lucrăm la îmbunătățiri. Dacă ai acces de testare, introdu parola mai jos.
          </p>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 shadow-2xl shadow-black/40 backdrop-blur-md ring-1 ring-white/[0.06]">
          <label htmlFor="maint-beta-pass" className="mb-2 block text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Parolă acces testare
          </label>
          <input
            id="maint-beta-pass"
            type="password"
            name="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                void submit();
              }
            }}
            disabled={busy}
            placeholder="••••••••"
            className="mb-4 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none ring-0 transition placeholder:text-zinc-600 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 disabled:opacity-50"
          />

          {error ? (
            <p
              className="mb-4 rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-2 text-center text-sm text-red-200"
              role="alert"
            >
              {error}
            </p>
          ) : null}

          <button
            type="button"
            onClick={() => void submit()}
            disabled={busy || !password.trim()}
            className="flex w-full min-h-[48px] items-center justify-center rounded-xl bg-gradient-to-r from-orange-600 to-orange-700 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-950/40 transition hover:from-orange-500 hover:to-orange-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#07080d] disabled:cursor-not-allowed disabled:opacity-45"
          >
            {busy ? "Se verifică…" : "Accesează site-ul"}
          </button>
        </div>

        <p className="mt-8 text-center text-xs leading-relaxed text-zinc-600">
          Conexiune securizată. Parola nu este stocată în browser — se validează doar pe server.
        </p>
      </div>
    </div>
  );
}
