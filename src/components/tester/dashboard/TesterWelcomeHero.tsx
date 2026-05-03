"use client";

type Props = {
  title: string;
  subtitle: string;
  badge: string;
};

export function TesterWelcomeHero({ title, subtitle, badge }: Props) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.1] p-6 shadow-2xl shadow-violet-950/40 sm:p-8">
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-violet-600/90 via-indigo-700/80 to-sky-600/70"
        aria-hidden
      />
      <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-fuchsia-500/30 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-emerald-400/20 blur-3xl" aria-hidden />
      <div className="relative">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white/95 backdrop-blur-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(74,222,128,0.65)]" />
          {badge}
        </span>
        <h1 className="mt-4 text-2xl font-bold tracking-tight text-white sm:text-3xl">{title}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/85 sm:text-base">{subtitle}</p>
      </div>
    </div>
  );
}
