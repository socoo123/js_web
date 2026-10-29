import assert from 'node:assert/strict';
import { createServer } from 'vite';
import { chromium, expect } from '@playwright/test';
import { viteConfig } from './lab.mjs';

// C00 has dormant adapter scaffolding, but its default entry is still the
// original native card. Never start a future adapter to validate this page.
const config = await viteConfig('C01');
config.server.port = Number(process.env.LAB_C43_PORT ?? 0);
config.server.hmr = false;
const server = await createServer(config);
let browser;
try {
  await server.listen();
  browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 360, height: 900 } });
  const errors = [], requests = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('request', (request) => requests.push(request.url()));
  page.on('requestfailed', (request) => errors.push(request.url()));
  page.on('response', (response) => {
    if (response.status() >= 400 && !new URL(response.url()).pathname.endsWith('/favicon.ico')) errors.push(`${response.status()} ${response.url()}`);
  });
  await page.goto(`http://127.0.0.1:${server.httpServer.address().port}/`);
  await expect(page.locator('#product')).toHaveText('P001 机械键盘 · 库存 12 件');
  await expect(page.getByRole('button', { name: '补货（从 C03 接通）', exact: true })).toBeDisabled();
  await expect(page.locator('#amount')).toHaveValue('3');
  await expect(page.locator('ui5-input, ui5-button, #editor')).toHaveCount(0);
  assert.deepEqual(await page.evaluate(() => [window.products.length, window.products.reduce((sum, product) => sum + product.stock, 0), typeof window.inventory.parseStock, Boolean(customElements.get('ui5-input'))]), [6, 52, 'undefined', false]);
  assert(!requests.some((url) => /\/adapters\/|@ui5|webcomponents/.test(url)), 'C00 默认页不应加载休眠 adapter 或 UI5');
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'C00 默认页出现整页横向溢出');
  assert.deepEqual(errors, []);
  console.log('C00 默认原生页：P001/12、补货待接通、6/52、无未来校验/组件/adapter 请求、360px 无溢出，通过。');
} finally { await browser?.close(); await server.close(); }
