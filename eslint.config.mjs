import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
  {
    files: ["seed.js", "scripts/**/*.js", "backend/**/*.js"],
    rules: {
      // Scripturi rulate cu `node` — CommonJS + require sunt intenționate.
      "@typescript-eslint/no-require-imports": "off",
    },
  },
]);

export default eslintConfig;
