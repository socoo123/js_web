import { defineConfig } from '@playwright/test';
import { fileURLToPath } from 'node:url';
const port = Number(process.env.LAB_E2E_PORT ?? 8064);
const baseURL = `http://127.0.0.1:${port}/js_web/demos/inventory/`;
export default defineConfig({
  testDir: '../tests/e2e', workers: 1, retries: 0,
  outputDir: '../.lab/playwright-results',
  use: { browserName: 'chromium', baseURL, trace: 'retain-on-failure' },
  webServer: { command: 'node tools/static-react-server.mjs', cwd: fileURLToPath(new URL('../', import.meta.url)),
    url: baseURL, reuseExistingServer: false, timeout: 60000 },
});
