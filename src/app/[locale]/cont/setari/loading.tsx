export default function AccountSettingsLoading() {
  return (
    <div className="app-shell app-section">
      <div className="mb-6 h-5 w-40 animate-pulse rounded bg-zinc-200" />

      <div className="mb-8 overflow-hidden rounded-3xl border border-emerald-200/70 bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-6 shadow-sm">
        <div className="h-4 w-32 animate-pulse rounded bg-emerald-100" />
        <div className="mt-4 h-8 w-64 animate-pulse rounded bg-zinc-200" />
        <div className="mt-3 h-4 w-80 max-w-full animate-pulse rounded bg-zinc-200" />
      </div>

      <div className="flex flex-col gap-8 lg:flex-row lg:gap-10">
        <aside className="lg:w-64 lg:shrink-0">
          <div className="rounded-2xl border border-zinc-200/80 bg-white p-2 shadow-sm">
            <div className="flex gap-1 overflow-hidden lg:flex-col">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-11 min-w-[120px] animate-pulse rounded-xl bg-zinc-200 lg:min-w-0" />
              ))}
            </div>
          </div>
        </aside>
        <div className="min-w-0 flex-1 rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-sm">
          <div className="space-y-4">
            <div className="h-5 w-40 animate-pulse rounded bg-zinc-200" />
            <div className="h-4 w-72 max-w-full animate-pulse rounded bg-zinc-200" />
            <div className="h-44 animate-pulse rounded-2xl bg-zinc-100" />
          </div>
        </div>
      </div>
    </div>
  );
}
