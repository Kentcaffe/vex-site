"use client";

import { useState } from "react";
import { AtSign, Lock } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { tryCreateSupabaseBrowserClient } from "@/lib/supabase";

type Props = {
  dashboardPath: string;
  changePasswordPath: string;
  maintenancePath: string;
};

type SessionPayload = {
  authenticated?: boolean;
  session?: {
    user?: {
      role?: string;
      mustChangePassword?: boolean;
    };
  } | null;
};

export default function TesterLoginClient({ dashboardPath, changePasswordPath, maintenancePath }: Props) {
  const router = useRouter();
  const supabase = tryCreateSupabaseBrowserClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !normalizedEmail.includes("@")) {
      setError("Introdu o adresa de email valida.");
      return;
    }
    if (!password) {
      setError("Introdu parola.");
      return;
    }
    if (!supabase) {
      setError("Autentificarea nu este configurata pe server.");
      return;
    }

    setPending(true);
    const { error: loginErr } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (loginErr) {
      setPending(false);
      setError("Email sau parola incorecta.");
      return;
    }

    await fetch("/api/auth/sync-user", { method: "POST", credentials: "include" });

    let payload: SessionPayload | null = null;
    try {
      const res = await fetch("/api/auth/session", { credentials: "include" });
      payload = (await res.json()) as SessionPayload;
    } catch {
      payload = null;
    }

    const role = payload?.session?.user?.role;
    const mustChangePassword = payload?.session?.user?.mustChangePassword === true;

    if (!payload?.authenticated || role !== "TESTER") {
      await supabase.auth.signOut();
      setPending(false);
      router.replace(maintenancePath);
      router.refresh();
      return;
    }

    setPending(false);
    if (mustChangePassword) {
      router.replace(changePasswordPath);
      router.refresh();
      return;
    }
    router.replace(dashboardPath);
    router.refresh();
  }

  return (
    <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-sky-300/25 bg-slate-950/55 p-6 shadow-[0_0_0_1px_rgba(56,189,248,0.08),0_24px_64px_-22px_rgba(37,99,235,0.85)] backdrop-blur-2xl sm:p-7">
      <div className="pointer-events-none absolute inset-0 opacity-70" aria-hidden>
        <div className="absolute -top-24 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-sky-400/20 blur-3xl" />
      </div>

      <div className="relative z-10">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.22em] text-sky-200/80">Closed Beta</p>
        <h1 className="mt-3 text-center text-2xl font-bold tracking-tight text-white sm:text-3xl">Login Testeri</h1>
        <p className="mt-2 text-center text-sm leading-relaxed text-slate-300">
          Accesul este permis doar conturilor de tester create de administrator.
        </p>

        <form onSubmit={onSubmit} className="mt-7 space-y-4" noValidate>
          <label className="block">
            <span className="mb-1.5 inline-block text-xs font-semibold uppercase tracking-wide text-slate-400">Email</span>
            <div className="flex items-center gap-2 rounded-xl border border-white/15 bg-black/30 px-3 py-2.5">
              <AtSign className="h-4 w-4 text-sky-300/80" />
              <input
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                placeholder="tester@vex.md"
              />
            </div>
          </label>

          <label className="block">
            <span className="mb-1.5 inline-block text-xs font-semibold uppercase tracking-wide text-slate-400">Parola</span>
            <div className="flex items-center gap-2 rounded-xl border border-white/15 bg-black/30 px-3 py-2.5">
              <Lock className="h-4 w-4 text-sky-300/80" />
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                placeholder="Parola cont tester"
              />
            </div>
          </label>

          {error ? (
            <p className="rounded-xl border border-red-400/35 bg-red-500/10 px-3 py-2 text-sm text-red-200" role="alert">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-[0_10px_30px_-12px_rgba(56,189,248,0.95)] transition hover:from-sky-400 hover:to-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? "Se autentifica..." : "Intra in platforma"}
          </button>
        </form>
      </div>
    </div>
  );
}
