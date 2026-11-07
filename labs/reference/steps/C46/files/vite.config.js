import { defineConfig } from "vitest/config";
export default defineConfig({
  base: "/js_web/demos/inventory/",
  server: { proxy: { "/api": "http://127.0.0.1:8070" } },
  build: { sourcemap: true },
  test: { environment: "node", include: ["tests/**/*.test.{js,jsx}"] },
});
