"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { submitBugReport } from "@/app/actions/tester-bugs";
import type { BugRow } from "@/lib/tester-bugs";

function SubmitButton() {
  return (
    <button
      type="submit"
      className="inline-flex items-center justify-center rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-700/30 transition hover:bg-violet-500"
    >
      Trimite bug
    </button>
  );
}

function statusChip(status: string) {
  if (status === "accepted") return "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
  if (status === "rejected") return "bg-rose-500/20 text-rose-300 border-rose-500/40";
  return "bg-amber-500/20 text-amber-200 border-amber-500/40";
}

export function TesterDashboardClient({ bugs }: { bugs: BugRow[] }) {
  const router = useRouter();
  const initialSubmitState: { ok: boolean; message: string; error?: string } = { ok: false, message: "" };
  const [state, formAction, pending] = useActionState(submitBugReport, initialSubmitState);

  useEffect(() => {
    if (state.ok) {
      router.refresh();
    }
  }, [router, state.ok]);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl shadow-black/30">
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-zinc-100">Raporteaza bug nou</h2>
          <span className="rounded-full border border-yellow-500/60 bg-yellow-400/15 px-3 py-1 text-xs font-bold uppercase tracking-wide text-yellow-200">
            Tester VEX
          </span>
        </div>
        <form action={formAction} className="grid gap-4">
          <input
            name="title"
            required
            minLength={4}
            placeholder="Titlu bug"
            className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm text-zinc-100 outline-none ring-violet-500/40 focus:ring"
          />
          <textarea
            name="description"
            required
            minLength={10}
            placeholder="Descriere detaliata"
            rows={5}
            className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-zinc-100 outline-none ring-violet-500/40 focus:ring"
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <select
              name="category"
              required
              defaultValue="ui"
              className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm text-zinc-100 outline-none ring-violet-500/40 focus:ring"
            >
              <option value="ui">UI</option>
              <option value="functional">Functional</option>
              <option value="security">Security</option>
            </select>
            <select
              name="severity"
              required
              defaultValue="medium"
              className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm text-zinc-100 outline-none ring-violet-500/40 focus:ring"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <label className="grid gap-2 text-sm text-zinc-300">
            Screenshot (optional)
            <input
              type="file"
              name="image"
              accept="image/*"
              className="rounded-xl border border-dashed border-zinc-700 bg-zinc-900 px-3 py-2 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-violet-600 file:px-3 file:py-1.5 file:font-medium file:text-white hover:file:bg-violet-500"
            />
          </label>
          {state.error ? (
            <p className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">{state.error}</p>
          ) : null}
          {state.ok ? (
            <p className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">{state.message}</p>
          ) : null}
          <div className="flex items-center justify-between">
            <p className="text-xs text-zinc-400">Status implicit: open · Reward implicit: 0</p>
            <div aria-busy={pending}>
              <SubmitButton />
            </div>
          </div>
        </form>
      </section>

      <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl shadow-black/30">
        <h3 className="text-lg font-semibold text-zinc-100">Bug-urile tale</h3>
        <div className="mt-4 space-y-3">
          {bugs.length === 0 ? (
            <p className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-400">
              Nu ai trimis inca niciun bug.
            </p>
          ) : (
            bugs.map((bug) => (
              <article key={bug.id} className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold text-zinc-100">{bug.title}</p>
                  <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold uppercase ${statusChip(bug.status)}`}>
                    {bug.status}
                  </span>
                </div>
                <p className="mt-2 text-sm text-zinc-300">{bug.description}</p>
                <p className="mt-2 text-xs text-zinc-400">
                  {bug.category.toUpperCase()} · {bug.severity.toUpperCase()} · Reward: {bug.reward} lei
                </p>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

