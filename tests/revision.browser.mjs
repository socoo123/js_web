import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { globSync } from 'node:fs';
import path from 'node:path';
import { chromium, expect } from '../labs/inventory/node_modules/@playwright/test/index.mjs';
import { comparison } from '../labs/sources.mjs';
import catalog from '../labs/catalog.json' with { type: 'json' };

const base = process.env.REVISION_BASE_URL ?? 'http://127.0.0.1:8874/js_web/';
const qa = path.resolve('.cache/qa/v2/site-review'); await mkdir(qa, { recursive: true });
const routes = globSync('**/*.html', { cwd: 'dist' }).filter((route) => !route.startsWith('demos/')).map((route) => route.replace(/index\.html$/, ''));
const trials = catalog.lessons.filter((row) => row.migrated).map((row) => row.slug + '/');
const copyRoute = '02-language-data/c03-values-types/';
const errors = []; let geometry = 0;
const browser = await chromium.launch();
try {
  const context = await browser.newContext({ permissions: ['clipboard-read', 'clipboard-write'] });
  const page = await context.newPage(); page.on('pageerror', (error) => errors.push(error.message));
  if (!process.env.REVISION_INTERACTIONS_ONLY) for (const width of [360, 768, 1280]) for (const theme of ['light', 'dark']) {
    await page.setViewportSize({ width, height: 950 });
    await page.goto(base); await page.locator('starlight-theme-select select').first().selectOption(theme, { force: true });
    for (const route of routes) {
      const response = await page.goto(base + route); assert.equal(response.status(), 200, route);
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `整页溢出 ${route} ${width} ${theme}`);
      geometry++;
      for (const image of await page.locator('.sl-markdown-content img').all()) {
        await image.scrollIntoViewIfNeeded();
        await expect.poll(() => image.evaluate((img) => Boolean(img.alt) && img.complete && img.naturalWidth > 0), { message: `正文图片 ${route}` }).toBe(true);
      }
      if (trials.includes(route)) {
        const sides = page.locator('.compare-side'); await expect(sides).toHaveCount(2);
        const left = await sides.nth(0).boundingBox(); const right = await sides.nth(1).boundingBox();
        assert(width === 1280 ? Math.abs(left.y - right.y) < 2 : right.y > left.y + left.height - 2, `双栏响应式 ${route} ${width}`);
        const target = page.locator('.code-compare'); await target.scrollIntoViewIfNeeded();
        await target.screenshot({ path: path.join(qa, `${route.split('/')[1]}-${width}-${theme}.png`) });
      }
    }
  }
  await page.goto(base + copyRoute);
  for (let side = 0; side < 2; side++) {
    const column = page.locator('.compare-side').nth(side); const expected = comparison('c03-input-number')[side === 0 ? 'left' : 'right'].code;
    const button = column.getByRole('button', { name: '复制到剪贴板' }); await button.focus(); await page.keyboard.press('Enter');
    await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toBe(expected);
  }
  await page.evaluate(() => Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: () => Promise.reject(new Error('denied')) } }));
  await page.locator('.compare-side').first().getByRole('button', { name: '复制到剪贴板' }).click();
  await expect(page.locator('[data-copy-feedback]').first()).toContainText('复制失败，请选中本侧代码手动复制');
  await page.locator('.compare-side pre').first().focus();
  await expect(page.locator('.compare-side pre').first()).toBeFocused();
  const answer = page.locator('summary').filter({ hasText: /^参考答案$/ }).first(); await answer.focus(); await page.keyboard.press('Enter');
  await expect(answer.locator('..')).toHaveAttribute('open', '');
  const images = page.locator('article img');
  for (const image of await images.all()) assert(await image.evaluate((img) => Boolean(img.alt) && img.complete && img.naturalWidth > 0), 'D2 加载/alt');
  for (const query of ['函数式更新', '库存', '绑定']) {
    await page.getByRole('button', { name: '搜索' }).first().click();
    const input = page.getByRole('dialog').getByRole('textbox', { name: '搜索课程' }); await input.fill(query);
    await expect(page.locator('.pagefind-ui__result').first()).toBeVisible();
    await page.keyboard.press('Escape');
  }
  const nojs = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 360, height: 950 } });
  for (const route of routes) {
    const plain = await nojs.newPage(); await plain.goto(base + route);
    await expect(plain.locator('h1').first()).toBeVisible();
    if (trials.includes(route)) {
      await expect(plain.locator('.compare-side')).toHaveCount(2);
      for (const button of await plain.locator('.code-compare button').all()) await expect(button).toBeHidden();
      await plain.locator('summary').filter({ hasText: /^参考答案$/ }).first().click();
      await expect(plain.locator('details[open]').last()).toBeVisible();
    }
    await plain.close();
  }
  assert.deepEqual(errors, []);
  console.log(`V2 视觉/阅读：${geometry ? `${routes.length} 页 × 三宽度/亮暗 = ${geometry} 组` : '交互专项复测'}；两侧键盘复制/失败提示、原生答案、三词搜索、D2 与全页禁用 JS 阅读通过。截图：${qa}`);
} finally { await browser.close(); }
