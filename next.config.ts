import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");
const rootDir = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  devIndicators: false,
  poweredByHeader: false,
  compress: true,
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production" ? { exclude: ["error", "warn"] } : false,
  },
  turbopack: {
    root: rootDir,
  },
};

export default withNextIntl(nextConfig);
