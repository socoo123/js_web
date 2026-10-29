import assert from 'node:assert/strict';
import { realpath } from 'node:fs/promises';
import path from 'node:path';
import { chromium, expect } from '@playwright/test';
import { createServer } from 'vite';
import { workspace, viteConfig } from './lab.mjs';
import { staticWebComponents } from './web-components-static.mjs';

const args = process.argv.slice(2);
const production = args.includes('--static');
const starter = args.includes('--starter');
const only = args.find((arg) => arg.startsWith('--only='))?.slice(7);
const config = production ? null : await viteConfig('C43');
if (config) {
  config.server.port = Number(process.env.LAB_C43_PORT ?? 0);
  config.server.hmr = false;
  // Isolated author copies can have a read-only node_modules symlink. Only
  // allow that dependency directory, so Vite can serve its local font assets.
  config.server.fs.allow = [...config.server.fs.allow, await realpath(path.join(workspace, 'node_modules'))];
}
const server = production ? await staticWebComponents() : await createServer(config);
if (!production) await server.listen();
const url = production ? server.url : `http://127.0.0.1:${server.httpServer.address().port}/`;
const browser = await chromium.launch();
let count = 0;
const rows = (page) => page.locator('#list article');
const row = (page, id) => page.locator(`#list article[data-id="${id}"]`);
const input = (page) => page.getByRole('textbox', { name: '库存（0–99999 的整数）', exact: true });
const button = (page, name) => page.getByRole('button', { name, exact: true });

async function tabTo(page, target) {
  for (let n = 0; n < 24; n++) {
    await page.keyboard.press('Tab');
    if (await target.evaluate((element) => element === element.getRootNode().activeElement)) return;
  }
  throw new Error(`Tab 不能到达 ${target}`);
}
async function filterAndOpen(page) {
  await page.getByPlaceholder('名称或编号').fill('P004');
  await expect(rows(page)).toHaveCount(1);
  await tabTo(page, button(page, '编辑 P004'));
  await page.keyboard.press('Enter');
  await expect(input(page)).toHaveValue('3');
  await expect(input(page)).toBeFocused();
}
async function scenario(name, action) {
  if (only && only !== name) return;
  const context = await browser.newContext({ viewport: { width: 360, height: 900 } });
  const page = await context.newPage();
  const errors = [], resources = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('requestfailed', (request) => errors.push(`失败 ${request.url()}`));
  page.on('response', (response) => {
    resources.push(response.url());
    if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`);
  });
  try {
    await page.goto(url);
    await expect(rows(page)).toHaveCount(6);
    await expect(page.locator('#summary')).toContainText('总库存 52');
    const storage = await page.evaluate(() => ({ ...localStorage }));
    await action(page, resources);
    await page.evaluate(() => document.fonts.ready);
    assert.deepEqual(await page.evaluate(() => ({ ...localStorage })), storage, '独立 adapter 不应改写学习者库存存储');
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), '360px 整页横向溢出');
    assert.deepEqual(errors, [], `页面/资源错误：${name}`);
    if (production) assert.deepEqual(resources.filter((resource) => !resource.startsWith(url)), [], '静态产物越过部署子路径或访问外部 CDN');
    console.log(`C43 ${production ? '严格静态' : '开发'}：${name} 通过`);
    count++;
  } finally { await context.close(); }
}

try {
  if (production) {
    assert.equal((await fetch(new URL('missing.js', url))).status, 404, '严格静态服务器不得回退 HTML');
    assert.equal((await fetch(new URL('/', url))).status, 404, '根路径不得掩盖错误 base');
  }
  if (starter) {
    await scenario('starter', async (page) => {
      await expect(page.locator('ui5-input')).toHaveCount(0);
      await button(page, '编辑 P004').click();
      await expect(page.locator('#notice')).toHaveText('请按本课正文连接编辑表单');
      await expect(page.locator('#editor')).toBeHidden();
    });
  } else {
    await scenario('cancel', async (page) => {
      await filterAndOpen(page);
      await input(page).fill('8');
      await expect(page.locator('#feedback')).toContainText('草稿库存 8 件');
      await tabTo(page, button(page, '取消'));
      await page.keyboard.press('Enter');
      await expect(page.locator('#editor')).toBeHidden();
      await expect(row(page, 'P004')).toContainText('库存 3 件');
      await expect(page.locator('#summary')).toContainText('总库存 52');
      await expect(button(page, '编辑 P004')).toBeFocused();
      await page.getByPlaceholder('名称或编号').fill('');
      await expect(rows(page)).toHaveCount(6);
      await button(page, '编辑 P002').click();
      await expect(input(page)).toHaveValue('0');
    });
    await scenario('save', async (page) => {
      const before = await rows(page).allTextContents();
      await filterAndOpen(page);
      await input(page).fill('8');
      await expect(page.locator('#feedback')).toContainText('草稿库存 8 件');
      await expect(button(page, '保存')).toBeEnabled();
      await tabTo(page, button(page, '保存'));
      await page.keyboard.press('Enter');
      await expect(page.locator('#editor')).toBeHidden();
      await expect(page.locator('#summary')).toContainText('总库存 57');
      await page.getByPlaceholder('名称或编号').fill('');
      await expect(rows(page)).toHaveCount(6);
      const after = await rows(page).allTextContents();
      assert.deepEqual(after, before.map((text, n) => n === 3 ? text.replace('库存 3 件', '库存 8 件') : text), '只有 P004 的 stock 可变，其他字段/商品必须保留');
      await expect(row(page, 'P001')).toContainText('库存 12 件');
    });
    await scenario('boundaries', async (page) => {
      await filterAndOpen(page);
      for (const text of ['', '  ', '-1', '3.8', '3件', '100000']) {
        await input(page).fill(text);
        await expect(button(page, '保存')).toBeDisabled();
        await expect.poll(() => page.locator('#edit-stock').evaluate((element) => element.valueState)).toBe('Negative');
        await expect(page.locator('#feedback')).not.toBeEmpty();
        await expect(row(page, 'P004')).toContainText('库存 3 件');
        await expect(page.locator('#summary')).toContainText('总库存 52');
      }
      await input(page).fill('0');
      await expect(button(page, '保存')).toBeEnabled();
      await button(page, '保存').click();
      await expect(page.locator('#editor')).toBeHidden();
      await expect(row(page, 'P004')).toContainText('库存 0 件');
      await expect(page.locator('#summary')).toContainText('总库存 49');
      await page.reload();
      await expect(page.locator('#summary')).toContainText('总库存 52');
    });
    await scenario('properties-slots', async (page) => {
      await filterAndOpen(page);
      const host = page.locator('#save');
      await host.evaluate((element) => element.setAttribute('disabled', 'false'));
      await expect.poll(() => host.evaluate((element) => [element.hasAttribute('disabled'), element.disabled, typeof element.disabled])).toEqual([true, true, 'boolean']);
      await expect(button(page, '保存')).toBeDisabled();
      await host.evaluate((element) => { element.removeAttribute('disabled'); element.disabled = false; });
      await expect(button(page, '保存')).toBeEnabled();
      await input(page).fill('');
      await expect.poll(() => page.locator('#value-message').evaluate((element) => element.assignedSlot?.name)).toBe('valueStateMessage');
      assert.deepEqual(await page.locator('#edit-stock').evaluate((element) => [element.querySelector('input'), Boolean(element.shadowRoot.querySelector('input')), element.querySelector('#value-message').parentElement === element]), [null, true, true]);
      await page.addStyleTag({ content: 'ui5-input input { color: red; } ui5-input::part(input) { letter-spacing: 2px; }' });
      const styles = await page.locator('#edit-stock').evaluate((element) => {
        const style = getComputedStyle(element.shadowRoot.querySelector('input'));
        return { color: style.color, spacing: style.letterSpacing };
      });
      assert.notEqual(styles.color, 'rgb(255, 0, 0)');
      assert.equal(styles.spacing, '2px');
    });
    await scenario('resources', async (page, resources) => {
      await filterAndOpen(page);
      const clear = page.locator('#edit-stock').locator('[part="clear-icon"]');
      await expect(clear).toHaveAttribute('accessible-name', '清除');
      await page.selectOption('#theme', 'sap_horizon_dark');
      await expect(page.locator('#settings')).toContainText('sap_horizon_dark');
      await expect.poll(() => page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--sapBackgroundColor').trim())).toBe('#12171c');
      await page.selectOption('#language', 'en');
      await expect(page.locator('#settings')).toContainText('组件语言 en');
      await expect(clear).toHaveAttribute('accessible-name', 'Clear');
      await expect(button(page, '保存')).toBeVisible();
      assert(resources.some((resource) => /zh_CN/.test(resource)), '未观察到中文翻译资源');
      assert(resources.some((resource) => /parameters-bundle/.test(resource)), '未观察到深色主题资源');
      await page.evaluate(() => document.fonts.ready);
      assert(resources.some((resource) => /\.woff2?(?:\?|$)/.test(resource)), '未观察到字体资源');
    });
  }
  assert(count > 0, '没有执行场景，请检查 --only 名称');
  console.log(`C43：${count} 组实际工作文件浏览器检查通过；未修改源码或既有存储。`);
} finally { await browser.close(); await server.close(); }
