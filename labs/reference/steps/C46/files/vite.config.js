import { defineConfig } from "vitest/config";
export default defineConfig({
  base: "/js_web/demos/inventory/",
  build: { sourcemap: true },
  test: { environment: "node", include: ["tests/**/*.test.{js,jsx}"] },
});
