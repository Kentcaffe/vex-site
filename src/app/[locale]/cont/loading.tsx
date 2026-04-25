export default function AccountLoading() {
  return (
    <div className="app-shell app-section pb-4">
      <div className="mb-6 overflow-hidden rounded-3xl border border-emerald-200/70 bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-5 shadow-sm sm:p-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 animate-pulse rounded-full bg-emerald-100" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-4 w-28 animate-pulse rounded bg-emerald-100" />
            <div className="h-6 w-44 animate-pulse rounded bg-zinc-200" />
            <div className="h-4 w-56 animate-pulse rounded bg-zinc-200" />
          </div>
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <div className="h-16 animate-pulse rounded-xl bg-white/80" />
          <div className="h-16 animate-pulse rounded-xl bg-white/80" />
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200/80 bg-white p-2 shadow-sm">
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl border border-zinc-200/90 bg-white px-4 py-3">
              <div className="h-11 w-11 animate-pulse rounded-2xl bg-zinc-200" />
              <div className="h-4 w-40 animate-pulse rounded bg-zinc-200" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
