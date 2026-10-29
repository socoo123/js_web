import assert from 'node:assert/strict';
import { createServer } from 'vite';
import { chromium, expect } from '@playwright/test';
import { viteConfig } from './lab.mjs';

const id = process.argv[2];
if (!/^C(?:2[1-9]|3[0-6])$/.test(id ?? '')) throw new Error('React 检查需要 C21..C36');
const n = Number(id.slice(1));
const config = await viteConfig(id);
config.server.port = 0;
config.server.hmr = false;
const server = await createServer(config);
let browser;
let scenarios = 0;
const rowFor = (page, productId) => page.locator(`article[data-id="${productId}"]`);
try {
  await server.listen();
  const port = server.httpServer.address().port;
  const url = `http://127.0.0.1:${port}/`;
  browser = await chromium.launch();
  async function scenario(run, { reportError = false } = {}) {
    // Every scenario has a new, disposable browser profile. Never clear learner storage.
    const context = await browser.newContext({ viewport: { width: 360, height: 900 } });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    try {
      await page.goto(url);
      await expect(page.locator('#list article')).toHaveCount(6);
      await run(page);
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), '360px 出现整页横向滚动');
      assert.deepEqual(errors.filter((text) => !(reportError && text.includes('模拟报表渲染失败'))), []);
      scenarios++;
    } finally { await context.close(); }
  }

  await scenario(async (page) => {
    await expect(rowFor(page, 'P001')).toContainText('库存 12 件');
    await expect(rowFor(page, 'P002')).toContainText('库存 0 件');
  });
  if (n >= 23) {
    await scenario(async (page) => {
      const row = rowFor(page, 'P001');
      await row.getByRole('button', { name: '连续补三件', exact: true }).click();
      await expect(row.getByRole('status')).toContainText('15 件');
    });
    await scenario(async (page) => {
      const row = rowFor(page, 'P001');
      await row.getByRole('button', { name: '延迟补三件', exact: true }).click();
      await row.getByRole('button', { name: '立即补一件', exact: true }).click();
      await expect(row.getByRole('status')).toContainText('16 件');
      if (n >= 24) await expect(page.locator('#summary')).toContainText('库存 56');
    });
  }
  // C25–28 form/browser coverage belongs to forms-state.browser; keep this list/CRUD
  // regression for C24 and the later application without rerunning that same form journey.
  if (n === 24 || n >= 29) {
    await scenario(async (page) => {
      const row = rowFor(page, 'P004');
      await row.getByLabel('P004 行备注').fill('只属于P004');
      await page.getByLabel('排序', { exact: true }).selectOption('stock');
      await expect(row.getByLabel('P004 行备注')).toHaveValue('只属于P004');
      await page.getByPlaceholder('名称或编号').fill('P004');
      await expect(page.locator('#list article')).toHaveCount(1);
      await row.getByRole('button', { name: '立即补一件', exact: true }).click();
      await expect(page.locator('#summary')).toContainText('库存 4');
      if (n >= 25) {
        await row.getByRole('button', { name: '编辑 P004', exact: true }).click();
        const form = page.getByRole('form', { name: '商品编辑' });
        await form.getByLabel('库存', { exact: true }).fill('');
        await form.getByRole('button', { name: '保存', exact: true }).click();
        await expect(form.getByText('请输入库存，空白无效', { exact: true })).toBeVisible();
        await expect(form.getByLabel('库存', { exact: true })).toBeFocused();
        await expect(row).toContainText('库存 4 件');
        await form.getByLabel('库存', { exact: true }).fill('8');
        await form.getByRole('button', { name: '保存', exact: true }).click();
        await expect(row).toContainText('库存 8 件');
        if (n >= 28) await expect(row.getByRole('button', { name: '编辑 P004', exact: true })).toBeFocused();
        await page.getByPlaceholder('名称或编号').fill('');
        if (n >= 26) {
          await page.getByRole('button', { name: '编辑 P001', exact: true }).click();
          await form.getByLabel('名称', { exact: true }).fill('未保存草稿');
          await form.getByRole('button', { name: '取消', exact: true }).click();
          await page.getByRole('button', { name: '编辑 P002', exact: true }).click();
          await expect(form.getByLabel('库存', { exact: true })).toHaveValue('0');
          await expect(form.getByLabel('名称', { exact: true })).toHaveValue('无线鼠标');
          await form.getByRole('button', { name: '取消', exact: true }).click();
          await expect(rowFor(page, 'P001').locator('h2')).toContainText('机械键盘');
        }
        await page.getByRole('button', { name: '新建商品', exact: true }).click();
        await form.getByLabel('名称', { exact: true }).fill('测试新商品');
        await form.getByLabel('库存', { exact: true }).fill('0');
        await form.getByLabel('价格（元）', { exact: true }).fill('0.29');
        await form.getByRole('button', { name: '保存', exact: true }).click();
        await expect(rowFor(page, 'P007')).toContainText('单价 0.29 元');
      } else {
        await page.getByPlaceholder('名称或编号').fill('');
        await page.getByRole('button', { name: '新增示例商品', exact: true }).click();
        await expect(rowFor(page, 'P007')).toBeVisible();
      }
      await page.getByRole('button', { name: '删除 P007', exact: true }).click();
      await expect(rowFor(page, 'P007')).toHaveCount(0);
    });
  }
  // C28's dedicated forms browser already owns cancel/reschedule/unmount.
  if (n >= 29) {
    await scenario(async (page) => {
      const first = rowFor(page, 'P001');
      await page.clock.install();
      await first.getByRole('button', { name: '延迟补三件', exact: true }).click();
      await first.getByRole('button', { name: '取消盘点', exact: true }).click();
      // Covers both the inherited 3000ms and the C28 2000ms instructional timers.
      await page.clock.runFor(3500);
      await expect(first.getByRole('status')).toContainText('12 件');
      // C29–32 keyboard/cleanup belongs to browser-a3.mjs; later snapshots retain it here.
      if (n >= 33) {
        await page.keyboard.press('Alt+ArrowUp');
        await page.clock.runFor(3500);
        await expect(first.getByRole('status')).toContainText('13 件');
        assert.equal(await page.title(), '库存工作台 · 6 件商品');
      }
    });
  }
  // C30 request races and C31/32 hash/persistence/static paths are exercised once
  // by browser-a3.mjs. C35's separate production E2E remains in its own test layer.
  if (n >= 33) {
    await scenario(async (page) => {
      await page.getByPlaceholder('名称或编号').fill('P004');
      await page.getByRole('link', { name: '详情 P004', exact: true }).click();
      await expect(page.getByRole('region', { name: '商品详情', exact: true })).toContainText('P004 USB-C 扩展坞');
      await page.reload();
      await expect(page.getByRole('region', { name: '商品详情', exact: true })).toContainText('P004 USB-C 扩展坞');
      await page.getByRole('link', { name: '返回列表', exact: true }).click();
      await expect(page.getByPlaceholder('名称或编号')).toHaveValue('P004');
      // This is a dev-server route check; C35 adds the separate strict-static production smoke.
    });
  }
  if (n >= 33) {
    await scenario(async (page) => {
      await page.getByRole('button', { name: '编辑 P004', exact: true }).click();
      const form = page.getByRole('form', { name: '商品编辑', exact: true });
      await form.getByLabel('库存', { exact: true }).fill('8');
      await page.getByLabel('模拟保存失败', { exact: true }).check();
      await form.getByRole('button', { name: '保存', exact: true }).click();
      await expect(form.getByRole('button', { name: '正在保存…' })).toBeDisabled();
      await expect(form.getByText('预览库存 8 件（等待确认）', { exact: true })).toBeVisible();
      await expect(form.getByRole('alert')).toContainText('模拟 save 失败');
      await expect(form.getByLabel('库存', { exact: true })).toHaveValue('8');
      await expect(form.getByLabel('编辑分类', { exact: true })).toHaveValue('配件');
      await expect(form.getByText('预览库存 3 件（已保存）', { exact: true })).toBeVisible();
      await expect(page.locator('#summary')).toContainText('库存 52');
      await page.getByLabel('模拟保存失败', { exact: true }).uncheck();
      await form.getByRole('button', { name: '保存', exact: true }).click();
      await expect(form).toHaveCount(0);
      await expect(rowFor(page, 'P004')).toContainText('库存 8 件');
      await expect(page.locator('#summary')).toContainText('库存 57');
    });
    await scenario(async (page) => {
      const search = page.getByPlaceholder('名称或编号');
      const heading = page.getByRole('heading', { name: 'React 库存工作台', level: 1, exact: true });
      await search.fill('机械');
      await page.getByRole('button', { name: '编辑 P001', exact: true }).click();
      const form = page.getByRole('form', { name: '商品编辑', exact: true });
      await expect(form).toHaveAttribute('novalidate', '');
      await expect(form.getByLabel('名称', { exact: true })).toBeFocused();
      await form.getByLabel('名称', { exact: true }).fill('更名键盘');
      await page.keyboard.press('Tab');
      await expect(form.getByLabel('库存', { exact: true })).toBeFocused();
      await form.getByLabel('库存', { exact: true }).fill('13');
      await page.keyboard.press('Tab');
      await expect(form.getByLabel('价格（元）', { exact: true })).toBeFocused();
      await page.keyboard.press('Enter');
      await expect(form).toHaveCount(0);
      await expect(page.locator('#list article')).toHaveCount(0);
      await expect(heading).toBeFocused();
      await expect(heading).toHaveAttribute('tabindex', '-1');
      await search.fill('');
      await page.getByRole('button', { name: '编辑 P001', exact: true }).click();
      await search.fill('P004');
      await expect(rowFor(page, 'P001')).toHaveCount(0);
      await form.getByRole('button', { name: '取消', exact: true }).click();
      await expect(heading).toBeFocused();
    });
  }
  if (n >= 34) {
    await scenario(async (page) => {
      const measures = [];
      const modules = [];
      page.on('console', (message) => {
        if (message.text().startsWith('库存渲染 ')) measures.push(JSON.parse(message.text().slice('库存渲染 '.length)));
      });
      page.on('request', (request) => { if (request.url().includes('/ReportPanel.jsx')) modules.push(request.url()); });
      await page.getByPlaceholder('名称或编号').fill('P004');
      await expect(page.locator('#list article')).toHaveCount(1);
      await page.getByPlaceholder('名称或编号').fill('');
      await rowFor(page, 'P002').getByRole('button', { name: '立即补一件', exact: true }).click();
      await expect(page.locator('#summary')).toContainText('库存 53');
      assert.equal(modules.length, 0, '报表不应在首次展开前下载');
      await page.getByRole('button', { name: '查看分类报表', exact: true }).click();
      await expect(page.getByRole('row', { name: '外设 2 13 491700', exact: true })).toBeVisible();
      assert.equal(modules.length, 1);
      await page.getByLabel('模拟报表故障', { exact: true }).check();
      await expect(page.getByRole('alert').filter({ hasText: '报表暂时无法显示' })).toBeVisible();
      await expect(rowFor(page, 'P002')).toContainText('库存 1 件');
      await page.getByLabel('模拟报表故障', { exact: true }).uncheck();
      await page.getByRole('button', { name: '收起分类报表', exact: true }).click();
      await page.getByRole('button', { name: '查看分类报表', exact: true }).click();
      await expect(page.getByRole('row', { name: '外设 2 13 491700', exact: true })).toBeVisible();
      assert(measures.some((item) => item.phase === 'update' && item.actualDuration >= 0), '没有采集到实际 Profiler 提交');
      console.log('Profiler 实际记录（六商品，筛选/补货/报表）：', JSON.stringify(measures));
    }, { reportError: true });
  }
  if (n >= 36) {
    await scenario(async (page) => {
      const snapshots = page.getByRole('region', { name: '本地库存快照', exact: true });
      await snapshots.getByRole('button', { name: '保存本地快照', exact: true }).click();
      await expect.poll(() => page.evaluate(() => Object.values(localStorage).some((text) => {
        try { return JSON.parse(text).version === 1; } catch { return false; }
      }))).toBe(true);
      await page.getByRole('button', { name: '编辑 P004', exact: true }).click();
      const form = page.getByRole('form', { name: '商品编辑', exact: true });
      await form.getByLabel('库存', { exact: true }).fill('8');
      await form.getByRole('button', { name: '保存', exact: true }).click();
      await expect(rowFor(page, 'P004')).toContainText('库存 8 件');
      const before = await page.evaluate(() => ({ ...localStorage }));
      await snapshots.getByLabel('导入快照', { exact: true }).setInputFiles({
        name: 'invalid.json', mimeType: 'application/json', buffer: Buffer.from('{"version":1,"products":[{"stock":""}]}'),
      });
      await expect(snapshots.getByRole('status')).toContainText('快照操作失败');
      assert.deepEqual(await page.evaluate(() => ({ ...localStorage })), before, '非法导入覆盖了有效存储');
      await expect(page.locator('#summary')).toContainText('库存 57');
      const key = await page.evaluate(() => {
        const key = Object.keys(localStorage).find((name) => !name.endsWith(':backup') && !name.endsWith(':damaged'));
        localStorage.setItem(key, '{bad'); return key;
      });
      await snapshots.getByRole('button', { name: '恢复备份', exact: true }).click();
      await expect(rowFor(page, 'P004')).toContainText('库存 3 件');
      await expect(page.locator('#summary')).toContainText('库存 52');
      assert.equal(await page.evaluate((key) => localStorage.getItem(key + ':damaged'), key), '{bad');
      await page.getByRole('link', { name: '详情 P004', exact: true }).click();
      await expect(page.getByRole('region', { name: '商品详情', exact: true })).toContainText('库存 3');
    });
  }
  console.log(`${id}：${scenarios} 组隔离浏览器场景通过；只要求本课和必要前置行为，未触碰现有浏览器数据。`);
} finally { await browser?.close(); await server.close(); }
