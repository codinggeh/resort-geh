import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    env: {
      DEMO_MODE: "0",
      NEXT_PUBLIC_DEMO_MODE: "0",
    },
  },
});

