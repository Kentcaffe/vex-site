import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import { ThemeScript } from "@/components/theme/ThemeScript";
import { siteUrl } from "@/lib/seo";
import "./globals.css";

const SEO_TITLE = "VEX - Anunțuri gratuite în Moldova | Cumpără și vinde rapid";
const SEO_DESCRIPTION =
  "VEX este o platformă de anunțuri gratuite din Moldova. Publică anunțuri rapid sau găsește mașini, apartamente, telefoane și multe altele.";
const SEO_KEYWORDS = [
  "anunțuri Moldova",
  "cumpăr vând",
  "OLX Moldova",
  "999.md alternative",
  "anunțuri gratuite",
];

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: SEO_TITLE,
    template: "%s | VEX",
  },
  description: SEO_DESCRIPTION,
  keywords: SEO_KEYWORDS,
  openGraph: {
    title: "VEX - Anunțuri gratuite în Moldova",
    description: "Cumpără și vinde rapid pe VEX. Publică anunțuri gratuit.",
    type: "website",
    url: siteUrl(),
    siteName: "VEX",
    images: [
      {
        url: "/marketplace-image-fallback.svg",
        alt: "VEX - Anunțuri gratuite în Moldova",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "VEX - Anunțuri Moldova",
    description: "Platformă de anunțuri gratuite",
    images: ["/marketplace-image-fallback.svg"],
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

  return (
    <html lang="ro" suppressHydrationWarning className={sans.variable}>
      <head>
        <ThemeScript />
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
