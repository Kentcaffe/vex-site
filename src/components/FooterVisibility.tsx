"use client";

import type { ReactNode } from "react";
import { usePathname } from "@/i18n/navigation";

/** Ascunde footer-ul pe chat — evită salt de layout și eliberează înălțime pentru composer fix. */
export function FooterVisibility({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const hide = pathname === "/chat" || Boolean(pathname?.startsWith("/chat/"));
  if (hide) {
    return null;
  }
  return <>{children}</>;
}
