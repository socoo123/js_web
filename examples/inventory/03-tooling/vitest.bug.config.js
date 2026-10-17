import { defineConfig } from "vitest/config";

export default defineConfig({
  test: { environment: "node", include: ["labs/**/*.test.js"] },
});
