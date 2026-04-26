"use client";

import { useEffect, useMemo, useState } from "react";

type PresencePoint = {
  at: number;
  total: number;
  authenticated: number;
  guests: number;
};

type PresencePayload = {
  ok: boolean;
  stats?: {
    total: number;
    authenticated: number;
    guests: number;
    heartbeatTtlMs: number;
  };
  history?: PresencePoint[];
};

export function AdminLivePresencePanel() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<PresencePayload["stats"] | null>(null);
  const [history, setHistory] = useState<PresencePoint[]>([]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch("/api/metrics/presence", { credentials: "include" });
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const data = (await res.json()) as PresencePayload;
        if (cancelled) return;
        if (!data.ok || !data.stats) {
          throw new Error("invalid_payload");
        }
        setStats(data.stats);
        setHistory(Array.isArray(data.history) ? data.history : []);
        setError(null);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "load_failed");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    const timer = window.setInterval(() => void load(), 5000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, []);

  const maxTotal = useMemo(() => {
    const max = history.reduce((acc, p) => Math.max(acc, p.total), 0);
    return Math.max(max, 1);
  }, [history]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <article className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Total live</p>
          <p className="mt-2 text-3xl font-bold tabular-nums">{stats?.total ?? 0}</p>
        </article>
        <article className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Authenticated</p>
          <p className="mt-2 text-3xl font-bold tabular-nums">{stats?.authenticated ?? 0}</p>
        </article>
        <article className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Guests</p>
          <p className="mt-2 text-3xl font-bold tabular-nums">{stats?.guests ?? 0}</p>
        </article>
      </div>

      <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Last 15 minutes (5s refresh)</h2>
        {loading ? <p className="mt-3 text-sm text-zinc-500">Loading live data…</p> : null}
        {error ? <p className="mt-3 text-sm text-red-600">Failed to load live data: {error}</p> : null}
        {!loading && !error ? (
          <div className="mt-4 flex h-40 items-end gap-1 rounded-xl bg-zinc-50 p-2 dark:bg-zinc-800/40">
            {history.length === 0 ? (
              <p className="text-xs text-zinc-500">No live samples yet.</p>
            ) : (
              history.map((p) => (
                <div
                  key={p.at}
                  className="group relative min-w-[4px] flex-1 rounded-sm bg-emerald-500/80"
                  style={{ height: `${Math.max(4, (p.total / maxTotal) * 100)}%` }}
                  title={`${new Date(p.at).toLocaleTimeString()} · ${p.total} live`}
                />
              ))
            )}
          </div>
        ) : null}
      </section>
    </div>
  );
}

