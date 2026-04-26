"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
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

function statusMeta(status: string) {
  if (status === "accepted") {
    return {
      label: "Acceptat",
      classes: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    };
  }
  if (status === "rejected") {
    return {
      label: "Respins",
      classes: "bg-rose-500/20 text-rose-300 border-rose-500/40",
    };
  }
  return {
    label: "Deschis",
    classes: "bg-amber-500/20 text-amber-200 border-amber-500/40",
  };
}

function categoryLabel(category: string) {
  if (category === "functional") return "Funcțional";
  if (category === "security") return "Securitate";
  return "Interfață (UI)";
}

function severityLabel(severity: string) {
  if (severity === "low") return "Mică";
  if (severity === "high") return "Ridicată";
  return "Medie";
}

export function TesterDashboardClient({ bugs }: { bugs: BugRow[] }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement | null>(null);
  const initialSubmitState: { ok: boolean; message: string; error?: string } = { ok: false, message: "" };
  const [state, formAction, pending] = useActionState(submitBugReport, initialSubmitState);
  const [statusFilter, setStatusFilter] = useState<"all" | "open" | "accepted" | "rejected">("all");
  const [severityFilter, setSeverityFilter] = useState<"all" | "low" | "medium" | "high">("all");
  const [searchText, setSearchText] = useState("");
  const stats = bugs.reduce(
    (acc, bug) => {
      acc.total += 1;
      if (bug.status === "accepted") acc.accepted += 1;
      else if (bug.status === "rejected") acc.rejected += 1;
      else acc.open += 1;
      acc.reward += Number(bug.reward ?? 0);
      return acc;
    },
    { total: 0, open: 0, accepted: 0, rejected: 0, reward: 0 },
  );

  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset();
      router.refresh();
    }
  }, [router, state.ok]);

  const filteredBugs = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    return bugs.filter((bug) => {
      if (statusFilter !== "all" && bug.status !== statusFilter) {
        return false;
      }
      if (severityFilter !== "all" && bug.severity !== severityFilter) {
        return false;
      }
      if (!query) {
        return true;
      }
      return `${bug.title} ${bug.description}`.toLowerCase().includes(query);
    });
  }, [bugs, searchText, severityFilter, statusFilter]);

  return (
    <div className="space-y-6">
      <section className="grid gap-3 rounded-2xl border border-zinc-800 bg-zinc-950 p-4 shadow-2xl shadow-black/30 sm:grid-cols-2 lg:grid-cols-4">
        <article className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-4">
          <p className="text-xs uppercase tracking-wide text-zinc-400">Total raportări</p>
          <p className="mt-2 text-2xl font-bold text-zinc-100">{stats.total}</p>
        </article>
        <article className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
          <p className="text-xs uppercase tracking-wide text-amber-200/80">Deschise</p>
          <p className="mt-2 text-2xl font-bold text-amber-100">{stats.open}</p>
        </article>
        <article className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
          <p className="text-xs uppercase tracking-wide text-emerald-200/80">Acceptate</p>
          <p className="mt-2 text-2xl font-bold text-emerald-100">{stats.accepted}</p>
        </article>
        <article className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4">
          <p className="text-xs uppercase tracking-wide text-yellow-200/80">Recompense totale</p>
          <p className="mt-2 text-2xl font-bold text-yellow-100">{stats.reward} lei</p>
        </article>
      </section>

      <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl shadow-black/30">
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-zinc-100">Raporteaza bug nou</h2>
          <span className="rounded-full border border-yellow-500/60 bg-yellow-400/15 px-3 py-1 text-xs font-bold uppercase tracking-wide text-yellow-200">
            Tester VEX
          </span>
        </div>
        <div className="mb-5 rounded-xl border border-violet-600/30 bg-violet-950/20 p-4 text-sm text-zinc-200">
          <p className="font-semibold text-violet-200">Cum trimiți un raport util (obligatoriu)</p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-zinc-300">
            <li>Descrie exact pașii, în ordine (ce ai apăsat și unde).</li>
            <li>Scrie clar diferența dintre rezultatul așteptat și rezultatul actual.</li>
            <li>Adaugă browser + device + link pagină, ca echipa să poată reproduce rapid.</li>
            <li>Nu trimite „nu merge” fără detalii; astfel de rapoarte vor fi respinse.</li>
          </ul>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <p className="rounded-lg border border-emerald-600/30 bg-emerald-950/20 px-3 py-2 text-xs text-emerald-200">
              <span className="font-semibold">Exemplu bun:</span> &quot;La publicare anunț, după click pe Salvează, primesc eroare 500.
              Așteptat: anunț salvat. Actual: blocat. Chrome 135 / Windows 11.&quot;
            </p>
            <p className="rounded-lg border border-rose-600/30 bg-rose-950/20 px-3 py-2 text-xs text-rose-200">
              <span className="font-semibold">Exemplu slab:</span> &quot;Nu merge site-ul!!!&quot;
                          </p>
          </div>
        </div>
        <form ref={formRef} action={formAction} className="grid gap-4">
          <p className="text-xs text-zinc-400">Titlu scurt + impact (ex: „Nu se poate publica anunț pe mobil”).</p>
          <input
            name="title"
            required
            minLength={4}
            placeholder="Titlu bug"
            className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm text-zinc-100 outline-none ring-violet-500/40 focus:ring"
          />
          <p className="text-xs text-zinc-400">Descriere pe scurt: când apare, cât de des apare, ce secțiune e afectată.</p>
          <textarea
            name="description"
            required
            minLength={10}
            placeholder="Descriere detaliata"
            rows={5}
            className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-zinc-100 outline-none ring-violet-500/40 focus:ring"
          />
          <p className="text-xs text-zinc-400">Pași clari, numerotați (1, 2, 3...). Fără pași exacți, bug-ul nu poate fi validat.</p>
          <textarea
            name="stepsToReproduce"
            required
            minLength={10}
            placeholder="Pași de reproducere (1. ... 2. ... 3. ...)"
            rows={4}
            className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-zinc-100 outline-none ring-violet-500/40 focus:ring"
          />
          <p className="text-xs text-zinc-400">Compară clar: ce trebuia să se întâmple vs ce s-a întâmplat de fapt.</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <textarea
              name="expectedResult"
              required
              minLength={5}
              placeholder="Rezultat așteptat"
              rows={3}
              className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-zinc-100 outline-none ring-violet-500/40 focus:ring"
            />
            <textarea
              name="actualResult"
              required
              minLength={5}
              placeholder="Rezultat actual"
              rows={3}
              className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-zinc-100 outline-none ring-violet-500/40 focus:ring"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <input
              name="pageUrl"
              type="url"
              placeholder="URL pagină afectată (https://...)"
              className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm text-zinc-100 outline-none ring-violet-500/40 focus:ring"
            />
            <select
              name="reproducibility"
              defaultValue="always"
              className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm text-zinc-100 outline-none ring-violet-500/40 focus:ring"
            >
              <option value="always">Se reproduce mereu</option>
              <option value="sometimes">Se reproduce uneori</option>
              <option value="once">S-a întâmplat o singură dată</option>
            </select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <input
              name="browserInfo"
              placeholder="Browser (ex: Chrome 135, Safari 17)"
              className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm text-zinc-100 outline-none ring-violet-500/40 focus:ring"
            />
            <input
              name="deviceInfo"
              placeholder="Device/OS (ex: iPhone 13 iOS 18, Windows 11)"
              className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm text-zinc-100 outline-none ring-violet-500/40 focus:ring"
            />
          </div>
          <p className="text-xs text-zinc-400">Alege categoria și severitatea realist, ca trierea să fie corectă.</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <select
              name="category"
              required
              defaultValue="ui"
              className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm text-zinc-100 outline-none ring-violet-500/40 focus:ring"
            >
              <option value="ui">Interfață (UI)</option>
              <option value="functional">Funcțional</option>
              <option value="security">Securitate</option>
            </select>
            <select
              name="severity"
              required
              defaultValue="medium"
              className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm text-zinc-100 outline-none ring-violet-500/40 focus:ring"
            >
              <option value="low">Mică</option>
              <option value="medium">Medie</option>
              <option value="high">Ridicată</option>
            </select>
          </div>
          <label className="grid gap-2 text-sm text-zinc-300">
            Screenshot (opțional)
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
            <p className="text-xs text-zinc-400">Status implicit: open · Reward implicit: 0 · Rapoartele fără detalii suficiente pot fi respinse.</p>
            <div aria-busy={pending}>
              <SubmitButton />
            </div>
          </div>
        </form>
      </section>

      <section className="rounded-2xl border border-violet-700/40 bg-gradient-to-r from-zinc-950 to-violet-950/40 p-6 shadow-2xl shadow-black/30">
        <h3 className="text-lg font-semibold text-zinc-100">Ghid rapid pentru testeri</h3>
        <ul className="mt-3 space-y-2 text-sm text-zinc-300">
          <li>1) Verifică bug-ul de minim 2 ori înainte să raportezi.</li>
          <li>2) Dacă e posibil, testează și pe alt browser/dispozitiv ca să confirmi.</li>
          <li>3) Scrie pașii numerotați; evită formulări generale („nu merge”).</li>
          <li>4) „Ridicată” = blocaj sever / securitate. Pentru bug-uri minore folosește „Mică” sau „Medie”.</li>
          <li>5) Un screenshot clar + URL exact reduc timpul de analiză și cresc șansele de acceptare.</li>
        </ul>
      </section>

      <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl shadow-black/30">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h3 className="text-lg font-semibold text-zinc-100">Bug-urile tale</h3>
          <div className="grid gap-2 sm:grid-cols-3">
            <input
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Caută titlu/descriere..."
              className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs text-zinc-100"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "all" | "open" | "accepted" | "rejected")}
              className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs text-zinc-100"
            >
              <option value="all">Toate statusurile</option>
              <option value="open">Deschis</option>
              <option value="accepted">Acceptat</option>
              <option value="rejected">Respins</option>
            </select>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value as "all" | "low" | "medium" | "high")}
              className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs text-zinc-100"
            >
              <option value="all">Toate severitățile</option>
              <option value="low">Mică</option>
              <option value="medium">Medie</option>
              <option value="high">Ridicată</option>
            </select>
          </div>
        </div>
        <div className="mt-4 space-y-3">
          {filteredBugs.length === 0 ? (
            <p className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-400">
              Nu există rezultate pentru filtrele selectate.
            </p>
          ) : (
            filteredBugs.map((bug) => (
              <article key={bug.id} className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold text-zinc-100">{bug.title}</p>
                  <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold uppercase ${statusMeta(bug.status).classes}`}>
                    {statusMeta(bug.status).label}
                  </span>
                </div>
                <p className="mt-2 text-sm text-zinc-300">{bug.description}</p>
                <p className="mt-2 text-xs text-zinc-400">
                  {categoryLabel(bug.category)} · Severitate: {severityLabel(bug.severity)} · Recompensă: {bug.reward} lei
                </p>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

