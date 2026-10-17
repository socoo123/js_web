import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

export default defineConfig({
  root: fileURLToPath(new URL("../02-web/", import.meta.url)),
  base: "/js_web/",
  server: { fs: { allow: [fileURLToPath(new URL("../../", import.meta.url))] } },
  build: {
    outDir: fileURLToPath(new URL("./dist/", import.meta.url)),
    emptyOutDir: true,
    sourcemap: true,
    assetsInlineLimit: 0,
  },
});
