import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

const lesson = Number((process.env.LAB_LESSON ?? "C25").slice(1));
export default defineConfig({
  plugins: [react()],
  cacheDir: fileURLToPath(new URL("../.lab/forms-state-cache", import.meta.url)),
  test: {
    environment: "happy-dom",
    include: ["tools/forms-state.test.jsx", ...(lesson >= 27 ? ["tools/forms-reducer.test.js"] : [])],
    restoreMocks: true,
  },
});
