// 复用连续工作区锁定的浏览器工具，不再为站点回归另装旧阶段工程。
import { chromium, expect } from '../labs/inventory/node_modules/@playwright/test/index.mjs';
import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { PROGRESS_KEY, BACKUP_KEY, DAMAGED_KEY, LESSON_IDS, LAB_STEPS } from '../src/lib/progress.mjs';

const base = process.env.PROGRESS_BASE_URL ?? 'http://127.0.0.1:8751/js_web/';
const lesson1 = '01-history-web/c01-story-ecosystem/';
const lesson2 = '01-history-web/c02-web-debugging/';
const lesson48 = '07-project/c48-review-next-steps/';
const lab3 = 'labs/l3/';
const STEPS = Object.values(LAB_STEPS).flat();
const v2 = (completed, labSteps = []) => ({ version: 2, completed, labSteps });
const roadmapText = (lessons, steps = 0) => `已完成 ${lessons} / 48 课 · Lab 步骤已勾选 ${steps} / ${STEPS.length}`;
const qa = path.resolve(process.env.PROGRESS_QA_DIR ?? '.cache/qa/f1');
await mkdir(qa, { recursive: true });
const browser = await chromium.launch();
const errors = [];
const evidence = { phase: process.env.PROGRESS_PHASE ?? 'local (not integrated acceptance)', base, browser: browser.version(), checks: [], screenshots: [], errors, status: 'running' };
const capture = async (page, name) => {
  await page.screenshot({ path: path.join(qa, name) }); evidence.screenshots.push(name);
};
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
  assert.deepEqual(JSON.parse(await raw(page, BACKUP_KEY)), v2(['C01']));
  for (const route of [lesson2, lesson48]) {
    await page.goto(base + route);
    await page.getByRole('button', { name: '标记完成', exact: true }).click();
  }
  assert.deepEqual(JSON.parse(await raw(page, BACKUP_KEY)), v2(['C01', 'C02']));
  evidence.checks.push('keyboard mark, undo, refresh, previous-valid backup');
  await page.getByRole('link', { name: '查看学习路线', exact: true }).click();
  await expect(summary(page)).toHaveText(roadmapText(3));
  await expect(page.locator('[data-lesson-status]')).toHaveCount(48);
  await expect(page.locator('.lesson-completed')).toHaveCount(3);

  const other = await context.newPage(); track(other);
  await other.goto(base + lesson1);
  await other.getByRole('button', { name: '撤销完成', exact: true }).click();
  await expect(summary(page)).toHaveText(roadmapText(2));
  await expect(page.locator('[data-lesson-status="C01"]')).toHaveText(' · 未完成');
  const downloadEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: '导出进度', exact: true }).click();
  const download = await downloadEvent;
  assert.equal(download.suggestedFilename(), 'js-web-progress.json');
  assert.deepEqual(JSON.parse(await readFile(await download.path(), 'utf8')), v2(['C02', 'C48']));
  evidence.checks.push('cross-tab undo and real downloaded JSON export');

  const imported = JSON.stringify({ version: 1, completed: ['C03', 'C01', 'C03'] });
  await upload(page, imported);
  await expect(summary(page)).toHaveText(roadmapText(4));
  await expect(summary(other)).toHaveText('C01 已完成 · 已完成 4 / 48 课');
  await upload(page, imported);
  await expect(page.locator('[data-progress-message]')).toHaveText('已导入并合并进度。');
  assert.deepEqual(JSON.parse(await raw(page)), v2(['C01', 'C02', 'C03', 'C48']));
  await upload(page, JSON.stringify(v2(['C03'], ['l3-c23-2', 'l3-finish-1', 'l3-c23-2'])));
  await expect(summary(page)).toHaveText(roadmapText(4, 2));
  assert.deepEqual(JSON.parse(await raw(page)), v2(['C01', 'C02', 'C03', 'C48'], ['l3-c23-2', 'l3-finish-1']));
  evidence.checks.push('v1 file import upgrades to v2; v2 import merges and dedupes lab steps');
  const saved = await raw(page);
  const savedBackup = await raw(page, BACKUP_KEY);
  for (const content of ['{', 'null', '{"version":3,"completed":[],"labSteps":[]}', '{"version":2,"completed":[]}', '{"version":2,"completed":[],"labSteps":["l3-c99-1"]}', '{"version":1,"completed":["C49"]}', ' '.repeat(65537)]) {
    await upload(page, content);
    await expect(page.locator('[data-progress-message]')).toHaveAttribute('data-error', '');
    assert.equal(await raw(page), saved);
    assert.equal(await raw(page, BACKUP_KEY), savedBackup);
  }
  evidence.checks.push('import deduplication, merge, repeated import, invalid/oversized file preserves primary and backup bytes');

  await other.evaluate((key) => localStorage.setItem(key, '{broken'), PROGRESS_KEY);
  await expect(page.getByRole('button', { name: '从本地备份恢复', exact: true })).toBeVisible();
  assert.equal(await raw(page), '{broken');
  await capture(page, 'progress-damaged-with-backup.png');
  await page.getByRole('button', { name: '从本地备份恢复', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(summary(page)).toHaveText(roadmapText(4));
  assert.deepEqual(JSON.parse(await raw(page)), JSON.parse(savedBackup));
  assert.equal(await raw(page, DAMAGED_KEY), '{broken');
  await expect(page.getByRole('button', { name: '导入进度', exact: true })).toBeFocused();
  evidence.checks.push('cross-tab damaged record, keyboard backup restore, raw damage preserved, focus returned');
  await other.evaluate((key) => localStorage.removeItem(key), PROGRESS_KEY);
  await expect(summary(page)).toHaveText(roadmapText(0));
  await other.evaluate(() => localStorage.clear());
  await expect(summary(page)).toHaveText(roadmapText(0));
  evidence.checks.push('cross-tab remove and clear events');
  await page.evaluate(({ key, backup }) => { localStorage.setItem(key, 'bad'); localStorage.setItem(backup, 'bad backup'); }, { key: PROGRESS_KEY, backup: BACKUP_KEY });
  await page.reload();
  await expect(page.getByRole('button', { name: '从本地备份恢复', exact: true })).toBeHidden();
  await upload(page, '{"version":1,"completed":["C05"]}');
  await expect(summary(page)).toHaveText(roadmapText(1));
  assert.equal(await raw(page, DAMAGED_KEY), 'bad');
  await page.evaluate((key) => localStorage.setItem(key, 'broken again'), PROGRESS_KEY);
  await page.reload();
  page.once('dialog', (dialog) => dialog.dismiss());
  await page.getByRole('button', { name: '重新开始', exact: true }).click();
  assert.equal(await raw(page), 'broken again');
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: '重新开始', exact: true }).click();
  await expect(summary(page)).toHaveText(roadmapText(0));
  assert.equal(await raw(page, DAMAGED_KEY), 'broken again');
  evidence.checks.push('no valid backup: import recovery, canceled restart preserves raw, confirmed restart archives raw');
  await upload(page, JSON.stringify({ version: 1, completed: LESSON_IDS }));
  await expect(summary(page)).toHaveText(roadmapText(48));
  await expect(page.locator('.lesson-completed')).toHaveCount(48);
  await upload(page, '{"version":2,"completed":[],"labSteps":[]}');
  await expect(summary(page)).toHaveText(roadmapText(48));
  await expect(page.locator('[data-progress-meter]')).toHaveJSProperty('value', 48);

  const labs = await context.newPage(); track(labs);
  await page.evaluate((key) => localStorage.setItem(key, JSON.stringify({ version: 1, completed: ['C21'] })), PROGRESS_KEY);
  await labs.goto(base + lab3 + '#c23');
  const step = (target, id) => target.locator(`[data-lab-step-toggle="${id}"]`);
  await expect(step(labs, 'l3-c23-1')).not.toBeChecked();
  await expect(labs.locator('[data-lab-steps] [data-lab-progress-count]')).toHaveText(`已勾选 0 / ${LAB_STEPS.L3.length - 5} 步`);
  await step(labs, 'l3-c23-1').focus();
  await labs.keyboard.press('Space');
  await expect(step(labs, 'l3-c23-1')).toBeChecked();
  await expect(labs.locator('#step-l3-c23-1 [data-lab-message]')).toContainText('已记录你确认完成第 5 步');
  assert.deepEqual(JSON.parse(await raw(labs)), v2(['C21'], ['l3-c23-1']));
  evidence.checks.push('v1 record upgraded on first lab-step write without losing lessons');
  await expect(summary(page)).toHaveText(roadmapText(1, 1));
  await step(labs, 'l3-finish-2').check();
  await labs.reload();
  await expect(step(labs, 'l3-c23-1')).toBeChecked();
  await expect(step(labs, 'l3-finish-2')).toBeChecked();
  await expect(labs.locator('#step-l3-c23-1')).toHaveClass(/is-done/);
  await expect(labs.locator('[data-lab-progress-next]').first()).toHaveText(/^继续第 1 步/);
  const labsOther = await context.newPage(); track(labsOther);
  await labsOther.goto(base + lab3 + '#c23');
  await step(labsOther, 'l3-c23-1').uncheck();
  await expect(step(labs, 'l3-c23-1')).not.toBeChecked();
  await expect(summary(page)).toHaveText(roadmapText(1, 1));
  evidence.checks.push('lab step check/uncheck by keyboard, refresh persistence, cross-tab sync to lab page and roadmap');
  await labsOther.evaluate((key) => localStorage.setItem(key, '{broken lab'), PROGRESS_KEY);
  await expect(step(labs, 'l3-finish-2')).toBeDisabled();
  await expect(labs.locator('[data-lab-steps] [data-lab-progress-state]')).toContainText('记录损坏');
  await page.getByRole('button', { name: '从本地备份恢复', exact: true }).click();
  await expect(step(labs, 'l3-finish-2')).toBeEnabled();
  await expect(step(labs, 'l3-c23-1')).toBeChecked();
  assert.equal(await raw(page, DAMAGED_KEY), '{broken lab');
  await step(labs, 'l3-c23-1').uncheck();
  await step(labs, 'l3-finish-2').uncheck();
  await expect(summary(page)).toHaveText(roadmapText(1));
  evidence.checks.push('damaged primary disables lab checkboxes; backup restore brings back previous lab steps');
  await labs.close(); await labsOther.close();
  await page.evaluate(({ key, ids }) => localStorage.setItem(key, JSON.stringify({ version: 1, completed: ids })), { key: PROGRESS_KEY, ids: LESSON_IDS });
  await page.reload();
  await expect(summary(page)).toHaveText(roadmapText(48));

  for (const route of ['roadmap/', lesson48]) {
    await page.goto(base + route);
    for (const width of [360, 768, 1280]) for (const theme of ['light', 'dark']) {
      await page.setViewportSize({ width, height: 950 });
      await page.locator('starlight-theme-select select').first().selectOption(theme, { force: true });
      await page.locator('[data-progress]').scrollIntoViewIfNeeded();
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      await capture(page, `progress-${route === 'roadmap/' ? 'roadmap' : 'lesson'}-${width}-${theme}.png`);
    }
  }
  evidence.checks.push('48/48 states and meter, empty import does not erase progress, 12 width/theme captures');
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
  await capture(denied, 'progress-storage-denied.png');
  evidence.checks.push('storage getter denied: disabled controls, readable lesson, light/dark theme usable');
  const quota = await browser.newContext();
  const good = JSON.stringify({ version: 1, completed: ['C01'] });
  await quota.addInitScript(({ key, good }) => {
    const original = Storage.prototype.setItem;
    original.call(localStorage, key, good);
    Storage.prototype.setItem = function (name, value) {
      if (name === key) throw new DOMException('full', 'QuotaExceededError');
      return original.call(this, name, value);
    };
  }, { key: PROGRESS_KEY, good });
  const full = await quota.newPage(); track(full);
  await full.goto(base + lesson1);
  await full.getByRole('button', { name: '撤销完成', exact: true }).click();
  await expect(summary(full)).toHaveText('C01 已完成 · 已完成 1 / 48 课');
  await expect(full.locator('[data-progress-message]')).toContainText('保存失败');
  assert.equal(await raw(full), good);
  await capture(full, 'progress-primary-quota.png');
  evidence.checks.push('primary quota failure preserves previous progress and does not claim success');

  for (const scenario of [
    { name: 'backup', key: BACKUP_KEY, primary: good, backup: JSON.stringify({ version: 1, completed: ['C02'] }) },
    { name: 'damaged-archive', key: DAMAGED_KEY, primary: '{broken', backup: good },
  ]) {
    const failed = await browser.newContext();
    await failed.addInitScript(({ primaryKey, backupKey, scenario }) => {
      const original = Storage.prototype.setItem;
      original.call(localStorage, primaryKey, scenario.primary);
      original.call(localStorage, backupKey, scenario.backup);
      Storage.prototype.setItem = function (name, value) {
        if (name === scenario.key) throw new DOMException('full', 'QuotaExceededError');
        return original.call(this, name, value);
      };
    }, { primaryKey: PROGRESS_KEY, backupKey: BACKUP_KEY, scenario });
    const failedPage = await failed.newPage(); track(failedPage);
    await failedPage.goto(base + lesson1);
    await failedPage.getByRole('button', { name: scenario.name === 'backup' ? '撤销完成' : '从本地备份恢复', exact: true }).click();
    await expect(failedPage.locator('[data-progress-message]')).toContainText('保存失败');
    assert.equal(await raw(failedPage), scenario.primary);
    assert.equal(await raw(failedPage, BACKUP_KEY), scenario.backup);
    await capture(failedPage, `progress-${scenario.name}-quota.png`);
    evidence.checks.push(`${scenario.name} quota failure preserves primary and backup bytes`);
    await failed.close();
  }

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
  evidence.checks.push('no JavaScript: lesson 1/48 and roadmap readable, controls hidden, native details expand');
  assert.deepEqual(errors, []);
  evidence.status = 'passed';
  console.log(`F1 浏览器自动回归通过（${evidence.phase}，Chromium ${browser.version()}）：标记/撤销/刷新/48 课状态、v1→v2 升级与 v1/v2 导入、Lab 步骤勾选/取消/刷新/跨标签/损坏恢复、跨标签同步/移除/清空、导出/合并/拒绝坏文件、备份/损坏恢复/重开、权限/主记录/备份/损坏留档写满、12 组宽度主题、禁用 JS 阅读。证据：${qa}。待主 agent 在最终集成版本验收。`);
} catch (error) {
  evidence.status = 'failed'; evidence.failure = error.stack; throw error;
} finally {
  await writeFile(path.join(qa, 'results.json'), JSON.stringify(evidence, null, 2) + '\n');
  await browser.close();
}
