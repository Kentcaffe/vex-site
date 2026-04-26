"use client";

import { useActionState } from "react";
import { reviewBugReport } from "@/app/actions/tester-bugs";
import type { BugAdminRow } from "@/lib/tester-bugs";

function statusBadge(status: string) {
  if (status === "accepted") return "bg-emerald-500/20 text-emerald-200 border-emerald-500/40";
  if (status === "rejected") return "bg-rose-500/20 text-rose-200 border-rose-500/40";
  return "bg-amber-500/20 text-amber-200 border-amber-500/40";
}

export function AdminBugsPanel({
  bugs,
  leaderboard,
}: {
  bugs: BugAdminRow[];
  leaderboard: Array<{ user_name: string; accepted_count: number; total_reward: number }>;
}) {
  const initialReviewState: { ok: boolean; error?: string } = { ok: false };
  const [state, action, pending] = useActionState(reviewBugReport, initialReviewState);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
        <h2 className="text-lg font-semibold text-zinc-100">Leaderboard testeri</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {leaderboard.length === 0 ? (
            <p className="text-sm text-zinc-400">Momentan nu exista bug-uri acceptate.</p>
          ) : (
            leaderboard.map((item, idx) => (
              <article key={`${item.user_name}-${idx}`} className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
                <p className="text-sm font-semibold text-zinc-100">#{idx + 1} {item.user_name}</p>
                <p className="mt-1 text-xs text-zinc-400">Accepted: {item.accepted_count}</p>
                <p className="text-xs text-yellow-300">Reward total: {item.total_reward} lei</p>
              </article>
            ))
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
        <h2 className="text-lg font-semibold text-zinc-100">Toate bug-urile raportate</h2>
        {state.error ? (
          <p className="mt-3 rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">{state.error}</p>
        ) : null}
        <div className="mt-4 space-y-3">
          {bugs.length === 0 ? (
            <p className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-400">Nu exista bug-uri.</p>
          ) : (
            bugs.map((bug) => (
              <article key={bug.id} className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold text-zinc-100">{bug.title}</p>
                    <p className="text-xs text-zinc-400">de {bug.user_name} ({bug.user_email})</p>
                  </div>
                  <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold uppercase ${statusBadge(bug.status)}`}>{bug.status}</span>
                </div>
                <p className="mt-2 text-sm text-zinc-300">{bug.description}</p>
                <p className="mt-2 text-xs text-zinc-400">
                  {bug.category.toUpperCase()} · {bug.severity.toUpperCase()} · Reward: {bug.reward} lei
                </p>
                <form action={action} className="mt-4 flex flex-wrap items-center gap-2">
                  <input type="hidden" name="bugId" value={bug.id} />
                  <select
                    name="status"
                    defaultValue={bug.status}
                    className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100"
                  >
                    <option value="open">open</option>
                    <option value="accepted">accepted</option>
                    <option value="rejected">rejected</option>
                  </select>
                  <input
                    type="number"
                    name="reward"
                    defaultValue={bug.reward}
                    min={0}
                    step={1}
                    className="w-28 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100"
                  />
                  <button
                    type="submit"
                    disabled={pending}
                    className="rounded-lg bg-violet-600 px-3 py-2 text-sm font-semibold text-white hover:bg-violet-500 disabled:opacity-60"
                  >
                    Salveaza
                  </button>
                </form>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

