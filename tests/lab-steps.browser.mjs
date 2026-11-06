// Lab 步骤页与课页往返：先读 → 返回浮标 → 回到步骤；LabBar/LabNext 链接、LessonTask 抽查、无 JS 阅读与 360/1280 × 亮暗截图。
import { chromium, expect } from '../labs/inventory/node_modules/@playwright/test/index.mjs';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const base = process.env.PROGRESS_BASE_URL ?? 'http://127.0.0.1:8751/js_web/';
const qa = path.resolve(process.env.LAB_QA_DIR ?? process.env.PROGRESS_QA_DIR ?? '.cache/qa/lab-steps');
await mkdir(qa, { recursive: true });
const lab3 = 'labs/l3/';
const c23 = '05-react/c23-state-snapshot-queue/';
const c36 = '05-react/c36-react-project-debugging/';
const spot = {
  C03: '02-language-data/c03-values-types/',
  C15: '03-async-modules/c15-css-layout-responsive/',
  C23: c23,
  C40: '06-components-ui5/c40-openui5-mvc-project/',
  C46: '07-project/c46-static-build-pages/',
};
const browser = await chromium.launch();
const errors = [];
const evidence = { base, browser: browser.version(), checks: [], screenshots: [], errors, status: 'running' };
const track = (page) => {
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('response', (response) => {
    if (response.status() >= 400 && !response.url().includes('/demos/')) errors.push(`${response.status()} ${response.url()}`);
  });
};
const capture = async (page, name, options = {}) => {
  await page.screenshot({ path: path.join(qa, name), ...options }); evidence.screenshots.push(name);
};
const theme = (page, value) => page.locator('starlight-theme-select select').first().selectOption(value, { force: true });
const noOverflow = async (page) => assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `横向溢出：${page.url()}`);

try {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage(); track(page);
  assert.equal((await page.goto(base + lab3)).status(), 200);
  await expect(page.locator('[data-lab-goal="L3"]')).toBeVisible();
  await expect(page.locator('[data-lab-goal] a', { hasText: '打开在线目标演示' })).toHaveAttribute('href', '/js_web/demos/l3/');
  await expect(page.locator('li.step')).toHaveCount(35);
  await expect(page.locator('[data-lab-finish] li')).toHaveCount(5);
  for (const id of ['本-lab-的任务与规则', '从哪里开始', '在同一个应用里推进', '收尾一次可观察的业务交付', '暂停与继续', 'l3']) {
    await expect(page.locator(`[id="${id}"]`)).toHaveCount(1);
  }
  await expect(page.locator('main details:has(> summary:text("起点、补课与从旧发行版升级"))')).not.toHaveAttribute('open', '');
  evidence.checks.push('L3 page: goal card + demo link, 35 steps, 5 finish items, preserved anchors, start/pause folded');

  const target = page.locator('#step-l3-c23-1');
  const read = target.locator('.read a').first();
  await expect(read).toHaveAttribute('href', '/js_web/05-react/c23-state-snapshot-queue/?from=l3-c23-1#1-用-state-记住界面需要的值');
  await expect(read).toHaveText('C23 1. 用 state 记住界面需要的值');
  await target.scrollIntoViewIfNeeded();
  await capture(page, 'l3-step5-1280-dark.png');
  await read.click();
  await page.waitForURL(/c23-state-snapshot-queue\/\?from=l3-c23-1#/);
  const floater = page.locator('[data-lab-return]');
  await expect(floater).toBeVisible();
  await expect(floater.locator('[data-lab-return-text]')).toHaveText('返回 L3 第 5 步');
  await expect(floater.locator('[data-lab-return-title]')).toHaveText('P001 连续补三件：12 → 15');
  const heading = await page.locator('h2[id="1-用-state-记住界面需要的值"]').boundingBox();
  const box = await floater.boundingBox();
  assert(heading && box && (box.y >= heading.y + heading.height || box.y + box.height <= heading.y), '浮标遮住了跳转目标标题');
  await capture(page, 'c23-return-floater-1280-dark.png');
  await page.locator('[data-lab-bar] a').focus();
  await page.keyboard.press('Tab');
  await expect(floater.locator('[data-lab-return-link]')).toBeFocused();
  await page.keyboard.press('Enter');
  await page.waitForURL(/labs\/l3\/#step-l3-c23-1$/);
  await expect(page.locator('#step-l3-c23-1')).toBeInViewport();
  assert.equal(await page.evaluate(() => document.querySelector(':target')?.id), 'step-l3-c23-1');
  evidence.checks.push('read link carries ?from, floater shows step 5, keyboard reaches it after LabBar, returns to :target step');

  await page.goto(base + c23 + '?from=l3-c23-2#4-延迟补货要基于执行时的待更新值');
  await expect(floater.locator('[data-lab-return-text]')).toHaveText('返回 L3 第 6 步');
  await floater.getByRole('button', { name: '关闭返回提示' }).click();
  await expect(floater).toBeHidden();
  assert.equal(new URL(page.url()).search, '');
  await expect(page.locator('[data-lab-bar] a')).toBeFocused();
  await page.goto(base + c23 + '?from=l3-c23-1');
  await floater.locator('[data-lab-return-link]').focus();
  await page.keyboard.press('Escape');
  await expect(floater).toBeHidden();
  await page.goto(base + c23 + '?from=l3-c99-9');
  await expect(floater).toBeHidden();
  await page.goto(base + '02-language-data/c06-functions-closures/?from=l3-c23-1#4-闭包函数返回以后绑定仍然可用');
  await expect(page.locator('[data-lab-return] [data-lab-return-text]')).toHaveText('返回 L3 第 5 步');
  await expect(page.locator('[data-lab-bar] a')).toHaveAttribute('href', '/js_web/labs/l1/');
  evidence.checks.push('close button and Escape hide floater, drop ?from and return focus; unknown from ignored; backlink lesson in another Lab shows floater');

  await page.goto(base + c23);
  await expect(page.locator('[data-lab-bar] a')).toHaveText(/L3\s*第 5–6 步 \/ 共 35 步\s*返回 Lab/);
  await expect(page.locator('[data-lab-bar] a')).toHaveAttribute('href', '/js_web/labs/l3/#step-l3-c23-1');
  await expect(page.locator('[data-lab-next] .go')).toHaveAttribute('href', '/js_web/labs/l3/#step-l3-c24-1');
  await expect(page.locator('[data-lab-next] .go-title')).toHaveText('第 7 步 · C24 商品集合提升到 App');
  await expect(page.locator('[data-progress]')).toHaveCount(1);
  await page.goto(base + c36);
  await expect(page.locator('[data-lab-next] .go')).toHaveAttribute('href', '/js_web/labs/l3/#l3-finish');
  await page.goto(base + spot.C03);
  await expect(page.locator('[data-lab-next] .go')).toHaveAttribute('href', '/js_web/labs/l1/');
  evidence.checks.push('LabBar range + first-step link, LabNext next step / finish list / static Lab link, one progress panel');

  for (const [id, route] of Object.entries(spot)) {
    await page.goto(base + route);
    const task = page.locator(`[data-lesson-task="${id}"]`);
    await expect(task).toBeVisible();
    await expect(task.locator('.files li').first()).toBeVisible();
    await expect(task.locator('.accept li').first()).toBeVisible();
    await expect(task.locator('.expressive-code')).toBeVisible();
    await expect(task.locator('a[href="/js_web/labs/rules/"]')).toBeVisible();
    for (const fold of await task.locator('details').all()) await expect(fold).not.toHaveAttribute('open', '');
    await expect(task.locator('details a[href$=".tar.gz"]')).toHaveCount(2);
    for (const width of [360, 1280]) {
      await page.setViewportSize({ width, height: 900 });
      await task.scrollIntoViewIfNeeded();
      await noOverflow(page);
      await capture(page, `lesson-task-${id.toLowerCase()}-${width}.png`);
    }
    await page.setViewportSize({ width: 1280, height: 900 });
  }
  evidence.checks.push('LessonTask spot check C03/C15/C23/C40/C46: files, command, acceptance visible; start/answer folded; 360/1280 without overflow');

  for (const width of [360, 1280]) for (const value of ['light', 'dark']) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(base + lab3);
    await theme(page, value);
    await noOverflow(page);
    await capture(page, `l3-goal-${width}-${value}.png`);
    await page.locator('#step-l3-c23-1').scrollIntoViewIfNeeded();
    await capture(page, `l3-step5-${width}-${value}.png`);
    await page.locator('#l3-finish').scrollIntoViewIfNeeded();
    await capture(page, `l3-finish-${width}-${value}.png`);
    await page.goto(base + c23 + '?from=l3-c23-1#1-用-state-记住界面需要的值');
    await noOverflow(page);
    const box = await page.locator('[data-lab-return]').boundingBox();
    assert(box && box.x >= 0 && box.x + box.width <= width, '浮标超出视口');
    await capture(page, `c23-floater-${width}-${value}.png`);
    await page.locator('[data-lab-next]').scrollIntoViewIfNeeded();
    await capture(page, `c23-labnext-${width}-${value}.png`);
  }
  evidence.checks.push('360/1280 × light/dark: L3 goal, step 5, finish list, C23 floater and LabNext without horizontal overflow');

  const nojs = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 360, height: 900 } });
  const raw = await nojs.newPage(); track(raw);
  assert.equal((await raw.goto(base + lab3)).status(), 200);
  await expect(raw.locator('li.step h3')).toHaveCount(35);
  await expect(raw.locator('#step-l3-c23-1 .read a').first()).toBeVisible();
  await expect(raw.locator('[data-lab-step-toggle]').first()).toBeHidden();
  await expect(raw.locator('[data-lab-finish] li label').first()).toBeVisible();
  await expect(raw.locator('[data-lab-progress-ring]')).toBeHidden();
  await capture(raw, 'nojs-l3-360.png');
  await raw.goto(base + c23 + '?from=l3-c23-1');
  await expect(raw.locator('[data-lab-bar] a')).toBeVisible();
  await expect(raw.locator('[data-lab-return]')).toBeHidden();
  await expect(raw.locator('[data-lesson-task="C23"] .files')).toBeVisible();
  await expect(raw.locator('[data-lab-next] .go')).toBeVisible();
  await capture(raw, 'nojs-c23-360.png');
  evidence.checks.push('no JavaScript: L3 steps readable, checkboxes and ring hidden; lesson LabBar/LessonTask/LabNext readable, floater hidden');

  assert.deepEqual(errors, []);
  evidence.status = 'passed';
  console.log(`Lab 步骤浏览器检查通过（Chromium ${browser.version()}）：${evidence.checks.length} 组检查、${evidence.screenshots.length} 张截图。证据：${qa}`);
} catch (error) {
  evidence.status = 'failed'; evidence.failure = error.stack; throw error;
} finally {
  await writeFile(path.join(qa, 'lab-steps-results.json'), JSON.stringify(evidence, null, 2) + '\n');
  await browser.close();
}
