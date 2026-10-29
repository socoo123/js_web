import assert from 'node:assert/strict';
import { createServer as createHttpServer } from 'node:http';
import { readFile, stat, mkdir, writeFile, realpath } from 'node:fs/promises';
import path from 'node:path';
import { build, createServer } from 'vite';
import { chromium, expect } from '@playwright/test';
import { workspace, viteConfig } from './lab.mjs';

// Run against the actual workspace. Browser contexts and build output are disposable;
// no source rewriting, learner storage clearing, or reference-answer imports.
const production = process.argv.includes('--production');
const config = await viteConfig('C44', production);
const port = Number(process.env.LAB_UI5_REACT_PORT ?? 18140);
const base = production ? (process.env.LAB_BASE ?? '/js_web/demos/inventory-ui5-react/') : '/';
if (!base.startsWith('/') || !base.endsWith('/')) throw new Error('LAB_BASE 必须以 / 开始和结束');
let server;
let browser;
let scenarios = 0;
const selectedScenario = process.env.UI5_REACT_SCENARIO;
const evidence = { mode: production ? 'strict-static' : 'dev', base, scenarios: [] };
try {
  if (production) {
    const out = path.join(workspace, '.lab/ui5-react-static');
    config.base = base;
    config.build.outDir = out;
    config.logLevel = 'warn';
    await build(config);
    const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.map': 'application/json', '.woff2': 'font/woff2', '.woff': 'font/woff' };
    server = createHttpServer(async (request, response) => {
      try {
        const url = new URL(request.url, 'http://localhost');
        if (!url.pathname.startsWith(base)) throw new Error('outside base');
        const file = path.resolve(out, decodeURIComponent(url.pathname.slice(base.length)) || 'index.html');
        if (!file.startsWith(out + path.sep) || !(await stat(file)).isFile()) throw new Error('not a file');
        response.writeHead(200, { 'Content-Type': types[path.extname(file)] ?? 'application/octet-stream', 'Cache-Control': 'no-store' });
        response.end(await readFile(file));
      } catch { response.writeHead(404, { 'Content-Type': 'text/plain' }); response.end('Not found'); }
    });
    await new Promise((resolve, reject) => { server.once('error', reject); server.listen(port, '127.0.0.1', resolve); });
  } else {
    config.server.port = port;
    config.server.hmr = false;
    // Author snapshot copies may use a read-only dependency symlink; allow only its resolved directory.
    config.server.fs.allow = [...config.server.fs.allow, await realpath(path.join(workspace, 'node_modules'))];
    config.logLevel = 'warn';
    server = await createServer(config);
    await server.listen();
  }
  const actualPort = (production ? server : server.httpServer).address().port;
  const url = `http://127.0.0.1:${actualPort}${base}`;
  evidence.origin = new URL(url).origin;
  browser = await chromium.launch();
  async function scenario(name, run) {
    if (selectedScenario && name !== selectedScenario) return;
    const context = await browser.newContext({ viewport: { width: 360, height: 900 }, serviceWorkers: 'block' });
    const page = await context.newPage();
    const failures = [];
    const resources = [];
    const requests = [];
    const outside = [];
    const localResource = (raw) => {
      const target = new URL(raw);
      if (target.protocol === 'data:') return true;
      if (target.protocol === 'blob:') return target.origin === new URL(url).origin;
      return target.origin === new URL(url).origin && target.pathname.startsWith(base);
    };
    context.on('request', (request) => {
      requests.push({ url: request.url(), type: request.resourceType() });
      if (!localResource(request.url())) outside.push(request.url());
    });
    // Deny off-base traffic before it reaches the network. An attempted CDN font
    // still counts as a failed self-containment assertion, even if the CDN is up.
    await context.route('**/*', (route) => localResource(route.request().url()) ? route.continue() : route.abort('blockedbyclient'));
    page.on('pageerror', (error) => failures.push(error.message));
    page.on('console', (message) => { if (message.type() === 'error') failures.push(message.text()); });
    page.on('response', (response) => {
      resources.push(response.url());
      if (response.status() >= 400) failures.push(`HTTP ${response.status()} ${response.url()}`);
    });
    page.on('requestfailed', (request) => failures.push(`${request.failure()?.errorText} ${request.url()}`));
    try {
      await page.goto(url);
      await expect(page.locator('[data-product-id]')).toHaveCount(6);
      await expect(page.locator('#summary')).toHaveText('全部 6 种 · 总库存 52 · 总价值 2634800 分');
      const observations = await run(page, resources);
      await page.evaluate(async () => { await document.fonts.ready; });
      assert.deepEqual(outside, [], '实际资源请求必须同源且位于当前静态 base 内（data/blob 除外）');
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), '360px 整页横向溢出');
      assert.deepEqual(failures, [], '受测资源或 Console 存在错误');
      evidence.scenarios.push({ name, passed: true, observations, requests, responses: resources, outside });
      scenarios++;
      console.log(`C44 ${production ? 'strict-static' : 'dev'} ${name}：通过`);
    } catch (error) {
      evidence.scenarios.push({ name, passed: false, error: error.message, requests, responses: resources, outside });
      throw error;
    } finally { await context.close(); }
  }
  async function openDock(page, keyboard = true) {
    await page.getByRole('textbox', { name: '筛选商品', exact: true }).fill('P004');
    await expect(page.locator('[data-product-id]')).toHaveCount(1);
    const row = page.locator('#product-P004');
    if (keyboard) { await page.keyboard.press('Tab'); await expect(row).toBeFocused(); await page.keyboard.press('Enter'); }
    else await row.click();
    // Select the editor host, not a shadow-root role: a layout-only Form must
    // reach the same interaction assertion and fail because saving never occurs.
    const form = page.getByRole('region', { name: '编辑区', exact: true }).locator(':scope > form, :scope > ui5-form');
    await expect(form.getByRole('textbox', { name: '库存', exact: true })).toBeFocused();
    return form;
  }
  async function savedOnce(page, form, stock = 8) {
    await expect(form).toHaveCount(0);
    await expect(page.locator('#product-P004')).toContainText(`库存 ${stock} 件`);
    await expect(page.locator('#save-count')).toHaveText('已确认保存 1 次');
    await expect(page.locator('#summary')).toContainText(`总库存 ${49 + stock}`);
    await page.getByRole('textbox', { name: '筛选商品', exact: true }).fill('');
    await expect(page.locator('[data-product-id]')).toHaveCount(6);
    await expect(page.locator('#product-P001')).toContainText('库存 12 件');
    const dock = page.locator('#product-P004');
    for (const text of ['USB-C 扩展坞', '配件', '29900 分', '热销、新品']) await expect(dock).toContainText(text);
  }
  await scenario('cancel-and-button', async (page) => {
    let form = await openDock(page);
    const stock = form.getByRole('textbox', { name: '库存', exact: true });
    await stock.fill('8');
    await page.keyboard.press('Tab');
    await expect(form.getByRole('button', { name: '保存库存', exact: true })).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(form.getByRole('button', { name: '取消', exact: true })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(form).toHaveCount(0);
    await expect(page.locator('#product-P004')).toBeFocused();
    await expect(page.locator('#product-P004')).toContainText('库存 3 件');
    await expect(page.locator('#summary')).toContainText('总库存 52');
    await expect(page.locator('#save-count')).toHaveText('已确认保存 0 次');
    form = await openDock(page, false);
    await expect(form.getByRole('textbox', { name: '库存', exact: true })).toHaveValue('3');
    await form.getByRole('textbox', { name: '库存', exact: true }).fill('8');
    await form.getByRole('button', { name: '保存库存', exact: true }).click();
    await savedOnce(page, form);
  });
  await scenario('input-enter', async (page) => {
    const form = await openDock(page);
    const stock = form.getByRole('textbox', { name: '库存', exact: true });
    await stock.fill('8');
    await stock.press('Enter');
    await savedOnce(page, form);
  });
  await scenario('button-enter', async (page) => {
    const form = await openDock(page);
    await form.getByRole('textbox', { name: '库存', exact: true }).fill('8');
    await expect.poll(() => form.evaluate((element) => new FormData(element).get('stock'))).toBe('8');
    await page.keyboard.press('Tab');
    await expect(form.getByRole('button', { name: '保存库存', exact: true })).toBeFocused();
    await page.keyboard.press('Enter');
    await savedOnce(page, form);
  });
  await scenario('invalid-and-zero', async (page) => {
    const form = await openDock(page);
    const stock = form.getByRole('textbox', { name: '库存', exact: true });
    for (const text of ['', '   ', '-1', '3.5', '3件']) {
      await stock.fill(text);
      await stock.press('Enter');
      await expect(form.getByRole('alert')).toContainText(text.trim() ? '0–99999' : '空白无效');
      await expect(stock).toBeFocused();
      await expect(page.locator('#product-P004')).toContainText('库存 3 件');
      await expect(page.locator('#summary')).toContainText('总库存 52');
      await expect(page.locator('#save-count')).toHaveText('已确认保存 0 次');
    }
    await stock.fill('0');
    await stock.press('Enter');
    await savedOnce(page, form, 0);
  });
  await scenario('duplicate-submit', async (page) => {
    const form = await openDock(page);
    await form.getByRole('textbox', { name: '库存', exact: true }).fill('8');
    await form.evaluate((element) => { element.requestSubmit(); element.requestSubmit(); });
    await savedOnce(page, form);
  });
  await scenario('resources', async (page, resources) => {
    await page.getByRole('textbox', { name: '筛选商品', exact: true }).fill('P004');
    const clearIcon = page.locator('ui5-input [part="clear-icon"]');
    await expect(clearIcon).toHaveAttribute('accessible-name', '清除');
    const initialConfig = await page.evaluate(() => JSON.parse(document.querySelector('script[data-ui5-config]').textContent));
    assert.deepEqual(initialConfig, { language: 'zh-CN', defaultFontLoading: false });
    const fontFaces = await page.evaluate(async () => {
      await document.fonts.ready;
      const faces = await document.fonts.load('16px "72"', 'UI5 Inventory');
      return faces.map((face) => ({ family: face.family, status: face.status }));
    });
    assert(fontFaces.some((face) => face.family === '72' && face.status === 'loaded'), '72 本地字体没有实际加载');
    assert(resources.some((resource) => new URL(resource).pathname.endsWith('.woff2')), '没有实际请求本地 woff2');
    const background = await page.evaluate(() => getComputedStyle(document.documentElement).backgroundColor);
    const beforeTheme = new Set(resources);
    await page.getByLabel('主题', { exact: true }).selectOption('sap_horizon_dark');
    await expect(page.getByLabel('主题', { exact: true })).toBeEnabled();
    await expect.poll(() => page.evaluate(() => getComputedStyle(document.documentElement).backgroundColor)).not.toBe(background);
    await page.getByLabel('组件语言', { exact: true }).selectOption('en');
    await expect(page.getByLabel('组件语言', { exact: true })).toBeEnabled();
    await expect(clearIcon).toHaveAttribute('accessible-name', 'Clear');
    await expect(page.getByRole('heading', { name: 'UI5 React 库存适配', exact: true })).toBeVisible();
    assert(resources.some((resource) => /messagebundle_zh_CN/.test(resource)), '没有实际加载中文翻译');
    assert(resources.some((resource) => !beforeTheme.has(resource) && /parameters-bundle/.test(resource)), '没有实际加载新主题参数');
    await clearIcon.click();
    await expect(page.locator('[data-product-id]')).toHaveCount(6);
    if (production) {
      for (let reload = 0; reload < 3; reload++) {
        await page.reload();
        await expect(page.locator('[data-product-id]')).toHaveCount(6);
        await expect(page.locator('#summary')).toContainText('总库存 52');
        await page.getByRole('textbox', { name: '筛选商品', exact: true }).fill('P004');
        await expect(clearIcon).toHaveAttribute('accessible-name', '清除');
      }
    }
    return { initialConfig, fontFaces, initialChineseChecks: production ? 4 : 1,
      fontResponses: resources.filter((resource) => new URL(resource).pathname.endsWith('.woff2')) };
  });
  if (production) {
    for (const missing of ['missing.js', 'not-a-route/']) {
      const response = await fetch(new URL(missing, url));
      assert.equal(response.status, 404, '严格服务器不能把缺失资源返回成首页');
    }
  }
  if (scenarios === 0) throw new Error('没有执行浏览器场景');
  console.log(`C44：${scenarios} 组实际工作文件场景通过；隔离浏览器，无源码/存储覆盖。`);
} finally {
  await browser?.close();
  if (production) await new Promise((resolve) => server ? server.close(resolve) : resolve());
  else await server?.close();
  await mkdir(path.join(workspace, '.lab'), { recursive: true });
  await writeFile(path.join(workspace, `.lab/ui5-react-check-${production ? 'static' : 'dev'}.json`), JSON.stringify(evidence, null, 2) + '\n');
}
