import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import "./globals.css";

export const metadata: Metadata = {
  verification: {
    google: "c8RdLZCq_i84jUUQXIatmo8Uoc37kRmu2_fv_t-IQS8",
  },
};

const sans = Inter({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--font-sans",
});

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ro" suppressHydrationWarning className={sans.variable}>
      <body className={`${sans.className} min-h-screen bg-zinc-50 text-zinc-900 antialiased dark:bg-zinc-950 dark:text-zinc-50`}>
        {children}
      </body>
    </html>
  );
}
