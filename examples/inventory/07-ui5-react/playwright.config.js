import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./e2e", workers: 1, retries: 0,
  use: { baseURL: "http://127.0.0.1:8044", browserName: "chromium", channel: "chrome", trace: "retain-on-failure" },
  webServer: { command: "npm run dev", url: "http://127.0.0.1:8044", reuseExistingServer: false },
});
