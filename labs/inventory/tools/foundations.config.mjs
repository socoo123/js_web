import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  cacheDir: ".lab/foundations-cache",
  test: {
    environment: "happy-dom",
    include: ["tools/c21.test.jsx", "tools/c22.test.jsx", "tools/c24.test.jsx"],
    restoreMocks: true,
  },
});
