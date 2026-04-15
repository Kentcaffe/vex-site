"use client";

export function ScrollToTopButton() {
  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom,0px))] left-4 z-40 flex h-11 w-11 touch-manipulation items-center justify-center rounded-full border border-zinc-300 bg-white text-base text-zinc-600 shadow-md active:scale-95 md:bottom-6 md:h-9 md:w-9 md:rounded md:text-sm lg:hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-300 lg:dark:hover:bg-zinc-800"
      aria-label="Scroll to top"
    >
      ↑
    </button>
  );
}
