// L6 三关的真实浏览器流程：判分、错题、Bug 键盘操作、自评、刷新/跨标签与无 JS 阅读。
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium, expect } from '../labs/inventory/node_modules/@playwright/test/index.mjs';
import { QUESTIONS } from '../labs/capstone/quiz.mjs';
import { BUGS } from '../labs/capstone/bugs.mjs';

const base = process.env.CAPSTONE_BASE_URL ?? 'http://127.0.0.1:8874/js_web/';
const qa = path.resolve(process.env.CAPSTONE_QA_DIR ?? '.cache/qa/capstone');
await mkdir(qa, { recursive: true });
const browser = await chromium.launch();
const evidence = { base, browser: browser.version(), checks: [], errors: [], status: 'running' };
try {
  const context = await browser.newContext({ viewport: { width: 1280, height: 950 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  page.on('pageerror', (error) => evidence.errors.push(error.message));
  assert.equal((await page.goto(base + 'labs/l6/')).status(), 200);
  const f1 = await page.evaluate(() => localStorage.getItem('js_web:progress:v1'));
  const question = (id) => page.locator(`[data-qid="${id}"]`);
  const first = QUESTIONS[0];
  const wrong = first.options.findIndex((_, index) => !first.answer.includes(index));
  const option = question(first.id).locator(`[data-option="${wrong}"]`);
  await option.focus();
  await page.keyboard.press('Enter');
  await expect(question(first.id).locator('[data-feedback]')).toContainText('答错了');
  await expect(page.locator('[data-wrong] > li')).toHaveCount(1);
  await page.locator('[data-redo-wrong]').click();
  await expect(question(first.id).locator('[data-feedback]')).toBeHidden();
  await expect(question(first.id).locator('[data-option="0"]')).toBeFocused();
  for (const item of QUESTIONS) {
    const card = question(item.id);
    for (const answer of item.answer) await card.locator(`[data-option="${answer}"]`).click();
    if (item.type === 'multi') await card.locator('[data-submit]').click();
    await expect(card.locator('[data-feedback]')).toContainText('回答正确');
  }
  await expect(page.locator('[data-score-total]')).toHaveText(`${QUESTIONS.length} / ${QUESTIONS.length}`);
  await expect(page.locator('[data-score-note]')).toContainText('正确率 100%');
  await expect(page.locator('[data-area-row]')).toHaveCount(6);
  evidence.checks.push('44 questions: single/multi/predict, keyboard wrong answer, redo, full score and six areas');

  const bug = page.locator(`[data-bug="${BUGS[0].id}"]`);
  await bug.locator('[data-line="1"]').focus();
  for (let line = 1; line < BUGS[0].lines[0]; line++) await page.keyboard.press('ArrowDown');
  await expect(bug.locator(`[data-line="${BUGS[0].lines[0]}"]`)).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(bug.locator('[data-bug-state]')).toHaveText('独立找到');
  const hinted = page.locator(`[data-bug="${BUGS[1].id}"]`);
  await hinted.locator('[data-hint-button]').click();
  await hinted.locator(`[data-line="${BUGS[1].lines[0]}"]`).click();
  await expect(hinted.locator('[data-bug-state]')).toHaveText('找到');
  const revealed = page.locator(`[data-bug="${BUGS[2].id}"]`);
  await revealed.locator('[data-explain] > summary').click();
  await expect(revealed.locator('[data-bug-state]')).toHaveText('看了答案');
  await expect(page.locator('[data-found]')).toHaveText('2');
  await expect(page.locator('[data-bug-note]')).toContainText('独立找到 1 个');
  evidence.checks.push('Bug keyboard line navigation, independent/hinted/revealed results remain distinct');

  const check = page.locator('[data-check]').first();
  const checkId = await check.getAttribute('data-check');
  await check.check();
  const rubric = page.locator('[data-rubric][value="2"]').first();
  const area = await rubric.getAttribute('data-rubric');
  await rubric.check();
  await expect(page.locator(`[data-weak] > [data-area="${area}"] [data-weak-status]`)).toHaveText('建议回看');
  await page.reload();
  await expect(page.locator('[data-score-total]')).toHaveText(`${QUESTIONS.length} / ${QUESTIONS.length}`);
  await expect(page.locator(`[data-check="${checkId}"]`)).toBeChecked();
  await expect(page.locator(`[data-rubric="${area}"][value="2"]`)).toBeChecked();
  const tab = await context.newPage();
  await tab.goto(base + 'labs/l6/');
  await tab.locator(`[data-check="${checkId}"]`).uncheck();
  await expect(page.locator(`[data-check="${checkId}"]`)).not.toBeChecked();
  await page.locator('[data-cap-summary]').screenshot({ path: path.join(qa, 'graduation-report.png') });
  evidence.checks.push('project/rubric summary, weak-area recommendation, refresh retention and cross-tab update');

  const reset = page.locator('[data-reset-all]');
  await reset.click();
  await expect(reset).toContainText('再点一次');
  await reset.click();
  await expect(page.locator('[data-answered]')).toHaveText('0');
  await expect(page.locator('[data-found]')).toHaveText('0');
  await expect(tab.locator('[data-answered]')).toHaveText('0');
  assert.equal(await page.evaluate(() => localStorage.getItem('js_web:progress:v1')), f1);
  evidence.checks.push('confirmed reset clears only L6 and synchronizes the other tab');

  const nojs = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 360, height: 950 } });
  const plain = await nojs.newPage();
  await plain.goto(base + 'labs/l6/');
  await expect(plain.locator('[data-qid]')).toHaveCount(QUESTIONS.length);
  await expect(plain.locator('[data-bug]')).toHaveCount(BUGS.length);
  const answer = plain.locator('[data-qid] [data-explain]').first();
  await answer.locator('summary').click();
  await expect(answer).toHaveAttribute('open', '');
  await expect(answer.locator('.cap-answer-line')).toBeVisible();
  assert(await plain.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  evidence.checks.push('no JavaScript: all questions and bugs readable, native answers open, 360px without overflow');
  await nojs.close();
  await context.close();
  assert.deepEqual(evidence.errors, []);
  evidence.status = 'passed';
  console.log(`L6 浏览器验收通过：${evidence.checks.length} 组；证据 ${qa}`);
} catch (error) {
  evidence.status = 'failed'; evidence.failure = error.stack;
  throw error;
} finally {
  await writeFile(path.join(qa, 'results.json'), JSON.stringify(evidence, null, 2) + '\n');
  await browser.close();
}
