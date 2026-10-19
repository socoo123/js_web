import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./labs/e2e", workers: 1, retries: 0,
  use: { baseURL: "http://127.0.0.1:8045", browserName: "chromium", channel: "chrome", trace: "retain-on-failure" },
  webServer: {
    command: "npm run dev -- --host 127.0.0.1 --port 8045 --strictPort",
    url: "http://127.0.0.1:8045/js_web/labs/delivery.html", reuseExistingServer: false,
  },
});
