"use client";

export function ScrollToTopButton() {
  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-6 left-4 z-40 flex h-9 w-9 items-center justify-center rounded border border-zinc-300 bg-white text-sm text-zinc-600 shadow-sm hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
      aria-label="Scroll to top"
    >
      ↑
    </button>
  );
}
