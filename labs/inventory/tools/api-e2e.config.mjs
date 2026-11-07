import { defineConfig } from '@playwright/test';

// 由 delivery-browser.mjs 调用：它已起好临时数据后端和带 /api 代理的预览，这里只跑真实后端流程。
const baseURL = process.env.LAB_E2E_BASE_URL;
if (!baseURL) throw new Error('api.spec.js 由 npm run lab -- check C47 起临时后端后运行；不要直接对自己的 8070 数据运行。');
export default defineConfig({
  testDir: '../tests/e2e', testMatch: 'api.spec.js', workers: 1, retries: 0,
  outputDir: '../.lab/playwright-results/api',
  use: { browserName: 'chromium', baseURL, trace: 'retain-on-failure' },
});
