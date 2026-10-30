import assert from 'node:assert/strict';
import { chromium, expect } from '@playwright/test';
import { build, createServer } from 'vite';
import { viteConfig } from './lab.mjs';
import { deliveryBase, deliveryOutput, serveStatic } from './static-react-server.mjs';
import { verifyDeliveryFiles } from './delivery-files.mjs';

const id = process.argv[2];
assert(/^C4[5-8]$/.test(id ?? ''), '交付浏览器检查需要 C45..C48');
const n = Number(id.slice(1));
const only = process.env.LAB_DELIVERY_CASE;
let server;
let browser;
let count = 0;
const port = Number(process.env.LAB_DELIVERY_PORT ?? 8068);
const rowFor = (page, productId) => page.locator(`article[data-id="${productId}"]`);
try {
  if (n >= 46) {
    await build(await viteConfig(id, true));
    await verifyDeliveryFiles();
    server = await serveStatic({ root: deliveryOutput, port });
  } else {
    const config = await viteConfig(id);
    config.server.port = port; config.server.hmr = false;
    server = await createServer(config); await server.listen();
  }
  const base = `http://127.0.0.1:${port}${n >= 46 ? deliveryBase : '/'}`;
  browser = await chromium.launch();
  async function scenario(name, callback) {
    if (only && only !== name) return;
    const context = await browser.newContext({ viewport: { width: 360, height: 900 } });
    const page = await context.newPage();
    const errors = []; const failures = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('response', (response) => { if (response.status() >= 400) failures.push(`${response.status()} ${response.url()}`); });
    try {
      await page.goto(base);
      assert.deepEqual(failures, [], '初始模块资源失败');
      await expect(page.locator('#list article')).toHaveCount(6);
      await expect(page.locator('#summary')).toHaveText('库存 52 / 价值 2634800 分');
      await callback(page, context, base);
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), '360px 整页横向溢出');
      assert.deepEqual(errors, [], '页面有未处理异常');
      assert.deepEqual(failures, [], '页面资源有失败响应');
      count++; console.log(`${id} · ${name}：通过`);
    } finally { await context.close(); }
  }
  await scenario('state', async (page) => {
    const first = rowFor(page, 'P001');
    await first.getByRole('button', { name: '立即补一件', exact: true }).click();
    await expect(first).toContainText('库存 13 件');
    await expect(page.locator('#summary')).toHaveText('库存 53 / 价值 2674700 分');
    await expect(rowFor(page, 'P004')).toContainText('库存 3 件');
  });
  await scenario('editor', async (page) => {
    const search = page.getByPlaceholder('名称或编号');
    await search.fill('P004');
    await page.getByRole('button', { name: '编辑 P004', exact: true }).click();
    const form = page.getByRole('form', { name: '商品编辑', exact: true });
    await form.getByLabel('库存', { exact: true }).fill('8');
    await form.getByRole('button', { name: '取消', exact: true }).click();
    await expect(rowFor(page, 'P004')).toContainText('库存 3 件');
    await search.fill('');
    await expect(page.locator('#summary')).toContainText('库存 52');
    await page.getByRole('button', { name: '编辑 P004', exact: true }).click();
    await form.getByLabel('库存', { exact: true }).fill('');
    await form.getByRole('button', { name: '保存', exact: true }).click();
    await expect(form.getByLabel('库存', { exact: true })).toBeFocused();
    await expect(form.getByRole('alert')).toContainText('请输入库存，空白无效');
    await form.getByLabel('库存', { exact: true }).fill('8');
    await form.getByLabel('库存', { exact: true }).press('Enter');
    await expect(form).toHaveCount(0);
    await expect(rowFor(page, 'P004')).toContainText('库存 8 件');
    await expect(rowFor(page, 'P001')).toContainText('库存 12 件');
    await expect(page.locator('#summary')).toHaveText('库存 57 / 价值 2784300 分');
    await expect(page.getByRole('button', { name: '编辑 P004', exact: true })).toBeFocused();
    await page.reload();
    await expect(rowFor(page, 'P004')).toContainText('库存 8 件');
  });
  await scenario('retry', async (page) => {
    await page.getByRole('link', { name: '详情 P004', exact: true }).click();
    const detail = page.getByRole('region', { name: '商品详情', exact: true });
    await expect(detail).toContainText('P004 USB-C 扩展坞：库存 3');
    await detail.getByRole('button', { name: '模拟详情失败', exact: true }).click();
    await expect(detail.getByRole('alert')).toContainText('模拟 get 失败');
    await detail.getByRole('button', { name: '重试详情', exact: true }).click();
    await expect(detail.getByRole('alert')).toHaveCount(0);
    await expect(detail).toContainText('P004 USB-C 扩展坞：库存 3');
    await page.reload();
    await expect(detail).toContainText('P004 USB-C 扩展坞：库存 3');
  });
  await scenario('storage', async (page) => {
    const snapshots = page.getByRole('region', { name: '本地库存快照', exact: true });
    await snapshots.getByRole('button', { name: '保存本地快照', exact: true }).click();
    await expect(snapshots.getByRole('status')).toHaveText('本地快照已保存');
    await rowFor(page, 'P004').getByRole('button', { name: '立即补一件', exact: true }).click();
    await expect(rowFor(page, 'P004')).toContainText('库存 4 件');
    const before = await page.evaluate(() => ({ ...localStorage }));
    await snapshots.getByLabel('导入快照', { exact: true }).setInputFiles({ name: 'bad.json', mimeType: 'application/json', buffer: Buffer.from('{"version":1,"products":[{"stock":""}]}') });
    await expect(snapshots.getByRole('status')).toContainText('快照操作失败');
    assert.deepEqual(await page.evaluate(() => ({ ...localStorage })), before, '非法导入破坏现有存储原文');
    await page.evaluate(() => localStorage.setItem('js_web:inventory:react:v2', '{bad'));
    await snapshots.getByRole('button', { name: '恢复备份', exact: true }).click();
    await expect(rowFor(page, 'P004')).toContainText('库存 3 件');
    assert.equal(await page.evaluate(() => localStorage.getItem('js_web:inventory:react:v2:damaged')), '{bad');
    await expect(page.locator('#summary')).toHaveText('库存 52 / 价值 2634800 分');
  });
  if (n >= 46) await scenario('static', async (page, context) => {
    for (const suffix of ['assets/missing.js', 'products/P004/', 'missing.json']) {
      const response = await context.request.get(base + suffix, { headers: { Accept: 'text/html' } });
      assert.equal(response.status(), 404, `缺失文件被 fallback 掩盖：${suffix}`);
      assert.equal(await response.text(), 'Not found');
    }
    assert.equal((await context.request.get(`http://127.0.0.1:${port}/assets/missing.js`)).status(), 404);
    assert.equal((await context.request.get(base + 'products.json')).status(), 200);
    await page.goto(base + '#/products/P004');
    await expect(page.getByRole('region', { name: '商品详情', exact: true })).toContainText('P004 USB-C 扩展坞');
    await page.reload();
    await expect(page.getByRole('region', { name: '商品详情', exact: true })).toContainText('库存 3');
    await page.getByRole('button', { name: '查看分类报表', exact: true }).click();
    await expect(page.getByRole('row', { name: '配件 2 28 587200', exact: true })).toBeVisible();
  });
  if (n >= 47) await scenario('search', async (page) => {
    const search = page.getByPlaceholder('名称或编号');
    await search.focus();
    await page.keyboard.type('P004');
    await expect(search).toHaveValue('P004');
    await expect(page.locator('#list article')).toHaveCount(1);
    await expect(rowFor(page, 'P004')).toBeVisible();
    await page.reload();
    await expect(search).toHaveValue('P004');
    await search.fill('');
    await expect(page.locator('#list article')).toHaveCount(6);
    await expect(rowFor(page, 'P001')).toContainText('库存 12 件');
  });
  if (n >= 48) await scenario('stock-filter', async (page) => {
    const low = page.getByRole('checkbox', { name: '仅低库存', exact: true });
    const original = await page.evaluate(() => ({ ...localStorage }));
    await low.check();
    await expect(page.locator('#list article')).toHaveCount(2);
    await expect(rowFor(page, 'P004')).toBeVisible(); await expect(rowFor(page, 'P006')).toBeVisible();
    await expect(rowFor(page, 'P002')).toHaveCount(0);
    await expect(page.locator('#summary')).toHaveText('库存 8 / 价值 539200 分');
    assert.deepEqual(await page.evaluate(() => ({ ...localStorage })), original, '筛选写入了业务库存');
    await page.reload(); await expect(low).toBeChecked();
    await page.getByLabel('分类', { exact: true }).selectOption('配件');
    await expect(page.locator('#list article')).toHaveCount(1);
    await page.getByPlaceholder('名称或编号').fill('P006');
    await expect(page.locator('#list article')).toHaveCount(0);
    await page.getByPlaceholder('名称或编号').fill('');
    await page.getByLabel('分类', { exact: true }).selectOption('全部');
    await page.getByRole('button', { name: '编辑 P004', exact: true }).click();
    const form = page.getByRole('form', { name: '商品编辑', exact: true });
    await form.getByLabel('库存', { exact: true }).fill('8');
    await form.getByRole('button', { name: '保存', exact: true }).click();
    await expect(form).toHaveCount(0); await expect(rowFor(page, 'P004')).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'React 库存工作台', exact: true })).toBeFocused();
    await low.uncheck();
    await expect(page.locator('#list article')).toHaveCount(6);
    await expect(rowFor(page, 'P001')).toContainText('库存 12 件');
    await expect(page.locator('#summary')).toHaveText('库存 57 / 价值 2784300 分');
  });
  assert(count > 0, `没有执行场景：${only}`);
  console.log(`${id}：${count} 组实际源码浏览器检查通过；全新 context，未清理或覆盖学员的浏览器数据。`);
} finally {
  await browser?.close();
  if (server) {
    if (n >= 46) await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
    else await server.close();
  }
}
