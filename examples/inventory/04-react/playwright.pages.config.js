import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  testMatch: "pages.spec.js",
  workers: 1,
  retries: 0,
  use: { baseURL: "http://127.0.0.1:4179", browserName: "chromium", trace: "retain-on-failure" },
  webServer: {
    command: "npm run build && npm run check:pages && npm run preview:pages",
    url: "http://127.0.0.1:4179/js_web/",
    reuseExistingServer: false,
  },
});
