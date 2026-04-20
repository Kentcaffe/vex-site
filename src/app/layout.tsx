import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import { ThemeScript } from "@/components/theme/ThemeScript";
import { siteUrl } from "@/lib/seo";
import "./globals.css";

const SEO_TITLE = "VEX - Anunțuri gratuite în Moldova";
const SEO_DESCRIPTION =
  "Platformă de anunțuri gratuite din Moldova. Cumpără și vinde rapid pe VEX.";
const SEO_KEYWORDS = [
  "anunțuri Moldova",
  "cumpăr vând",
  "OLX Moldova",
  "999.md alternative",
  "anunțuri gratuite",
];

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: SEO_TITLE,
  description: SEO_DESCRIPTION,
  keywords: SEO_KEYWORDS,
  manifest: "/site.webmanifest",
  icons: {
    icon: [{ url: "/favicon.png", type: "image/png", sizes: "512x512" }, { url: "/favicon.ico" }],
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
  openGraph: {
    title: "VEX - Anunțuri gratuite în Moldova",
    description: "Cumpără și vinde rapid pe VEX.",
    type: "website",
    url: "https://vex.md",
    siteName: "VEX",
    images: [
      {
        url: "https://vex.md/logo.png",
        width: 512,
        height: 512,
        alt: "VEX - anunțuri gratuite Moldova",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "VEX - Anunțuri Moldova",
    description: "Platformă de anunțuri gratuite",
    images: ["https://vex.md/logo.png"],
  },
  verification: {
    google: "c8RdLZCq_i84jUUQXIatmo8Uoc37kRmu2_fv_t-IQS8",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f1f5f9",
};

const sans = Inter({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  adjustFontFallback: true,
  variable: "--font-sans",
  preload: true,
});

function supabaseOrigin(): string | null {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!raw) {
    return null;
  }
  try {
    return new URL(raw).origin;
  } catch {
    return null;
  }
}

export default function RootLayout({ children }: { children: ReactNode }) {
  const preconnect = supabaseOrigin();
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "VEX",
    url: "https://vex.md",
    logo: "https://vex.md/logo.png",
  };

  return (
    <html lang="ro" suppressHydrationWarning className={sans.variable}>
      <head>
        <ThemeScript />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        {preconnect ? (
          <>
            <link rel="preconnect" href={preconnect} crossOrigin="anonymous" />
            <link rel="dns-prefetch" href={preconnect} />
          </>
        ) : null}
      </head>
      <body className={`${sans.className} min-h-screen bg-[var(--mp-page)] text-base text-[var(--mp-text)] antialiased`}>
        {children}
      </body>
    </html>
  );
}
