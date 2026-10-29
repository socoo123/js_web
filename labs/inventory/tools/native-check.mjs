import assert from 'node:assert/strict';
import { createServer } from 'vite';
import { chromium, expect } from '@playwright/test';
import { viteConfig } from './lab.mjs';
const n = Number(process.argv[2]?.slice(1));
const config = await viteConfig(process.argv[2]);
const port = Number(process.env.LAB_NATIVE_CHECK_PORT ?? 8062);
config.server.port = port; config.server.hmr = false;
const server = await createServer(config);
let browser;
try {
  await server.listen(); browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 360, height: 900 } });
  const page = await context.newPage();
  await page.goto(`http://127.0.0.1:${port}/`);
  await expect(page.locator('#list article')).toHaveCount(6);
  await expect(page.locator('#summary')).toContainText('库存 52');
  await page.getByRole('search').getByPlaceholder('名称或编号').fill('P004');
  await expect(page.locator('#list article')).toHaveCount(1);
  const card = page.locator('article[data-id="P004"]');
  await card.getByRole('button', { name: '编辑', exact: true }).click();
  await expect(page.getByLabel('库存', { exact: true })).toBeFocused();
  await page.getByLabel('库存', { exact: true }).fill('8');
  await page.getByRole('button', { name: '取消', exact: true }).click();
  await expect(card).toContainText('库存 3 件');
  await card.getByRole('button', { name: '编辑', exact: true }).click();
  await page.getByLabel('库存', { exact: true }).fill('');
  await page.getByRole('button', { name: '保存', exact: true }).click();
  await expect(page.locator('#stock-error')).toContainText('空白');
  await expect(card).toContainText('库存 3 件');
  await page.getByLabel('库存', { exact: true }).fill('8');
  await page.getByRole('button', { name: '保存', exact: true }).click();
  await expect(card).toContainText('库存 8 件');
  assert.deepEqual(await page.evaluate(() => [window.products[0].stock, window.products[3].stock]), [12, 8]);
  for (let i = 0; i < 2; i++) await card.getByRole('button', { name: '补 1 件', exact: true }).click();
  await expect(card).toContainText('库存 10 件');
  if (n >= 12) {
    await page.getByRole('button', { name: '模拟失败', exact: true }).click();
    await expect(page.locator('#feedback')).toContainText(n === 12 ? '模拟加载失败' : 'HTTP 404');
    await expect(page.locator('#reload')).toBeEnabled();
    await page.getByRole('button', { name: '重新加载', exact: true }).click();
    await expect(card).toContainText('库存 3 件');
  }
  if (n >= 14) {
    const key = 'js_web:inventory:vanilla:v2';
    await card.getByRole('button', { name: '补 1 件', exact: true }).click();
    await page.reload(); await expect(page.locator('article[data-id="P004"]')).toContainText('库存 4 件');
    const raw = await page.evaluate((key) => localStorage.getItem(key), key);
    await page.locator('#import').setInputFiles({ name: 'bad.json', mimeType: 'application/json', buffer: Buffer.from('{"version":1,"products":[{"stock":"3"}]}') });
    await expect(page.locator('#feedback')).toContainText('导入失败');
    assert.equal(await page.evaluate((key) => localStorage.getItem(key), key), raw);
    await page.evaluate((key) => localStorage.setItem(key, '{broken'), key);
    await page.reload(); await expect(page.locator('#recover')).toBeVisible();
    await expect(page.locator('#feedback')).toContainText('读取失败');
    await page.getByRole('button', { name: '恢复备份', exact: true }).click();
    await expect(page.locator('#list article')).toHaveCount(6);
    assert.equal(await page.evaluate((key) => localStorage.getItem(key + ':damaged'), key), '{broken');
    const downloadEvent = page.waitForEvent('download');
    await page.getByRole('button', { name: '导出快照', exact: true }).click();
    assert.equal((await downloadEvent).suggestedFilename(), 'inventory.json');
  }
  await page.getByPlaceholder('名称或编号').fill('');
  if (n >= 15) for (const [width, columns] of [[360, 1], [768, 2], [1280, 4]]) {
    await page.setViewportSize({ width, height: 900 });
    assert.equal(await page.locator('#list').evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(' ').length), columns);
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await page.locator('#filters input').focus();
    assert.notEqual(await page.locator('#filters input').evaluate((element) => getComputedStyle(element).outlineStyle), 'none');
  }
  if (n === 11) {
    await page.evaluate(() => { window.products[0].name = '<img src=x onerror=alert(1)>'; });
    await page.getByPlaceholder('名称或编号').fill('P001');
    await expect(page.locator('article h2')).toContainText('<img');
    assert.equal(await page.locator('#list img').count(), 0);
  }
  console.log(`C${n} 原生页：按 ID 编辑/取消/非法输入/两次各补 1 件通过${n >= 14 ? '；刷新、拒绝导入与坏 JSON 备份恢复通过' : ''}${n >= 15 ? '；360/768/1280 布局与焦点通过' : ''}。`);
} finally { if (browser) await browser.close(); await server.close(); }
