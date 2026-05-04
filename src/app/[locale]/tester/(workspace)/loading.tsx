export default function TesterWorkspaceLoading() {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-[#0B0F1A] text-slate-200">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(124,58,237,0.22),transparent)]" />
      <div className="relative mx-auto max-w-[1200px] px-4 py-8 sm:px-6 lg:py-10">
        <div className="grid animate-pulse grid-cols-1 gap-8 lg:grid-cols-[220px_minmax(0,1fr)] xl:grid-cols-[220px_minmax(0,1fr)_300px]">
          <aside className="hidden lg:block">
            <div className="space-y-2 rounded-2xl border border-white/[0.08] bg-white/[0.04] p-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-11 rounded-xl bg-white/[0.06]" />
              ))}
            </div>
          </aside>
          <div className="flex flex-col gap-6">
            <div className="h-40 rounded-2xl bg-white/[0.06]" />
            <div className="h-64 rounded-2xl bg-white/[0.05]" />
            <div className="h-48 rounded-2xl bg-white/[0.05]" />
          </div>
          <div className="col-span-full hidden h-80 rounded-2xl bg-white/[0.05] xl:col-span-1 xl:block" />
        </div>
      </div>
    </div>
  );
}
