import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/js_web/",
  server: { fs: { allow: [fileURLToPath(new URL("../../", import.meta.url))] } },
  build: { sourcemap: true },
});
