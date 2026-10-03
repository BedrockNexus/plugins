import { fileURLToPath } from "node:url";

import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "edge-runtime",
    testTimeout: 20_000,
    // Browser end-to-end tests run with Playwright (`bun run test:e2e`).
    exclude: [...configDefaults.exclude, "e2e/**"],
  },
});
