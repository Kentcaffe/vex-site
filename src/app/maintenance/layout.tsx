import type { Metadata } from "next";
import type { ReactNode } from "react";
import { pageCanonicalMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const { alternates, openGraph } = pageCanonicalMetadata("/maintenance");
  return {
    title: "Mentenanță | VEX",
    description: "VEX — revenim în curând.",
    robots: { index: false, follow: false },
    alternates,
    openGraph: { url: openGraph.url },
  };
}

export default function MaintenanceLayout({ children }: { children: ReactNode }) {
  return children;
}
