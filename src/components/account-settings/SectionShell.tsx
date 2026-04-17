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
    <section className="surface-card-soft p-6 text-zinc-900 dark:text-zinc-100 [color-scheme:light] dark:[color-scheme:dark]">
      {kicker ? (
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">{kicker}</p>
      ) : null}
      <h2 className="mt-1 text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">{title}</h2>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{lead}</p>
      <div className="mt-6">{children}</div>
    </section>
  );
}
