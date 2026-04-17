/** Persistă tema explicită; `null` = urmează preferința sistemului. */
export const THEME_STORAGE_KEY = "vex-theme" as const;

export type StoredTheme = "light" | "dark";

export function getStoredTheme(): StoredTheme | null {
  if (typeof window === "undefined") return null;
  try {
    const v = localStorage.getItem(THEME_STORAGE_KEY);
    if (v === "light" || v === "dark") return v;
  } catch {
    /* ignore */
  }
  return null;
}

export function setStoredTheme(mode: StoredTheme | null): void {
  try {
    if (mode === null) {
      localStorage.removeItem(THEME_STORAGE_KEY);
    } else {
      localStorage.setItem(THEME_STORAGE_KEY, mode);
    }
  } catch {
    /* quota / private mode */
  }
}

/** Aplică clasa `dark` pe `<html>` după preferință stocată sau sistem. */
export function applyThemeFromStorage(): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const stored = getStoredTheme();
  const prefersDark =
    typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
  const dark = stored === "dark" || (stored !== "light" && prefersDark);
  root.classList.toggle("dark", dark);
  root.style.colorScheme = dark ? "dark" : "light";
}

export function setThemeAndApply(mode: StoredTheme | null): void {
  setStoredTheme(mode);
  applyThemeFromStorage();
}

export function toggleTheme(): void {
  const root = document.documentElement;
  const next: StoredTheme = root.classList.contains("dark") ? "light" : "dark";
  setThemeAndApply(next);
}
