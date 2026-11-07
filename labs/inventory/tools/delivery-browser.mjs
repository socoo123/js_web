import assert from 'node:assert/strict';
import path from 'node:path';
import { chromium, expect } from '@playwright/test';
import { build, createServer } from 'vite';
import { workspace, viteConfig, run } from './lab.mjs';
import { deliveryBase, deliveryOutput, serveStatic } from './static-react-server.mjs';
import { verifyDeliveryFiles } from './delivery-files.mjs';
import { startApiFixture, proxyTo } from './api-fixture.mjs';

const id = process.argv[2];
assert(/^C4[5-8]$/.test(id ?? ''), '交付浏览器检查需要 C45..C48');
const n = Number(id.slice(1));
const only = process.env.LAB_DELIVERY_CASE;
const port = Number(process.env.LAB_DELIVERY_PORT ?? 8068);
const mockOutput = path.join(workspace, '.lab/delivery-mock');
const rowFor = (page, productId) => page.locator(`article[data-id="${productId}"]`);
const editForm = (page) => page.getByRole('form', { name: '商品编辑', exact: true });
const label = { api: '数据源：本地后端 /api', mock: '数据源：浏览器 mock' };
let browser;
let api;
let count = 0;

// Vite 在创建服务器或构建时读取 VITE_*；只在这一步临时改环境，之后恢复。
async function withEnv(values, callback) {
  const saved = Object.fromEntries(Object.keys(values).map((key) => [key, process.env[key]]));
  const apply = (entries) => { for (const [key, value] of Object.entries(entries)) { if (value === undefined) delete process.env[key]; else process.env[key] = value; } };
  apply(values);
  try { return await callback(); } finally { apply(saved); }
}
async function startFrontend(mode) {
  const env = { VITE_DATA_SOURCE: mode === 'mock' ? 'mock' : undefined, VITE_API_BASE: mode === 'cors' ? `${api.origin}/api` : undefined };
  if (n >= 46) {
    const outDir = mode === 'mock' ? mockOutput : deliveryOutput;
    await withEnv(env, async () => {
      const config = await viteConfig(id, true);
      proxyTo(config.server.proxy, api.origin);
      config.build.outDir = outDir;
      await build(config);
    });
    if (mode === 'api') await verifyDeliveryFiles();
    const server = await serveStatic({ root: outDir, port, apiOrigin: api.origin });
    return { url: `http://127.0.0.1:${port}${deliveryBase}`, close: () => new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve())) };
  }
  const config = await viteConfig(id);
  const own = config.server.proxy?.['/api'];
  config.server.proxy = proxyTo(config.server.proxy, api.origin);
  if (mode === 'api') console.log(`vite.config.js 的 /api 代理：${JSON.stringify(own)}；检查时改指临时后端 ${api.origin}`);
  config.server.port = port; config.server.hmr = false;
  const server = await withEnv(env, async () => { const created = await createServer(config); await created.listen(); return created; });
  return { url: `http://127.0.0.1:${port}/`, close: () => server.close() };
}

async function scenario(frontend, mode, [name, callback, { load = true, apiErrors = false } = {}]) {
  if (mode !== 'mock') await api.reset();
  const logStart = api.log.length;
  const context = await browser.newContext({ viewport: { width: 360, height: 900 } });
  const page = await context.newPage();
  const errors = []; const failures = []; const requests = []; const consoleErrors = [];
  const isApi = (url) => new URL(url).pathname.startsWith('/api/');
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  page.on('request', (request) => { if (isApi(request.url())) { const url = new URL(request.url()); requests.push({ method: request.method(), path: url.pathname, query: url.searchParams }); } });
  page.on('response', (response) => { if (response.status() >= 400 && !(apiErrors && isApi(response.url()))) failures.push(`${response.status()} ${response.url()}`); });
  const sent = (method, pathname) => requests.some((request) => request.method === method && request.path === pathname);
  try {
    if (load) {
      await page.goto(frontend.url);
      assert.deepEqual(failures, [], '初始模块资源失败');
      await expect(page.locator('#list article')).toHaveCount(6);
      await expect(page.locator('#summary')).toHaveText('库存 52 / 价值 2634800 分');
      await expect(page.getByText(label[mode], { exact: true }), `页面应显示「${label[mode]}」`).toBeVisible();
      if (mode === 'api') assert(sent('GET', '/api/products'), '初始列表没有请求 GET /api/products');
    }
    await callback({ page, context, url: frontend.url, sent, requests, consoleErrors, apiLog: () => api.log.slice(logStart) });
    if (mode === 'mock') assert.deepEqual(requests.map((request) => `${request.method} ${request.path}`), [], 'mock 产物不应请求 /api');
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), '360px 整页横向溢出');
    assert.deepEqual(errors, [], '页面有未处理异常');
    assert.deepEqual(failures, [], '页面资源有失败响应');
    count++; console.log(`${id} · ${name}：通过`);
  } finally { await context.close(); }
}

const apiScenarios = [
  ['state', async ({ page, sent, apiLog }) => {
    const first = rowFor(page, 'P001');
    await first.getByRole('button', { name: '立即补一件', exact: true }).click();
    await expect(first, 'P001「立即补一件」后应是 13 件：补货要经 dispatch 发 POST /api/products/P001/restock').toContainText('库存 13 件');
    await expect(page.locator('#summary')).toHaveText('库存 53 / 价值 2674700 分');
    await expect(rowFor(page, 'P004')).toContainText('库存 3 件');
    assert(sent('POST', '/api/products/P001/restock'), 'Network 没有 POST /api/products/P001/restock');
    assert(apiLog().some((line) => line.startsWith('POST /api/products/P001/restock 200')), `api 终端没有 restock 200；实际：${apiLog().join(' | ')}`);
    await page.reload();
    await expect(first).toContainText('库存 13 件');
  }],
  ['editor', async ({ page }) => {
    const search = page.getByPlaceholder('名称或编号');
    await search.fill('P004');
    await page.getByRole('button', { name: '编辑 P004', exact: true }).click();
    const form = editForm(page);
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
  }],
  ['fields', async ({ page }) => {
    await api.fault({ method: 'PATCH', path: '/api/products/P004', status: 422,
      body: { error: { code: 'VALIDATION', message: '字段校验失败，见 fields', fields: { priceCents: '价格必须是非负安全整数分' } } } });
    await page.getByRole('button', { name: '编辑 P004', exact: true }).click();
    const form = editForm(page);
    await form.getByLabel('库存', { exact: true }).fill('8');
    await form.getByRole('button', { name: '保存', exact: true }).click();
    const price = form.getByLabel('价格（元）', { exact: true });
    await expect(price, '422 的 fields.priceCents 应显示在价格输入框').toHaveAccessibleDescription('价格必须是非负安全整数分');
    await expect(price).toHaveAttribute('aria-invalid', 'true');
    await expect(price).toBeFocused();
    await expect(form.getByLabel('库存', { exact: true })).toHaveValue('8');
    await expect(page.locator('#summary')).toHaveText('库存 52 / 价值 2634800 分');
    await form.getByRole('button', { name: '保存', exact: true }).click();
    await expect(form).toHaveCount(0);
    await expect(page.locator('#summary'), '保存后列表应重新读取').toHaveText('库存 57 / 价值 2784300 分');
  }, { apiErrors: true }],
  ['retry', async ({ page, url }) => {
    // 开发模式 StrictMode 会中止并重发首个请求，故障要能覆盖两次请求；显示错误后用 reset 清掉剩余故障。
    await api.fault({ method: 'GET', path: '/api/products', status: 500, times: 10 });
    await page.goto(url);
    const failed = page.getByRole('alert').filter({ hasText: '读取失败' });
    await expect(failed, '列表 500 后应显示原因，不能停在「正在加载库存」').toContainText('读取失败：HTTP 500：注入的故障：500');
    await expect(page.getByText('正在加载库存')).toHaveCount(0);
    await api.reset();
    await page.getByRole('button', { name: '重新读取', exact: true }).click();
    await expect(page.locator('#list article')).toHaveCount(6);
    await expect(failed).toHaveCount(0);
    await page.getByRole('link', { name: '详情 P004', exact: true }).click();
    const detail = page.getByRole('region', { name: '商品详情', exact: true });
    await expect(detail).toContainText('P004 USB-C 扩展坞：库存 3');
    await detail.getByRole('button', { name: '模拟详情失败', exact: true }).click();
    await expect(detail.getByRole('alert')).toContainText('HTTP 500');
    await detail.getByRole('button', { name: '重试详情', exact: true }).click();
    await expect(detail.getByRole('alert')).toHaveCount(0);
    await expect(detail).toContainText('P004 USB-C 扩展坞：库存 3');
    await page.reload();
    await expect(detail).toContainText('P004 USB-C 扩展坞：库存 3');
  }, { load: false, apiErrors: true }],
  ['slow', async ({ page, apiLog }) => {
    await api.fault({ method: 'GET', path: '/api/products/P001', delayMs: 1500 });
    const pending = new Set();
    const isP001 = (request) => new URL(request.url()).pathname === '/api/products/P001';
    page.on('request', (request) => { if (isP001(request)) pending.add(request); });
    for (const event of ['requestfinished', 'requestfailed']) page.on(event, (request) => pending.delete(request));
    await page.getByRole('link', { name: '详情 P001', exact: true }).click();
    await page.getByRole('link', { name: '详情 P002', exact: true }).click();
    const detail = page.getByRole('region', { name: '商品详情', exact: true });
    await expect(detail).toContainText('P002 无线鼠标：库存 0');
    // 等慢的 P001 结束（返回或被取消）后再看最终显示。
    await expect.poll(() => apiLog().some((line) => line.startsWith('GET /api/products/P001 ') && line.includes('注入故障')), { message: '慢请求没有走注入的 1500ms 延迟', timeout: 5000 }).toBe(true);
    await expect.poll(() => pending.size, { message: 'P001 请求一直没有结束', timeout: 5000 }).toBe(0);
    await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    await expect(detail, '慢的 P001 响应不能覆盖后选的 P002').toContainText('P002 无线鼠标：库存 0');
    await expect(detail).not.toContainText('P001');
  }],
];
if (n >= 46) apiScenarios.push(['static', async ({ page, context, url }) => {
  for (const suffix of ['assets/missing.js', 'products/P004/', 'missing.json']) {
    const response = await context.request.get(url + suffix, { headers: { Accept: 'text/html' } });
    assert.equal(response.status(), 404, `缺失文件被 fallback 掩盖：${suffix}`);
    assert.equal(await response.text(), 'Not found');
  }
  assert.equal((await context.request.get(`http://127.0.0.1:${port}/assets/missing.js`)).status(), 404);
  assert.equal((await context.request.get(url + 'products.json')).status(), 200);
  assert.deepEqual(await (await context.request.get(`http://127.0.0.1:${port}/api/health`)).json(), { ok: true }, '预览没有把 /api 转发给后端');
  await page.goto(url + '#/products/P004');
  await expect(page.getByRole('region', { name: '商品详情', exact: true })).toContainText('P004 USB-C 扩展坞');
  await page.reload();
  await expect(page.getByRole('region', { name: '商品详情', exact: true })).toContainText('库存 3');
  await page.getByRole('button', { name: '查看分类报表', exact: true }).click();
  await expect(page.getByRole('row', { name: '配件 2 28 587200', exact: true })).toBeVisible();
}]);
if (n >= 47) apiScenarios.push(['search', async ({ page }) => {
  const search = page.getByPlaceholder('名称或编号');
  await search.focus();
  await page.keyboard.type('P004');
  await expect(search, '逐字输入 P004 后搜索框不能丢字').toHaveValue('P004');
  await expect(page.locator('#list article'), '搜索 P004 应只剩 1 项').toHaveCount(1);
  await expect(rowFor(page, 'P004')).toBeVisible();
  await page.reload();
  await expect(search).toHaveValue('P004');
  await search.fill('');
  await expect(page.locator('#list article')).toHaveCount(6);
  await expect(rowFor(page, 'P001')).toContainText('库存 12 件');
}], ['conflict', async ({ page }) => {
  await page.getByRole('button', { name: '编辑 P004', exact: true }).click();
  const form = editForm(page);
  const stock = form.getByLabel('库存', { exact: true });
  await stock.fill('9');
  await api.patch('/api/products/P004', { stock: 8 }, 1);
  await form.getByRole('button', { name: '保存', exact: true }).click();
  await expect(form.getByRole('alert')).toContainText('保存冲突：服务器上的 P004 已被修改（库存 8）。草稿已保留，可载入最新后再保存。');
  await expect(stock, '409 后草稿应保留').toHaveValue('9');
  await expect(rowFor(page, 'P004'), '409 后列表应重新读取服务器当前值').toContainText('库存 8 件');
  await form.getByRole('button', { name: '载入最新', exact: true }).click();
  await expect(stock).toHaveValue('8');
  await stock.fill('9');
  await form.getByRole('button', { name: '保存', exact: true }).click();
  await expect(form).toHaveCount(0);
  await expect(page.locator('#summary')).toHaveText('库存 58 / 价值 2814200 分');
}, { apiErrors: true }]);
async function lowStock(page) {
  const low = page.getByRole('checkbox', { name: '仅低库存', exact: true });
  await expect(low, '找不到「仅低库存」复选框').toBeVisible();
  await low.check();
  await expect(page.locator('#list article'), '仅低库存（1–5 件）应只剩 P004、P006').toHaveCount(2);
  await expect(rowFor(page, 'P004')).toBeVisible(); await expect(rowFor(page, 'P006')).toBeVisible();
  await expect(rowFor(page, 'P002')).toHaveCount(0);
  await expect(page.locator('#summary')).toHaveText('库存 8 / 价值 539200 分');
  await expect(page.locator('#totals')).toHaveText('全量 6 种 / 库存 52 / 价值 2634800 分');
  return low;
}
if (n >= 48) apiScenarios.push(['stock-filter', async ({ page, requests }) => {
  const low = await lowStock(page);
  const lowRequests = requests.filter((request) => request.path === '/api/products' && request.query.get('stock') === 'low');
  assert(lowRequests.length > 0, `仅低库存应请求 GET /api/products?stock=low；实际：${requests.map((request) => `${request.method} ${request.path}?${request.query}`).join('、')}`);
  await page.reload(); await expect(low, '刷新后应从 hash 恢复「仅低库存」').toBeChecked();
  await expect(page.locator('#list article')).toHaveCount(2);
  await page.getByLabel('分类', { exact: true }).selectOption('配件');
  await expect(page.locator('#list article'), '低库存 ∩ 配件应只剩 P004（换条件要换 queryKey 重新请求）').toHaveCount(1);
  await page.getByPlaceholder('名称或编号').fill('P006');
  await expect(page.locator('#list article'), '低库存 ∩ 配件 ∩ 搜索 P006 应为 0 项').toHaveCount(0);
  await page.getByPlaceholder('名称或编号').fill('');
  await page.getByLabel('分类', { exact: true }).selectOption('全部');
  await page.getByRole('button', { name: '编辑 P004', exact: true }).click();
  const form = editForm(page);
  await form.getByLabel('库存', { exact: true }).fill('8');
  await form.getByRole('button', { name: '保存', exact: true }).click();
  await expect(form).toHaveCount(0); await expect(rowFor(page, 'P004')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'React 库存工作台', exact: true })).toBeFocused();
  await expect(page.locator('#totals')).toHaveText('全量 6 种 / 库存 57 / 价值 2784300 分');
  await low.uncheck();
  await expect(page.locator('#list article')).toHaveCount(6);
  await expect(rowFor(page, 'P001')).toContainText('库存 12 件');
  await expect(page.locator('#summary')).toHaveText('库存 57 / 价值 2784300 分');
}]);

const mockScenarios = [['storage', async ({ page }) => {
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
}]];
if (n >= 48) mockScenarios.push(['mock-stock-filter', async ({ page }) => {
  const original = await page.evaluate(() => ({ ...localStorage }));
  const low = await lowStock(page);
  assert.deepEqual(await page.evaluate(() => ({ ...localStorage })), original, '筛选写入了业务库存');
  await low.uncheck();
  await expect(page.locator('#list article')).toHaveCount(6);
}]);

const corsScenarios = n === 45 ? [['cors', async ({ page, url, consoleErrors }) => {
  await page.goto(url);
  await expect(page.getByRole('alert').filter({ hasText: '读取失败' }), '直连 8070 时浏览器应因 CORS 拒绝读取').toContainText('读取失败：Failed to fetch');
  await expect(page.getByRole('button', { name: '重新读取', exact: true })).toBeVisible();
  assert(consoleErrors.some((text) => text.includes('CORS')), `Console 应有 CORS 报错；实际：${consoleErrors.join(' | ')}`);
}, { load: false, apiErrors: true }]] : [];

try {
  api = await startApiFixture();
  browser = await chromium.launch();
  for (const [mode, list] of [['api', apiScenarios], ['mock', mockScenarios], ['cors', corsScenarios]]) {
    const selected = list.filter(([name]) => !only || only === name);
    const e2e = mode === 'api' && n >= 47 && (!only || only === 'e2e');
    if (!selected.length && !e2e) continue;
    const frontend = await startFrontend(mode);
    try {
      for (const item of selected) await scenario(frontend, mode, item);
      if (e2e) {
        await api.reset();
        await withEnv({ LAB_E2E_BASE_URL: frontend.url }, () => run(process.execPath, ['node_modules/@playwright/test/cli.js', 'test', '--config', 'tools/api-e2e.config.mjs']));
        count++; console.log(`${id} · e2e（tests/e2e/api.spec.js，临时数据后端）：通过`);
      }
    } finally { await frontend.close(); }
  }
  assert(count > 0, `没有执行场景：${only}`);
  console.log(`${id}：${count} 组实际源码浏览器检查通过；临时数据后端 ${api.origin}，全新 context，未读写 .lab/server/products.json，未清理或覆盖学员的浏览器数据。`);
} finally {
  await browser?.close();
  await api?.close();
}
