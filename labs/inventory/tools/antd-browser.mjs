import assert from 'node:assert/strict';
import { createServer as createHttpServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { build, createServer } from 'vite';
import { chromium, expect } from '@playwright/test';
import { workspace, viteConfig } from './lab.mjs';

const selectedCase = process.argv.find((arg) => arg.startsWith('--case='))?.slice(7);
const config = await viteConfig('C38');
config.server.port = Number(process.env.ANTD_DEV_PORT ?? 0);
config.server.hmr = false;
config.plugins.push({ name: 'antd-behavior-fixture', configureServer(vite) {
  vite.middlewares.use('/__antd_test__', async (_request, response, next) => {
    try {
      const html = `<html lang="zh-CN"><head><meta name="viewport" content="width=device-width, initial-scale=1"></head><body><div id="root"></div><script type="module" src="/@fs${path.join(workspace, 'tools/antd-harness.jsx')}"></script></body></html>`;
      response.setHeader('Content-Type', 'text/html');
      response.end(await vite.transformIndexHtml('/__antd_test__', html));
    } catch (error) { next(error); }
  });
} });
const server = await createServer(config);
let browser, staticServer;
let count = 0;
const cases = [];
const rows = (page) => page.locator('tbody tr[data-row-key]');
const row = (page, id) => page.locator(`tbody tr[data-row-key="${id}"]`);
const dialog = (page) => page.getByRole('dialog');
const stock = (page) => dialog(page).getByRole('textbox', { name: '库存数量', exact: true });
const summary = (page) => page.locator('#antd-summary');
async function open(page, id) {
  await page.getByRole('button', { name: `编辑 ${id}`, exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(dialog(page)).toContainText(`编辑 ${id}`);
  await expect(stock(page)).toBeFocused();
}
async function closed(page, id) {
  await expect(dialog(page)).toHaveCount(0);
  await expect(page.getByRole('button', { name: `编辑 ${id}`, exact: true })).toBeFocused();
}
async function scenario(name, run, url, width = 360) {
  if (selectedCase && selectedCase !== name) return;
  const context = await browser.newContext({ viewport: { width, height: 900 } });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('response', (response) => { if (response.status() >= 400) errors.push(`HTTP ${response.status()} ${response.url()}`); });
  try {
    await page.goto(url);
    await expect(rows(page)).toHaveCount(6);
    await expect(summary(page)).toHaveText('全部 6 种 / 总库存 52 / 总价值 2634800 分');
    await run(page);
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${name}: 整页横滚`);
    assert.deepEqual(errors, [], `${name}: 浏览器/资源错误`);
    cases.push(name); count++;
  } finally { await context.close(); }
}
try {
  await server.listen();
  const url = `http://127.0.0.1:${server.httpServer.address().port}/`;
  browser = await chromium.launch();
  await scenario('identity', async (page) => {
    await page.getByRole('columnheader', { name: /^库存/ }).click();
    await expect(rows(page).first()).toHaveAttribute('data-row-key', 'P002');
    await open(page, 'P002');
    await expect(stock(page)).toHaveValue('0');
    await page.keyboard.press('Escape'); await closed(page, 'P002');
    await page.getByRole('textbox', { name: '名称或编号', exact: true }).fill('P004');
    await expect(rows(page)).toHaveCount(1);
    await open(page, 'P004'); await expect(stock(page)).toHaveValue('3');
    await page.keyboard.press('Escape'); await closed(page, 'P004');
  }, url);
  await scenario('lifecycle', async (page) => {
    await open(page, 'P001'); await stock(page).fill('8');
    await page.keyboard.press('Escape'); await closed(page, 'P001');
    await open(page, 'P002'); await expect(stock(page)).toHaveValue('0');
    await page.keyboard.press('Escape'); await closed(page, 'P002');
    await open(page, 'P001'); await expect(stock(page)).toHaveValue('12');
    await page.keyboard.press('Escape'); await closed(page, 'P001');
  }, url);
  await scenario('p004', async (page) => {
    await page.getByRole('textbox', { name: '名称或编号', exact: true }).fill('P004');
    await expect(rows(page)).toHaveCount(1);
    await open(page, 'P004'); await stock(page).fill('8');
    await page.keyboard.press('Tab');
    await expect(dialog(page).getByRole('button', { name: '取消', exact: true })).toBeFocused();
    await page.keyboard.press('Enter'); await closed(page, 'P004');
    await expect(row(page, 'P004').locator('td').nth(3)).toHaveText('3');
    await expect(summary(page)).toContainText('总库存 52');
    await open(page, 'P004'); await expect(stock(page)).toHaveValue('3');
    await stock(page).fill('8'); await page.keyboard.press('Enter');
    await closed(page, 'P004');
    await expect(row(page, 'P004').locator('td').nth(3)).toHaveText('8');
    await expect(row(page, 'P004')).toContainText('USB-C 扩展坞');
    await expect(row(page, 'P004')).toContainText('配件');
    await expect(row(page, 'P004')).toContainText('299.00');
    await expect(row(page, 'P004')).toContainText('热销、新品');
    await expect(summary(page)).toContainText('总库存 57');
    await page.getByRole('button', { name: '清空筛选', exact: true }).click();
    await expect(rows(page)).toHaveCount(6);
    await expect(row(page, 'P001').locator('td').nth(3)).toHaveText('12');
    await page.reload();
    await expect(summary(page)).toContainText('总库存 52');
    assert.equal(await page.evaluate(() => localStorage.getItem('js_web:inventory:react:v2')), null);
  }, url);
  await scenario('validation', async (page) => {
    await open(page, 'P004');
    for (const value of ['', '-1']) {
      await stock(page).fill(value);
      await dialog(page).getByRole('button', { name: '保存', exact: true }).click();
      await expect(stock(page)).toHaveAttribute('aria-invalid', 'true');
      await expect(stock(page)).toBeFocused();
      await expect(stock(page)).toHaveAccessibleDescription(/空白无效|0–99999/);
      await expect(summary(page)).toContainText('总库存 52');
    }
    await stock(page).fill('0');
    await dialog(page).getByRole('button', { name: '保存', exact: true }).click();
    await closed(page, 'P004');
    await expect(row(page, 'P004').locator('td').nth(3)).toHaveText('0');
    await expect(summary(page)).toContainText('总库存 49');
  }, url);
  await scenario('theme-empty', async (page) => {
    await page.getByRole('textbox', { name: '名称或编号', exact: true }).fill('不存在');
    await expect(rows(page)).toHaveCount(0);
    await expect(page.getByText('没有符合条件的商品', { exact: true })).toBeVisible();
    await expect(summary(page)).toContainText('总库存 52');
    await page.getByRole('button', { name: '清空筛选', exact: true }).click();
    await expect(rows(page)).toHaveCount(6);
    await open(page, 'P004');
    const light = await page.locator('.ant-modal-container').evaluate((node) => getComputedStyle(node).backgroundColor);
    await page.keyboard.press('Escape'); await closed(page, 'P004');
    await page.getByRole('button', { name: '切换深色', exact: true }).click();
    await open(page, 'P004');
    const dark = await page.locator('.ant-modal-container').evaluate((node) => getComputedStyle(node).backgroundColor);
    assert.notEqual(light, dark, '浮层没有跟随主题');
    assert.equal(await page.locator('.antd-page').getAttribute('data-theme'), 'dark');
    for (const key of ['Tab', 'Shift+Tab']) for (let i = 0; i < 12; i++) {
      await page.keyboard.press(key);
      assert(await dialog(page).evaluate((node) => node.contains(document.activeElement)), `${key} 逃出弹窗`);
    }
    await page.keyboard.press('Escape'); await closed(page, 'P004');
  }, url, 1280);
  await scenario('save-retry', async (page) => {
    await open(page, 'P004'); await stock(page).fill('8');
    await page.keyboard.press('Enter');
    await page.keyboard.press('Enter');
    await expect(dialog(page).getByRole('alert')).toContainText('模拟 save 失败');
    await expect(stock(page)).toHaveValue('8');
    await expect(summary(page)).toContainText('总库存 52');
    assert.equal(await page.evaluate(() => window.__antdSaveCalls), 1, '一次提交重复写入');
    await dialog(page).getByRole('button', { name: '保存', exact: true }).click();
    await closed(page, 'P004'); await expect(summary(page)).toContainText('总库存 57');
    assert.equal(await page.evaluate(() => window.__antdSaveCalls), 2);
  }, url + '__antd_test__?failure=save');
  if (!selectedCase || selectedCase === 'read-retry') {
    const context = await browser.newContext();
    try {
      const page = await context.newPage();
      await page.goto(url + '__antd_test__?failure=list');
      await expect(page.getByText('模拟 list 失败', { exact: true })).toBeVisible();
      await page.getByRole('button', { name: '重试读取', exact: true }).click();
      await expect(rows(page)).toHaveCount(6);
      await expect(summary(page)).toContainText('总库存 52');
      cases.push('read-retry'); count++;
    } finally { await context.close(); }
  }
  if (!selectedCase || selectedCase === 'static') {
    const base = '/js_web/demos/inventory-antd/';
    const out = path.join(workspace, '.lab/antd-static');
    const production = await viteConfig('C38', true);
    production.base = base; production.build.outDir = out; production.mode = 'production';
    // createServer sets NODE_ENV=development; the static smoke must test a real production bundle.
    const previousNodeEnv = process.env.NODE_ENV;
    try { process.env.NODE_ENV = 'production'; await build(production); }
    finally {
      if (previousNodeEnv === undefined) delete process.env.NODE_ENV;
      else process.env.NODE_ENV = previousNodeEnv;
    }
    const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json' };
    staticServer = createHttpServer(async (request, response) => {
      try {
        const pathname = new URL(request.url, 'http://localhost').pathname;
        if (!pathname.startsWith(base)) throw new Error('outside base');
        const file = path.resolve(out, decodeURIComponent(pathname.slice(base.length)) || 'index.html');
        if (!file.startsWith(out + path.sep) || !(await stat(file)).isFile()) throw new Error('not a file');
        response.writeHead(200, { 'Content-Type': types[path.extname(file)] ?? 'application/octet-stream' });
        response.end(await readFile(file));
      } catch { response.writeHead(404); response.end('Not found'); }
    });
    await new Promise((resolve) => staticServer.listen(Number(process.env.ANTD_STATIC_PORT ?? 0), '127.0.0.1', resolve));
    const origin = `http://127.0.0.1:${staticServer.address().port}`;
    assert.equal((await fetch(origin + base + 'missing-page')).status, 404, '严格服务器不能回退到 index');
    assert.equal((await fetch(origin + '/assets/missing.js')).status, 404);
    await scenario('static', async (page) => {
      await page.reload(); await expect(rows(page)).toHaveCount(6);
      await open(page, 'P004'); await stock(page).fill('8'); await page.keyboard.press('Enter');
      await closed(page, 'P004'); await expect(summary(page)).toContainText('总库存 57');
    }, origin + base);
  }
  assert(count > 0, `未知场景 ${selectedCase}`);
  console.log(`Ant Design：${count} 个真实浏览器场景通过：${cases.join('、')}。`);
} finally {
  await browser?.close();
  await server.close();
  if (staticServer) await new Promise((resolve) => staticServer.close(resolve));
}
