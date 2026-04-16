"use client";

import { useEffect } from "react";

export function ForceLightMode() {
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    const apply = () => {
      root.classList.remove("dark");
      body.classList.remove("dark");
      root.style.colorScheme = "light";
      body.style.colorScheme = "light";
    };

    apply();
    const obs = new MutationObserver(() => {
      apply();
    });
    obs.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => {
      obs.disconnect();
    };
  }, []);

  return null;
}
