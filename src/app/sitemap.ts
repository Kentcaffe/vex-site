import type { MetadataRoute } from "next";
import { localizedHref } from "@/lib/paths";
import { routing } from "@/i18n/routing";

const baseUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "https://vex.md").replace(/\/$/, "");

/**
 * Pagini statice publice pentru indexare.
 * Nu există rute /contact sau /despre — ajutor / cum funcționează acoperă informații similare.
 */
const staticPages: { path: string; priority: number }[] = [
  { path: "/", priority: 1 },
  { path: "/anunturi", priority: 0.9 },
  { path: "/categorii", priority: 0.9 },
  { path: "/ajutor", priority: 0.75 },
  { path: "/cum-functioneaza", priority: 0.75 },
  { path: "/siguranta", priority: 0.65 },
  { path: "/intrebari-frecvente", priority: 0.65 },
  { path: "/termeni", priority: 0.5 },
  { path: "/confidentialitate", priority: 0.5 },
  { path: "/politica-cookie", priority: 0.45 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const entries: MetadataRoute.Sitemap = [];

  for (const locale of routing.locales) {
    for (const { path, priority } of staticPages) {
      const href = localizedHref(locale, path);
      entries.push({
        url: `${baseUrl}${href}`,
        lastModified,
        changeFrequency: "weekly",
        priority,
      });
    }
  }

  return entries;
}
