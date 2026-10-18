import { defineConfig } from "@playwright/test";
import base from "./playwright.config.js";

export default defineConfig({
  ...base,
  grepInvert: /表单保留错误/,
  webServer: {
    command: "npm run preview -- --host 127.0.0.1 --port 4188 --strictPort",
    url: "http://127.0.0.1:4188/js_web/", reuseExistingServer: false,
  },
});
