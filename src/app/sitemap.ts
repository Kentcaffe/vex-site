import type { MetadataRoute } from "next";
import { localizedHref } from "@/lib/paths";
import { routing } from "@/i18n/routing";
import { getRootCategories } from "@/lib/category-queries";
import { listingWhereActive } from "@/lib/prisma-listing-soft-delete-filter";
import { prisma } from "@/lib/prisma";
import { listingSeoPath } from "@/lib/seo";

const baseUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "https://vex.md").replace(/\/$/, "");

/** Nu prerender la build (evită P2022 dacă DB-ul nu are încă migrările soft-delete); generează la request. */
export const dynamic = "force-dynamic";

/** Pagini statice publice pentru indexare. */
const staticPages: { path: string; priority: number }[] = [
  { path: "/", priority: 1 },
  { path: "/anunturi", priority: 0.9 },
  { path: "/categorii", priority: 0.9 },
  { path: "/contact", priority: 0.8 },
  { path: "/ajutor", priority: 0.75 },
  { path: "/cum-functioneaza", priority: 0.75 },
  { path: "/siguranta", priority: 0.65 },
  { path: "/intrebari-frecvente", priority: 0.65 },
  { path: "/termeni", priority: 0.5 },
  { path: "/confidentialitate", priority: 0.5 },
  { path: "/politica-cookie", priority: 0.45 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();

  const entries: MetadataRoute.Sitemap = [];
  const [roots, latestListings] = await Promise.all([
    getRootCategories(),
    prisma.listing.findMany({
      where: listingWhereActive(),
      orderBy: { createdAt: "desc" },
      take: 500,
      select: { id: true, title: true, city: true, updatedAt: true },
    }),
  ]);

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

    for (const root of roots) {
      const href = localizedHref(locale, `/categorii?c=${encodeURIComponent(root.slug)}`);
      entries.push({
        url: `${baseUrl}${href}`,
        lastModified,
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }

    for (const item of latestListings) {
      const href = localizedHref(locale, listingSeoPath(item));
      entries.push({
        url: `${baseUrl}${href}`,
        lastModified: item.updatedAt,
        changeFrequency: "daily",
        priority: 0.85,
      });
    }
  }

  return entries;
}
