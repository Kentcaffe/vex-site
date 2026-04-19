"use client";

import { useEffect } from "react";
import { usePathname } from "@/i18n/navigation";

/** Tema aplicației este fixă (light). Resetează clasa `dark` după navigări client (ex. din Cont). */
export function ForceLightTheme() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("dark");
    root.style.colorScheme = "light";
    try {
      localStorage.setItem("vex-theme", "light");
    } catch {
      /* ignore */
    }
  }, [pathname]);

  return null;
}
