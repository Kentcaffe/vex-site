import type { Metadata } from "next";
import type { ReactNode } from "react";

const CANONICAL_URL = "https://vex.md/anunturi";

/** Canonical la nivel de segment /anunturi — reforță page.tsx pe Render. */
export const metadata: Metadata = {
  alternates: { canonical: CANONICAL_URL },
  openGraph: { url: CANONICAL_URL },
  robots: { index: true, follow: true },
};

export default function AnunturiSegmentLayout({ children }: { children: ReactNode }) {
  return children;
}
