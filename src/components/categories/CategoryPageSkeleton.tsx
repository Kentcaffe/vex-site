export function CategoryPageSkeleton() {
  return (
    <div className="app-shell app-section w-full max-w-full overflow-x-clip" aria-hidden>
      <div className="surface-card p-4">
        <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-stretch sm:gap-2">
          <div className="field-input min-h-[44px] flex-1 animate-pulse bg-zinc-200/80" />
          <div className="btn-primary h-[44px] w-full shrink-0 animate-pulse bg-emerald-200/80 sm:w-[120px]" />
        </div>
      </div>

      <div className="mt-6 flex w-full flex-col gap-6 lg:flex-row lg:items-start">
        <aside className="w-full shrink-0 lg:w-56">
          <div className="mb-2 h-3 w-24 animate-pulse rounded bg-zinc-200" />
          <div className="surface-card grid grid-cols-1 gap-2 p-2 sm:grid-cols-2 lg:block lg:space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-[52px] animate-pulse rounded-xl border border-transparent bg-zinc-100 sm:min-h-0 lg:h-11"
              />
            ))}
          </div>
        </aside>

        <main className="surface-card min-w-0 flex-1 p-4 sm:p-6">
          <div className="h-8 w-48 max-w-[70%] animate-pulse rounded bg-zinc-200 sm:h-9" />
          <div className="mt-6 space-y-10">
            {[0, 1, 2].map((block) => (
              <div key={block}>
                <div className="mb-4 h-6 w-40 animate-pulse rounded bg-zinc-200" />
                <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <li key={i}>
                      <div className="flex min-h-[4.5rem] items-center gap-3 rounded-xl border border-zinc-200/60 bg-zinc-50/60 px-4 py-3">
                        <div className="h-11 w-11 shrink-0 animate-pulse rounded-lg bg-zinc-200" />
                        <div className="h-4 min-w-0 flex-1 animate-pulse rounded bg-zinc-200" />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
