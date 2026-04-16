export default function LoadingListingDetail() {
  return (
    <div className="app-shell app-section animate-pulse">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-4">
          <div className="surface-card aspect-[4/3] bg-zinc-200 dark:bg-zinc-800" />
          <div className="surface-card p-6">
            <div className="h-8 w-2/3 rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="mt-3 h-5 w-1/3 rounded bg-zinc-200 dark:bg-zinc-800" />
          </div>
          <div className="surface-card p-6">
            <div className="h-4 w-full rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="mt-3 h-4 w-5/6 rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="mt-3 h-4 w-4/6 rounded bg-zinc-200 dark:bg-zinc-800" />
          </div>
        </div>
        <div className="surface-card h-72 bg-zinc-200 dark:bg-zinc-800" />
      </div>
    </div>
  );
}
