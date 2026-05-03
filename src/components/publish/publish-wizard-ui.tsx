"use client";

import type { LucideIcon } from "lucide-react";
import {
  Car,
  FileText,
  ImageIcon,
  MapPin,
  Megaphone,
  MessageCircle,
  Phone,
  Rocket,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import type { ReactNode } from "react";

const GREEN = "#16a34a";

export function PublishFormSectionCard({
  id,
  dataStep,
  title,
  subtitle,
  children,
  className = "",
}: {
  id?: string;
  /** Pentru scroll-spy între pașii din sidebar. */
  dataStep?: number;
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      data-publish-step={dataStep}
      className={`scroll-mt-28 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-[0_1px_3px_rgb(15_23_42/0.06),0_8px_24px_-8px_rgb(15_23_42/0.08)] sm:p-6 ${className}`}
    >
      <header className="mb-5 flex flex-col gap-1">
        <h2 className="text-lg font-semibold tracking-tight text-slate-900">{title}</h2>
        {subtitle ? <p className="text-sm text-slate-500">{subtitle}</p> : null}
      </header>
      <div className="flex flex-col gap-4">{children}</div>
    </section>
  );
}

export type WizardStepDef = {
  step: number;
  icon: LucideIcon;
  title: string;
  description: string;
};

export function PublishWizardSidebar({
  steps,
  activeStep,
  onStepClickAction,
  benefitsTitle,
  benefits,
}: {
  steps: WizardStepDef[];
  activeStep: number;
  onStepClickAction: (step: number) => void;
  benefitsTitle: string;
  benefits: { icon: LucideIcon; title: string; body: string }[];
}) {
  return (
    <div className="flex flex-col gap-6">
      <nav
        aria-label="Pași publicare"
        className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] lg:flex-col lg:gap-1 lg:overflow-visible lg:pb-0 [&::-webkit-scrollbar]:hidden"
      >
        {steps.map((s) => {
          const Icon = s.icon;
          const active = activeStep === s.step;
          return (
            <button
              key={s.step}
              type="button"
              onClick={() => onStepClickAction(s.step)}
              className={`flex min-w-[220px] shrink-0 gap-3 rounded-xl border p-3 text-left transition lg:min-w-0 lg:p-3.5 ${
                active
                  ? "border-[#16a34a]/35 bg-emerald-50/90 shadow-sm ring-1 ring-[#16a34a]/20"
                  : "border-transparent bg-white/60 hover:border-slate-200 hover:bg-white"
              } `}
            >
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                  active ? "bg-[#16a34a] text-white" : "bg-slate-100 text-slate-600"
                }`}
              >
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <span className="min-w-0">
                <span className={`block text-sm font-semibold ${active ? "text-emerald-900" : "text-slate-900"}`}>
                  {s.title}
                </span>
                <span className="mt-0.5 line-clamp-2 text-xs leading-snug text-slate-500">{s.description}</span>
              </span>
            </button>
          );
        })}
      </nav>

      <div className="hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm lg:block">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{benefitsTitle}</p>
        <ul className="mt-3 space-y-3">
          {benefits.map((b) => {
            const B = b.icon;
            return (
              <li key={b.title} className="flex gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-[#16a34a]">
                  <B className="h-4 w-4" aria-hidden />
                </span>
                <span>
                  <span className="block text-sm font-medium text-slate-900">{b.title}</span>
                  <span className="text-xs text-slate-500">{b.body}</span>
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

export function PublishLivePreviewPanel({
  imageSrc,
  title,
  priceLine,
  tags,
  locationLine,
  timeLabel,
  infoText,
  previewLabel,
  negotiableLabel,
  negotiable,
}: {
  imageSrc: string | null;
  title: string;
  priceLine: string;
  tags: string[];
  locationLine: string;
  timeLabel: string;
  infoText: string;
  previewLabel: string;
  negotiableLabel: string;
  negotiable: boolean;
}) {
  const displayTitle = title.trim() || "—";
  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{previewLabel}</p>
      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_8px_30px_-12px_rgb(15_23_42/0.12)]">
        <div className="relative aspect-[16/10] bg-slate-100">
          {imageSrc ? (
            // eslint-disable-next-line @next/next/no-img-element -- preview URLs may be external or uploads
            <img src={imageSrc} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-slate-400">
              <ImageIcon className="h-12 w-12 opacity-40" aria-hidden />
            </div>
          )}
        </div>
        <div className="space-y-3 p-4">
          <h3 className="line-clamp-2 text-base font-semibold leading-snug text-slate-900">{displayTitle}</h3>
          <p className="text-xl font-bold tabular-nums" style={{ color: GREEN }}>
            {priceLine}
          </p>
          {negotiable ? (
            <p className="text-xs font-medium text-slate-500">{negotiableLabel}</p>
          ) : null}
          {tags.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700"
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
          <div className="flex items-start gap-2 border-t border-slate-100 pt-3 text-xs text-slate-500">
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden />
            <span className="min-w-0 flex-1 leading-snug">{locationLine || "—"}</span>
            <span className="shrink-0 text-slate-400">{timeLabel}</span>
          </div>
        </div>
      </div>
      <div
        className="rounded-xl border border-emerald-100 bg-emerald-50/80 p-4 text-sm leading-relaxed text-emerald-950"
        style={{ borderColor: "rgb(167 243 208 / 0.8)" }}
      >
        <div className="flex gap-2">
          <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-[#16a34a]" aria-hidden />
          <p>{infoText}</p>
        </div>
      </div>
    </div>
  );
}

export function PublishWizardGrid({
  sidebar,
  main,
  preview,
}: {
  sidebar: ReactNode;
  main: ReactNode;
  preview: ReactNode;
}) {
  return (
    <div className="w-full">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-[minmax(0,200px)_1fr] md:gap-8 lg:grid-cols-[minmax(0,220px)_minmax(0,1fr)_minmax(260px,320px)] lg:items-start">
        <aside className="md:sticky md:top-24 md:self-start md:max-lg:max-h-[calc(100vh-6rem)] md:max-lg:overflow-y-auto lg:top-28">
          {sidebar}
        </aside>
        <div className="min-w-0 space-y-6 md:col-start-2 md:row-start-1 lg:col-start-2">{main}</div>
        <aside className="hidden min-w-0 md:block md:col-span-2 md:row-start-2 md:max-lg:max-w-xl md:max-lg:justify-self-center lg:col-span-1 lg:col-start-3 lg:row-start-1 lg:block lg:max-w-none lg:justify-self-stretch lg:sticky lg:top-28 lg:self-start">
          {preview}
        </aside>
      </div>
    </div>
  );
}

export function PublishMobileBenefits({
  title,
  benefits,
}: {
  title: string;
  benefits: { icon: LucideIcon; title: string; body: string }[];
}) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm lg:hidden">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</p>
      <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {benefits.map((b) => {
          const B = b.icon;
          return (
            <li key={b.title} className="flex flex-col gap-1.5 rounded-lg bg-slate-50/80 p-2.5">
              <B className="h-4 w-4 text-[#16a34a]" aria-hidden />
              <span className="text-xs font-semibold text-slate-900">{b.title}</span>
              <span className="text-[11px] leading-snug text-slate-500">{b.body}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
