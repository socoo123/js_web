// 复用阶段 4 已锁定的浏览器工具；运行方式见 README。
import { chromium, expect } from '../examples/inventory/04-react/node_modules/@playwright/test/index.mjs';
import assert from 'node:assert/strict';
import { readFile, mkdir } from 'node:fs/promises';
import { PROGRESS_KEY, BACKUP_KEY, DAMAGED_KEY, LESSON_IDS } from '../src/lib/progress.mjs';

const base = process.env.PROGRESS_BASE_URL ?? 'http://127.0.0.1:8751/js_web/';
const lesson1 = '01-history-web/c01-story-ecosystem/';
const lesson2 = '01-history-web/c02-web-debugging/';
const lesson48 = '07-project/c48-review-next-steps/';
const qa = new URL('../.cache/qa/f1/', import.meta.url);
await mkdir(qa, { recursive: true });
const browser = await chromium.launch();
const errors = [];
const track = (page) => {
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('response', (response) => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
};
const upload = (page, content) => page.locator('[data-progress-file]').setInputFiles({
  name: 'progress.json', mimeType: 'application/json', buffer: Buffer.from(content),
});
const raw = (page, key = PROGRESS_KEY) => page.evaluate((key) => localStorage.getItem(key), key);
const summary = (page) => page.locator('[data-progress-summary]');
try {
  const context = await browser.newContext({ viewport: { width: 1280, height: 950 }, acceptDownloads: true });
  const page = await context.newPage(); track(page);
  assert.equal((await page.goto(base + lesson1)).status(), 200);
  await expect(summary(page)).toHaveText('C01 未完成 · 已完成 0 / 48 课');
  assert.equal(await raw(page), null);
  await page.getByRole('button', { name: '标记完成', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('button', { name: '撤销完成', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await page.reload();
  await expect(summary(page)).toHaveText('C01 已完成 · 已完成 1 / 48 课');
  for (const route of [lesson2, lesson48]) {
    await page.goto(base + route);
    await page.getByRole('button', { name: '标记完成', exact: true }).click();
  }
  await page.getByRole('link', { name: '查看学习路线', exact: true }).click();
  await expect(summary(page)).toHaveText('已完成 3 / 48 课');
  await expect(page.locator('[data-lesson-status]')).toHaveCount(48);
  await expect(page.locator('.lesson-completed')).toHaveCount(3);

  const other = await context.newPage(); track(other);
  await other.goto(base + lesson1);
  await other.getByRole('button', { name: '撤销完成', exact: true }).click();
  await expect(summary(page)).toHaveText('已完成 2 / 48 课');
  await expect(page.locator('[data-lesson-status="C01"]')).toHaveText(' · 未完成');
  const downloadEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: '导出进度', exact: true }).click();
  const download = await downloadEvent;
  assert.equal(download.suggestedFilename(), 'js-web-progress.json');
  assert.deepEqual(JSON.parse(await readFile(await download.path(), 'utf8')), { version: 1, completed: ['C02', 'C48'] });

  const imported = JSON.stringify({ version: 1, completed: ['C03', 'C01', 'C03'] });
  await upload(page, imported);
  await expect(summary(page)).toHaveText('已完成 4 / 48 课');
  await expect(summary(other)).toHaveText('C01 已完成 · 已完成 4 / 48 课');
  await upload(page, imported);
  await expect(page.locator('[data-progress-message]')).toHaveText('已导入并合并进度。');
  assert.deepEqual(JSON.parse(await raw(page)).completed, ['C01', 'C02', 'C03', 'C48']);
  const saved = await raw(page);
  for (const content of ['{', 'null', '{"version":2,"completed":[]}', '{"version":1,"completed":["C49"]}', ' '.repeat(65537)]) {
    await upload(page, content);
    await expect(page.locator('[data-progress-message]')).toHaveAttribute('data-error', '');
    assert.equal(await raw(page), saved);
  }

  await other.evaluate((key) => localStorage.setItem(key, '{broken'), PROGRESS_KEY);
  await expect(page.getByRole('button', { name: '从本地备份恢复', exact: true })).toBeVisible();
  assert.equal(await raw(page), '{broken');
  await page.getByRole('button', { name: '从本地备份恢复', exact: true }).click();
  await expect(summary(page)).toHaveText('已完成 4 / 48 课');
  assert.equal(await raw(page, DAMAGED_KEY), '{broken');
  await expect(page.getByRole('button', { name: '导入进度', exact: true })).toBeFocused();
  await page.evaluate(({ key, backup }) => { localStorage.setItem(key, 'bad'); localStorage.setItem(backup, 'bad backup'); }, { key: PROGRESS_KEY, backup: BACKUP_KEY });
  await page.reload();
  await expect(page.getByRole('button', { name: '从本地备份恢复', exact: true })).toBeHidden();
  await upload(page, '{"version":1,"completed":["C05"]}');
  await expect(summary(page)).toHaveText('已完成 1 / 48 课');
  assert.equal(await raw(page, DAMAGED_KEY), 'bad');
  await page.evaluate((key) => localStorage.setItem(key, 'broken again'), PROGRESS_KEY);
  await page.reload();
  page.once('dialog', (dialog) => dialog.dismiss());
  await page.getByRole('button', { name: '重新开始', exact: true }).click();
  assert.equal(await raw(page), 'broken again');
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: '重新开始', exact: true }).click();
  await expect(summary(page)).toHaveText('已完成 0 / 48 课');
  assert.equal(await raw(page, DAMAGED_KEY), 'broken again');
  await upload(page, JSON.stringify({ version: 1, completed: LESSON_IDS }));
  await expect(summary(page)).toHaveText('已完成 48 / 48 课');
  await expect(page.locator('.lesson-completed')).toHaveCount(48);
  await upload(page, '{"version":1,"completed":[]}');
  await expect(summary(page)).toHaveText('已完成 48 / 48 课');
  await expect(page.locator('[data-progress-meter]')).toHaveJSProperty('value', 48);

  for (const route of ['roadmap/', lesson48]) {
    await page.goto(base + route);
    for (const width of [1280, 360]) for (const theme of ['light', 'dark']) {
      await page.setViewportSize({ width, height: 950 });
      await page.locator('starlight-theme-select select').first().selectOption(theme, { force: true });
      await page.locator('[data-progress]').scrollIntoViewIfNeeded();
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      await page.screenshot({ path: new URL(`progress-${route === 'roadmap/' ? 'roadmap' : 'lesson'}-${width}-${theme}.png`, qa).pathname });
    }
  }
  for (const route of ['', 'reference/java-js/']) {
    await page.goto(base + route); await expect(page.locator('[data-progress]')).toHaveCount(0);
  }

  const blocked = await browser.newContext();
  await blocked.addInitScript(() => Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('denied', 'SecurityError'); } }));
  const denied = await blocked.newPage(); track(denied);
  await denied.goto(base + lesson1);
  await expect(denied.getByRole('button', { name: '标记完成', exact: true })).toBeDisabled();
  await expect(denied.locator('[data-progress-message]')).toContainText('浏览器未允许保存进度');
  await expect(denied.getByRole('heading', { level: 1 })).toBeVisible();
  await denied.locator('starlight-theme-select select').first().selectOption('dark', { force: true });
  await expect(denied.locator('html')).toHaveAttribute('data-theme', 'dark');
  await denied.locator('starlight-theme-select select').first().selectOption('light', { force: true });
  await expect(denied.locator('html')).toHaveAttribute('data-theme', 'light');
  const quota = await browser.newContext();
  await quota.addInitScript((key) => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (name, value) {
      if (name === key) throw new DOMException('full', 'QuotaExceededError');
      return original.call(this, name, value);
    };
  }, PROGRESS_KEY);
  const full = await quota.newPage(); track(full);
  await full.goto(base + lesson1);
  await full.getByRole('button', { name: '标记完成', exact: true }).click();
  await expect(summary(full)).toHaveText('C01 未完成 · 已完成 0 / 48 课');
  await expect(full.locator('[data-progress-message]')).toContainText('保存失败');

  const nojs = await browser.newContext({ javaScriptEnabled: false });
  const rawPage = await nojs.newPage(); track(rawPage);
  for (const route of [lesson1, lesson48, 'roadmap/']) {
    assert.equal((await rawPage.goto(base + route)).status(), 200);
    await expect(rawPage.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(rawPage.locator('[data-progress-controls]')).toBeHidden();
    await expect(rawPage.locator('[data-progress] noscript p')).toBeVisible();
    assert((await rawPage.locator('[data-progress] noscript p').textContent()).includes('课程正文和练习可以继续阅读'));
    if (route !== 'roadmap/') {
      const detail = rawPage.locator('main details').first();
      await detail.locator('summary').click(); await expect(detail).toHaveAttribute('open', '');
    }
  }
  assert.deepEqual(errors, []);
  console.log(`F1 浏览器回归通过（${browser.version()}）：标记/撤销/刷新/48 课状态、跨标签同步、导出/合并/拒绝坏文件、损坏恢复/重开、权限/写满失败、八组宽度主题、禁用 JS 阅读。${base}`);
} finally {
  await browser.close();
}
