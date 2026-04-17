import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import { ThemeScript } from "@/components/theme/ThemeScript";
import "./globals.css";

export const metadata: Metadata = {
  verification: {
    google: "c8RdLZCq_i84jUUQXIatmo8Uoc37kRmu2_fv_t-IQS8",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f1f5f9" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1120" },
  ],
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
