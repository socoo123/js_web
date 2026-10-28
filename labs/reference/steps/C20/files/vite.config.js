import { defineConfig } from "vitest/config";
export default defineConfig({
  build: { sourcemap: true },
  test: { environment: "node", include: ["tests/**/*.test.{js,jsx}"] },
});
