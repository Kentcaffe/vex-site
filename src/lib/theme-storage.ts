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

/** Aplicația folosește exclusiv tema light pe `<html>`. */
export function applyThemeFromStorage(): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.remove("dark");
  root.style.colorScheme = "light";
  try {
    localStorage.setItem(THEME_STORAGE_KEY, "light");
  } catch {
    /* ignore */
  }
}

export function setThemeAndApply(): void {
  setStoredTheme("light");
  applyThemeFromStorage();
}

export function toggleTheme(): void {
  applyThemeFromStorage();
}
