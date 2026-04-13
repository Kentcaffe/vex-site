export function SectionShell({
  children,
  kicker,
  title,
  lead,
}: {
  children: React.ReactNode;
  kicker?: string;
  title: string;
  lead: string;
}) {
  return (
    <section className="rounded-2xl border border-zinc-200/80 bg-white/80 p-6 shadow-[0_1px_0_rgba(15,23,42,0.06)] backdrop-blur-sm dark:border-zinc-800/80 dark:bg-zinc-900/80">
      {kicker ? (
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">{kicker}</p>
      ) : null}
      <h2 className="mt-1 text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">{title}</h2>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{lead}</p>
      <div className="mt-6">{children}</div>
    </section>
  );
}
