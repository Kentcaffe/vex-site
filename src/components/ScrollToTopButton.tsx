"use client";

export function ScrollToTopButton() {
  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-[calc(var(--mobile-nav-reserve,88px)+10px)] right-4 z-40 flex h-11 w-11 touch-manipulation items-center justify-center rounded-full border border-zinc-300 bg-white text-base font-bold text-zinc-800 shadow-lg ring-2 ring-white/90 active:scale-95 md:bottom-8 md:right-6 md:h-9 md:w-9 md:rounded md:text-sm md:shadow-md lg:hover:bg-zinc-50"
      aria-label="Scroll to top"
    >
      ↑
    </button>
  );
}
