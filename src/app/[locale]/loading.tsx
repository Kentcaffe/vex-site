export default function LocaleLoading() {
  return (
    <div className="app-shell app-section animate-pulse">
      <div className="surface-card p-6 sm:p-8">
        <div className="h-4 w-28 rounded bg-zinc-200" />
        <div className="mt-4 h-10 w-2/3 rounded bg-zinc-200" />
        <div className="mt-3 h-5 w-full rounded bg-zinc-200" />
        <div className="mt-2 h-5 w-4/5 rounded bg-zinc-200" />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="surface-card overflow-hidden">
            <div className="aspect-[4/3] bg-zinc-200" />
            <div className="space-y-3 p-4">
              <div className="h-5 w-4/5 rounded bg-zinc-200" />
              <div className="h-5 w-1/2 rounded bg-zinc-200" />
              <div className="h-4 w-2/3 rounded bg-zinc-200" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
