export default function ListingsLoading() {
  return (
    <div className="app-shell app-section animate-pulse">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-xl">
          <div className="h-10 w-48 rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="mt-3 h-5 w-full rounded bg-zinc-200 dark:bg-zinc-800" />
        </div>
        <div className="flex gap-3 md:hidden">
          <div className="h-12 w-28 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-12 w-28 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[260px_minmax(0,1fr)]">
        <div className="hidden xl:block">
          <div className="surface-card h-[620px] bg-zinc-100 dark:bg-zinc-900" />
        </div>
        <div className="space-y-5">
          <div className="surface-card h-56 bg-zinc-100 dark:bg-zinc-900" />
          <div className="surface-card p-4">
            <div className="mb-4 h-14 rounded bg-zinc-100 dark:bg-zinc-800" />
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-4 rounded-[16px] border border-zinc-200/80 p-3 dark:border-zinc-800 sm:flex-row">
                  <div className="h-48 rounded-[14px] bg-zinc-200 dark:bg-zinc-800 sm:h-36 sm:w-44" />
                  <div className="flex-1 space-y-3">
                    <div className="h-6 w-3/4 rounded bg-zinc-200 dark:bg-zinc-800" />
                    <div className="h-5 w-32 rounded bg-zinc-200 dark:bg-zinc-800" />
                    <div className="h-4 w-1/2 rounded bg-zinc-200 dark:bg-zinc-800" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
