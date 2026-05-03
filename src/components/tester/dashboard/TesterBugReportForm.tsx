"use client";

import type { ReactNode } from "react";
import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { Plus, Trash2, Upload } from "lucide-react";
import { submitBugReport } from "@/app/actions/tester-bugs";

type BugFormValues = {
  title: string;
  description: string;
  expectedResult: string;
  actualResult: string;
  pageUrl: string;
  reproducibility: "always" | "sometimes" | "once";
  browserInfo: string;
  deviceInfo: string;
  category: "ui" | "functional" | "security";
  severity: "low" | "medium" | "high";
};

const initialBugFormValues: BugFormValues = {
  title: "",
  description: "",
  expectedResult: "",
  actualResult: "",
  pageUrl: "",
  reproducibility: "always",
  browserInfo: "",
  deviceInfo: "",
  category: "ui",
  severity: "medium",
};

function GlassPanel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-white/[0.08] bg-white/[0.05] p-6 shadow-xl shadow-black/40 backdrop-blur-xl sm:p-8 ${className}`}
    >
      {children}
    </div>
  );
}

function inputClass() {
  return "w-full rounded-xl border border-white/[0.1] bg-black/30 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-violet-400/50 focus:ring-2 focus:ring-violet-500/25";
}

function severityRing(sev: BugFormValues["severity"]) {
  if (sev === "low") return "border-emerald-500/40 text-emerald-100 focus:border-emerald-400/60";
  if (sev === "high") return "border-rose-500/40 text-rose-100 focus:border-rose-400/60";
  return "border-amber-500/40 text-amber-100 focus:border-amber-400/60";
}

export type TesterBugReportFormCopy = {
  title: string;
  badge: string;
  tipsTitle: string;
  tipsBody: string;
  fieldTitle: string;
  fieldTitlePh: string;
  fieldDescription: string;
  fieldDescriptionPh: string;
  fieldSteps: string;
  stepPh: string;
  addStep: string;
  removeStepAria: string;
  fieldExpected: string;
  fieldExpectedPh: string;
  fieldActual: string;
  fieldActualPh: string;
  fieldPageUrl: string;
  fieldPageUrlPh: string;
  fieldRepro: string;
  reproAlways: string;
  reproSometimes: string;
  reproOnce: string;
  fieldBrowser: string;
  fieldBrowserPh: string;
  fieldDevice: string;
  fieldDevicePh: string;
  fieldCategory: string;
  catUi: string;
  catFunctional: string;
  catSecurity: string;
  fieldSeverity: string;
  sevLow: string;
  sevMed: string;
  sevHigh: string;
  screenshotsLabel: string;
  screenshotsDrag: string;
  screenshotsBrowse: string;
  screenshotsCount: string;
  termsLabel: string;
  termsError: string;
  submit: string;
  submitting: string;
  footerHint: string;
};

type Props = {
  copy: TesterBugReportFormCopy;
  formRef: React.RefObject<HTMLFormElement | null>;
  onSuccessAction?: () => void;
};

export function TesterBugReportForm({ copy, formRef, onSuccessAction }: Props) {
  const initialSubmitState = { ok: false, message: "", error: "" as string | undefined };
  const [state, formAction, pending] = useActionState(submitBugReport, initialSubmitState);
  const [formValues, setFormValues] = useState<BugFormValues>(initialBugFormValues);
  const [stepLines, setStepLines] = useState<string[]>([""]);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [fileCount, setFileCount] = useState(0);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsError, setTermsError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const builtSteps = useMemo(() => {
    const lines = stepLines.map((s) => s.trim()).filter(Boolean);
    return lines.map((line, i) => `${i + 1}. ${line}`).join("\n");
  }, [stepLines]);

  useEffect(() => {
    if (state.ok) {
      queueMicrotask(() => {
        formRef.current?.reset();
        setFormValues(initialBugFormValues);
        setStepLines([""]);
        setFileInputKey((v) => v + 1);
        setFileCount(0);
        setTermsAccepted(false);
        setTermsError(false);
      });
      onSuccessAction?.();
    }
  }, [formRef, onSuccessAction, state.ok]);

  function addStep() {
    setStepLines((s) => [...s, ""]);
  }

  function removeStep(index: number) {
    setStepLines((s) => (s.length <= 1 ? s : s.filter((_, i) => i !== index)));
  }

  function updateStep(index: number, value: string) {
    setStepLines((s) => s.map((line, i) => (i === index ? value : line)));
  }

  function onDropFiles(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    const input = fileInputRef.current;
    if (!input || !e.dataTransfer?.files?.length) {
      return;
    }
    const dt = new DataTransfer();
    const max = Math.min(e.dataTransfer.files.length, 5);
    for (let i = 0; i < max; i += 1) {
      dt.items.add(e.dataTransfer.files[i]);
    }
    input.files = dt.files;
    setFileCount(max);
  }

  return (
    <div id="report">
      <GlassPanel>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">{copy.title}</h2>
          <span className="mt-2 inline-flex rounded-full border border-violet-400/40 bg-violet-500/15 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-violet-200">
            {copy.badge}
          </span>
        </div>
      </div>

      <div className="mb-8 rounded-2xl border border-violet-500/25 bg-gradient-to-br from-violet-950/40 to-indigo-950/30 p-4 text-sm text-slate-300">
        <p className="font-semibold text-violet-200">{copy.tipsTitle}</p>
        <p className="mt-2 leading-relaxed text-slate-400">{copy.tipsBody}</p>
      </div>

      <form
        ref={formRef}
        action={formAction}
        onSubmit={(e) => {
          if (!termsAccepted) {
            e.preventDefault();
            setTermsError(true);
            return;
          }
          setTermsError(false);
        }}
        className="space-y-6"
      >
        <input type="hidden" name="stepsToReproduce" value={builtSteps} readOnly />

        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">{copy.fieldTitle}</label>
          <input
            name="title"
            required
            minLength={4}
            value={formValues.title}
            onChange={(e) => setFormValues((p) => ({ ...p, title: e.target.value }))}
            placeholder={copy.fieldTitlePh}
            className={inputClass()}
          />
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">{copy.fieldDescription}</label>
          <textarea
            name="description"
            required
            minLength={10}
            rows={5}
            value={formValues.description}
            onChange={(e) => setFormValues((p) => ({ ...p, description: e.target.value }))}
            placeholder={copy.fieldDescriptionPh}
            className={inputClass()}
          />
        </div>

        <div>
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">{copy.fieldSteps}</label>
            <button
              type="button"
              onClick={addStep}
              className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-200 transition hover:bg-emerald-500/20"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden />
              {copy.addStep}
            </button>
          </div>
          <div className="space-y-2">
            {stepLines.map((line, index) => (
              <div key={index} className="flex gap-2">
                <span className="flex w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] text-xs font-bold text-slate-500">
                  {index + 1}
                </span>
                <input
                  value={line}
                  onChange={(e) => updateStep(index, e.target.value)}
                  placeholder={copy.stepPh}
                  className={inputClass()}
                />
                <button
                  type="button"
                  aria-label={copy.removeStepAria}
                  disabled={stepLines.length <= 1}
                  onClick={() => removeStep(index)}
                  className="shrink-0 rounded-xl border border-white/10 p-2.5 text-slate-400 transition hover:border-rose-500/40 hover:bg-rose-500/10 hover:text-rose-300 disabled:opacity-30"
                >
                  <Trash2 className="h-4 w-4" aria-hidden />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">{copy.fieldExpected}</label>
            <textarea
              name="expectedResult"
              required
              minLength={5}
              rows={3}
              value={formValues.expectedResult}
              onChange={(e) => setFormValues((p) => ({ ...p, expectedResult: e.target.value }))}
              placeholder={copy.fieldExpectedPh}
              className={inputClass()}
            />
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">{copy.fieldActual}</label>
            <textarea
              name="actualResult"
              required
              minLength={5}
              rows={3}
              value={formValues.actualResult}
              onChange={(e) => setFormValues((p) => ({ ...p, actualResult: e.target.value }))}
              placeholder={copy.fieldActualPh}
              className={inputClass()}
            />
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">{copy.fieldPageUrl}</label>
            <input
              name="pageUrl"
              type="url"
              value={formValues.pageUrl}
              onChange={(e) => setFormValues((p) => ({ ...p, pageUrl: e.target.value }))}
              placeholder={copy.fieldPageUrlPh}
              className={inputClass()}
            />
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">{copy.fieldRepro}</label>
            <select
              name="reproducibility"
              value={formValues.reproducibility}
              onChange={(e) =>
                setFormValues((p) => ({
                  ...p,
                  reproducibility: e.target.value as BugFormValues["reproducibility"],
                }))
              }
              className={inputClass()}
            >
              <option value="always">{copy.reproAlways}</option>
              <option value="sometimes">{copy.reproSometimes}</option>
              <option value="once">{copy.reproOnce}</option>
            </select>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">{copy.fieldBrowser}</label>
            <input
              name="browserInfo"
              value={formValues.browserInfo}
              onChange={(e) => setFormValues((p) => ({ ...p, browserInfo: e.target.value }))}
              placeholder={copy.fieldBrowserPh}
              className={inputClass()}
            />
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">{copy.fieldDevice}</label>
            <input
              name="deviceInfo"
              value={formValues.deviceInfo}
              onChange={(e) => setFormValues((p) => ({ ...p, deviceInfo: e.target.value }))}
              placeholder={copy.fieldDevicePh}
              className={inputClass()}
            />
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">{copy.fieldCategory}</label>
            <select
              name="category"
              required
              value={formValues.category}
              onChange={(e) =>
                setFormValues((p) => ({
                  ...p,
                  category: e.target.value as BugFormValues["category"],
                }))
              }
              className={inputClass()}
            >
              <option value="ui">{copy.catUi}</option>
              <option value="functional">{copy.catFunctional}</option>
              <option value="security">{copy.catSecurity}</option>
            </select>
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">{copy.fieldSeverity}</label>
            <select
              name="severity"
              required
              value={formValues.severity}
              onChange={(e) =>
                setFormValues((p) => ({
                  ...p,
                  severity: e.target.value as BugFormValues["severity"],
                }))
              }
              className={`${inputClass()} ${severityRing(formValues.severity)}`}
            >
              <option value="low">{copy.sevLow}</option>
              <option value="medium">{copy.sevMed}</option>
              <option value="high">{copy.sevHigh}</option>
            </select>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">{copy.screenshotsLabel}</label>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onDrop={onDropFiles}
            className="relative rounded-2xl border border-dashed border-white/15 bg-black/25 px-4 py-10 text-center transition hover:border-violet-400/40"
          >
            <Upload className="mx-auto h-10 w-10 text-slate-500" aria-hidden />
            <p className="mt-3 text-sm text-slate-400">{copy.screenshotsDrag}</p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-violet-900/40 transition hover:from-violet-500 hover:to-indigo-500"
            >
              {copy.screenshotsBrowse}
            </button>
            <input
              ref={fileInputRef}
              key={fileInputKey}
              type="file"
              name="images"
              multiple
              accept="image/*"
              className="sr-only"
              onChange={(e) => {
                const files = e.target.files;
                const safeCount = files ? Math.min(files.length, 5) : 0;
                setFileCount(safeCount);
                if (files && files.length > 5) {
                  setTimeout(() => {
                    e.currentTarget.value = "";
                    setFileCount(0);
                  }, 0);
                }
              }}
            />
          </div>
          <p className="mt-2 text-xs text-slate-500">
            {copy.screenshotsCount}: {fileCount}/5
          </p>
        </div>

        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/[0.08] bg-black/20 p-4">
          <input
            type="checkbox"
            checked={termsAccepted}
            onChange={(e) => {
              setTermsAccepted(e.target.checked);
              if (e.target.checked) {
                setTermsError(false);
              }
            }}
            className="mt-1 h-4 w-4 rounded border-slate-500 bg-slate-800 text-emerald-500 focus:ring-emerald-500/40"
          />
          <span className="text-sm text-slate-300">{copy.termsLabel}</span>
        </label>
        {termsError ? <p className="text-sm text-rose-400">{copy.termsError}</p> : null}

        {state.error ? (
          <p className="rounded-xl border border-rose-500/35 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{state.error}</p>
        ) : null}
        {state.ok ? (
          <p className="rounded-xl border border-emerald-500/35 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{state.message}</p>
        ) : null}

        <div className="flex flex-col gap-4 border-t border-white/[0.06] pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-xl text-xs leading-relaxed text-slate-500">{copy.footerHint}</p>
          <button
            type="submit"
            disabled={pending}
            className="inline-flex min-h-[48px] min-w-[200px] items-center justify-center rounded-2xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-sky-600 px-8 text-sm font-bold text-white shadow-xl shadow-violet-950/50 transition hover:brightness-110 disabled:opacity-50"
          >
            {pending ? copy.submitting : copy.submit}
          </button>
        </div>
      </form>
      </GlassPanel>
    </div>
  );
}
