"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { toggleTheme } from "@/lib/theme-storage";

type Props = {
  className?: string;
  labelLight: string;
  labelDark: string;
};

function subscribe(onChange: () => void) {
  const root = document.documentElement;
  const obs = new MutationObserver(onChange);
  obs.observe(root, { attributes: true, attributeFilter: ["class"] });
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  mq.addEventListener("change", onChange);
  return () => {
    obs.disconnect();
    mq.removeEventListener("change", onChange);
  };
}

function getDarkSnapshot(): boolean {
  return document.documentElement.classList.contains("dark");
}

function getServerSnapshot(): boolean {
  return false;
}

export function ThemeToggle({ className = "", labelLight, labelDark }: Props) {
  const dark = useSyncExternalStore(subscribe, getDarkSnapshot, getServerSnapshot);

  return (
    <button
      type="button"
      onClick={() => {
        toggleTheme();
      }}
      className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--mp-border)] bg-[var(--mp-surface)] text-[var(--mp-text-muted)] shadow-sm transition hover:bg-[var(--mp-surface-muted)] hover:text-[var(--mp-text)] ${className}`}
      aria-label={dark ? labelLight : labelDark}
      title={dark ? labelLight : labelDark}
    >
      {dark ? <Sun className="h-5 w-5" strokeWidth={2} aria-hidden /> : <Moon className="h-5 w-5" strokeWidth={2} aria-hidden />}
    </button>
  );
}
