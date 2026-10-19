import { defineConfig } from "@playwright/test";
import base from "./playwright.config.js";
export default defineConfig({
  ...base,
  use: { ...base.use, baseURL: "http://127.0.0.1:8144/js_web/ui5-react/" },
  webServer: {
    command: "node static-server.js",
    url: "http://127.0.0.1:8144/js_web/ui5-react/", reuseExistingServer: false,
  },
});
