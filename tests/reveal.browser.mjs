// 交互揭晓的浏览器验收：48 课的先猜遮罩只落在构建标记处、揭晓后与原文一致、复制内容不变、禁用 JS 时原文完整，
// 以及键盘完成猜测/揭晓/重置、练习三步与自评存储。需要先启动 astro dev 或 preview（REVEAL_BASE_URL）。
import { chromium, expect } from '../labs/inventory/node_modules/@playwright/test/index.mjs';
import assert from 'node:assert/strict';
import { globSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const base = process.env.REVEAL_BASE_URL ?? 'http://127.0.0.1:4413/js_web/';
const qa = path.resolve(process.env.REVEAL_QA_DIR ?? '.cache/qa/reveal');
const docs = fileURLToPath(new URL('../src/content/docs/', import.meta.url));
const routes = globSync('**/c[0-9][0-9]-*.mdx', { cwd: docs }).sort().map((file) => file.replace(/\.mdx$/, '/'));
const PRACTICE_KEY = 'js-web-practice-v1';
const F1_KEY = 'js_web:progress:v1';
// 脚本插入的界面；去掉它们以后，揭晓后的正文应与禁用 JS 时逐字相同。
const INSERTED = '.reveal-bar, .reveal-chip, .practice-head, [data-step-kind="try"], .practice-assess, .predict-judge, .predict-choice-tag';
// 揭晓前允许被脚本隐藏的元素。
const MASKED = '.reveal-value, [data-reveal-explain], .reveal-inline, .reveal-result, .practice-badge, .reveal-again, .practice-message';
// 效果图切换与可运行片段组件自带的隐藏节点。
const OTHER_HIDDEN = 'img, [data-shot-switch], [data-run-editor], [data-run-result], [data-run-actions], figure[data-diagram] *';
const REVEAL_PARTS = '[data-reveal-q], [data-reveal-code], [data-reveal-explain], [data-predict], details[data-disclosure]';

await mkdir(qa, { recursive: true });
const browser = await chromium.launch();
const errors = [];
const evidence = { base, browser: browser.version(), lessons: [], checks: [], status: 'running' };
const track = (page) => page.on('pageerror', (error) => errors.push(`${page.url()} ${error.message}`));

function firstDifference(actual, expected) {
  let index = 0;
  while (index < actual.length && actual[index] === expected[index]) index += 1;
  return `第 ${index} 字附近，揭晓后「${actual.slice(Math.max(0, index - 40), index + 60)}」，原文「${expected.slice(Math.max(0, index - 40), index + 60)}」`;
}

const snapshot = (page) => page.evaluate((inserted) => {
  const content = document.querySelector('.sl-markdown-content');
  const clone = content.cloneNode(true);
  for (const node of clone.querySelectorAll(`${inserted}, noscript, figure[data-diagram]`)) node.remove();
  return {
    text: clone.textContent.replace(/\s+/g, ''),
    copies: [...content.querySelectorAll('.expressive-code .copy button')].map((button) => button.dataset.code),
  };
}, INSERTED);

try {
  const plainContext = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1280, height: 900 } });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' });
  for (const route of routes) {
    const plain = await plainContext.newPage();
    assert.equal((await plain.goto(base + route)).status(), 200, route);
    const original = await snapshot(plain);
    const noJs = await plain.evaluate((parts) => ({
      bars: document.querySelectorAll('.reveal-bar, .practice, .reveal-chip').length,
      hiddenParts: [...document.querySelectorAll(parts)].filter((node) => node.closest('[hidden]') || node.querySelector('[hidden]')).length,
    }), REVEAL_PARTS);
    assert.equal(noJs.bars, 0, `${route} 无 JS 时不应有交互界面`);
    assert.equal(noJs.hiddenParts, 0, `${route} 无 JS 时先猜与练习内容不应隐藏`);
    await plain.close();

    const page = await context.newPage(); track(page);
    await page.goto(base + route);
    const masked = await page.evaluate(({ allowed, other }) => {
      const content = document.querySelector('.sl-markdown-content');
      const questions = [...content.querySelectorAll('[data-reveal-q]')];
      const stray = [...content.querySelectorAll('[hidden]')].filter((node) => !node.matches(allowed) && !node.matches(other)).map((node) => node.outerHTML.slice(0, 120));
      const values = [...content.querySelectorAll('.reveal-value')];
      return {
        questions: questions.length,
        ready: questions.filter((node) => node.hasAttribute('data-reveal-ready')).length,
        bars: content.querySelectorAll('.reveal-bar').length,
        chips: content.querySelectorAll('.reveal-chip').length,
        outputs: values.map((node) => node.textContent),
        outputsOutsideCode: values.filter((node) => !node.closest('[data-reveal-code]')).length,
        unmaskedValues: values.filter((node) => !node.hidden).length,
        explains: content.querySelectorAll('[data-reveal-explain]').length,
        explainsHidden: content.querySelectorAll('[data-reveal-explain][hidden]').length,
        inline: [...content.querySelectorAll('.reveal-inline')].map((node) => ({ text: node.textContent, inQuestion: Boolean(node.closest('[data-reveal-q]')), hidden: node.hidden })),
        predicts: content.querySelectorAll('[data-predict]').length,
        predictsReady: content.querySelectorAll('[data-predict][data-reveal-ready]').length,
        practices: [...content.querySelectorAll('.practice')].map((node) => ({ id: node.dataset.practice, steps: node.querySelectorAll('.practice-step').length })),
        disclosures: [...content.querySelectorAll('details[data-disclosure]:not(.lab-fold)')].filter((node) => !node.closest('.lab-ui')).length,
        labFoldsUntouched: [...content.querySelectorAll('details.lab-fold')].every((node) => !node.closest('.practice')),
        stray,
      };
    }, { allowed: MASKED, other: OTHER_HIDDEN });
    assert.equal(masked.ready, masked.questions, `${route} 每处先猜都应增强`);
    assert.equal(masked.bars, masked.ready + masked.predicts, `${route} 操作栏数量`);
    assert.equal(masked.outputsOutsideCode, 0, `${route} 遮罩只能在先猜代码块里`);
    assert.equal(masked.unmaskedValues, 0, `${route} 揭晓前输出应遮住`);
    assert.equal(masked.chips, masked.outputs.length + masked.inline.length, `${route} 每个遮罩一个占位块`);
    assert.equal(masked.explainsHidden, masked.explains, `${route} 解释段揭晓前收起`);
    assert(masked.inline.every((item) => item.inQuestion && item.hidden), `${route} 段内答案只在问题段内`);
    assert.equal(masked.predictsReady, masked.predicts, `${route} Predict 组件应增强`);
    assert.deepEqual(masked.stray, [], `${route} 不应隐藏其他内容`);
    assert(masked.practices.length >= 1 && masked.practices.every((item) => /^C\d{2}-\d+$/.test(item.id)), `${route} 练习答题区与编号`);
    assert(masked.labFoldsUntouched, `${route} Lab 组件的折叠块不包进练习答题区`);
    assert.equal(masked.practices.reduce((sum, item) => sum + item.steps - 1, 0), masked.disclosures, `${route} 每个提示/答案各占一步`);

    await page.evaluate(() => {
      for (const form of document.querySelectorAll('.reveal-bar form')) form.requestSubmit();
      for (const details of document.querySelectorAll('.practice details')) details.querySelector('summary').click();
    });
    const revealed = await page.evaluate(() => ({
      chips: document.querySelectorAll('.reveal-chip').length,
      hidden: document.querySelectorAll('.sl-markdown-content :is(.reveal-value, [data-reveal-explain], .reveal-inline)[hidden]').length,
      shown: document.querySelectorAll('.reveal-bar[data-state="shown"]').length,
      predictOpen: document.querySelectorAll('[data-predict] details.predict-answer[open]').length,
      assess: document.querySelectorAll('.practice-assess').length,
    }));
    assert.equal(revealed.chips, 0, `${route} 揭晓后不留占位`);
    assert.equal(revealed.hidden, 0, `${route} 揭晓后全部显示`);
    assert.equal(revealed.shown, masked.bars, `${route} 全部操作栏进入揭晓状态`);
    assert.equal(revealed.predictOpen, masked.predicts, `${route} Predict 答案展开`);
    assert.equal(revealed.assess, masked.practices.length, `${route} 每个答题区有自评`);
    const after = await snapshot(page);
    assert(after.text === original.text, `${route} 揭晓后正文应与原文一致：${firstDifference(after.text, original.text)}`);
    assert.deepEqual(after.copies, original.copies, `${route} 复制按钮内容不变`);

    await page.evaluate(() => { for (const form of document.querySelectorAll('.reveal-bar form')) form.requestSubmit(); });
    const reset = await page.evaluate(() => ({
      chips: document.querySelectorAll('.reveal-chip').length,
      hidden: document.querySelectorAll('[data-reveal-explain][hidden]').length,
      predictOpen: document.querySelectorAll('[data-predict] details.predict-answer[open]').length,
    }));
    assert.equal(reset.chips, masked.chips, `${route} 再猜一次应重新遮住`);
    assert.equal(reset.hidden, masked.explainsHidden, `${route} 再猜一次收起解释`);
    assert.equal(reset.predictOpen, 0, `${route} 再猜一次收起 Predict 答案`);
    evidence.lessons.push({ route, ...masked, stray: undefined });
    await page.close();
  }
  evidence.checks.push(`${routes.length} lessons: masks only at build marks, reveal equals no-JS text, copy unchanged, reset re-masks`);

  // 键盘：猜测 → Enter 揭晓 → 焦点落在按钮 → Space 再猜一次 → 焦点回到输入框
  const keys = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await keys.newPage(); track(page);
  await page.goto(base + '02-language-data/c06-functions-closures/');
  const bar = page.locator('.reveal-bar').nth(1);
  const input = bar.getByRole('textbox', { name: /你的猜测/ });
  const toggle = bar.getByRole('button', { name: '揭晓输出' });
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  const controlled = (await toggle.getAttribute('aria-controls')).split(' ');
  assert(controlled.length >= 2, '揭晓按钮关联代码块与解释段');
  await input.focus(); await page.keyboard.type('外设'); await page.keyboard.press('Enter');
  await expect(bar).toHaveAttribute('data-state', 'shown');
  await expect(bar.getByRole('button', { name: '再猜一次' })).toBeFocused();
  await expect(bar.getByRole('button', { name: '再猜一次' })).toHaveAttribute('aria-expanded', 'true');
  await expect(bar.locator('.reveal-verdict')).toHaveText('和实际输出一致');
  await expect(page.locator('[data-reveal-explain="2"]')).toBeVisible();
  await page.screenshot({ path: path.join(qa, 'keyboard-reveal.png') });
  await page.keyboard.press('Space');
  await expect(bar).toHaveAttribute('data-state', 'hidden');
  await expect(input).toBeFocused();
  await expect(page.locator('[data-reveal-explain="2"]')).toBeHidden();
  await page.keyboard.press('Tab');
  await expect(toggle).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(bar.locator('.reveal-done')).toBeVisible();
  evidence.checks.push('keyboard guess/reveal/reset with focus management and aria-expanded');

  // 练习：Enter 打开提示、Space 打开参考答案、Enter 自评；只写 js-web-practice-v1，不碰 F1 进度
  const practice = page.locator('.practice');
  await expect(practice).toHaveAttribute('data-step', 'try');
  const hint = practice.locator('summary').filter({ hasText: /^提示$/ });
  await hint.focus(); await page.keyboard.press('Enter');
  await expect(hint.locator('..')).toHaveAttribute('open', '');
  await expect(practice).toHaveAttribute('data-step', 'hint');
  const answer = practice.locator('summary').filter({ hasText: /^参考答案$/ });
  await page.keyboard.press('Tab');
  while (!(await answer.evaluate((node) => node === document.activeElement))) await page.keyboard.press('Tab');
  await page.keyboard.press('Space');
  await expect(answer.locator('..')).toHaveAttribute('open', '');
  await expect(practice).toHaveAttribute('data-step', 'answer');
  const ok = practice.getByRole('button', { name: '我做对了' });
  await ok.focus(); await page.keyboard.press('Enter');
  await expect(ok).toHaveAttribute('aria-pressed', 'true');
  await expect(practice.locator('.practice-badge')).toContainText('我做对了');
  assert.deepEqual(JSON.parse(await page.evaluate((key) => localStorage.getItem(key), PRACTICE_KEY)), { 'C06-1': 'ok' });
  assert.equal(await page.evaluate((key) => localStorage.getItem(key), F1_KEY), null, '自评不写 F1 进度');
  await page.screenshot({ path: path.join(qa, 'keyboard-practice.png'), fullPage: false });
  await page.reload();
  await expect(page.locator('.practice .practice-badge')).toContainText('我做对了');
  await page.locator('.practice summary').filter({ hasText: /^参考答案$/ }).click();
  await expect(page.locator('.practice').getByRole('button', { name: '还需要再练' })).toHaveAttribute('aria-pressed', 'false');
  await page.locator('.practice').getByRole('button', { name: '还需要再练' }).click();
  assert.deepEqual(JSON.parse(await page.evaluate((key) => localStorage.getItem(key), PRACTICE_KEY)), { 'C06-1': 'retry' });
  await page.locator('.practice').getByRole('button', { name: '还需要再练' }).click();
  assert.deepEqual(JSON.parse(await page.evaluate((key) => localStorage.getItem(key), PRACTICE_KEY)), {});
  evidence.checks.push('practice keyboard steps, self-assessment stored under js-web-practice-v1 only, restored after reload');

  // Predict 组件：键盘写猜测并揭晓，答案 details 展开；再猜一次收起
  await page.goto(base + '02-language-data/c03-values-types/');
  const predict = page.locator('[data-predict]').first();
  await expect(predict.locator('details.predict-answer > summary')).toBeHidden();
  await predict.getByRole('textbox', { name: /你的猜测/ }).focus();
  await page.keyboard.type('2.5'); await page.keyboard.press('Enter');
  await expect(predict.locator('details.predict-answer')).toHaveAttribute('open', '');
  await expect(predict.locator('.predict-answer-body')).toBeVisible();
  await page.keyboard.press('Enter');
  await expect(predict.locator('details.predict-answer')).not.toHaveAttribute('open', '');
  evidence.checks.push('Predict component keyboard reveal/reset');
  await keys.close();

  assert.deepEqual(errors, []);
  evidence.status = 'passed';
  const totals = evidence.lessons.reduce((sum, item) => ({
    questions: sum.questions + item.questions, outputs: sum.outputs + item.outputs.length, explains: sum.explains + item.explains,
    inline: sum.inline + item.inline.length, predicts: sum.predicts + item.predicts, practices: sum.practices + item.practices.length,
  }), { questions: 0, outputs: 0, explains: 0, inline: 0, predicts: 0, practices: 0 });
  evidence.totals = totals;
  console.log(`交互揭晓浏览器验收通过（Chromium ${evidence.browser}）：${routes.length} 课，旧式先猜 ${totals.questions} 处（遮输出 ${totals.outputs} 个、解释段 ${totals.explains} 段、段内答案 ${totals.inline} 处），Predict ${totals.predicts} 个，练习答题区 ${totals.practices} 个；键盘与存储 ${evidence.checks.length - 1} 项。记录：${qa}`);
} catch (error) {
  evidence.status = 'failed'; evidence.failure = error.stack;
  throw error;
} finally {
  await writeFile(path.join(qa, 'results.json'), JSON.stringify(evidence, null, 2) + '\n');
  await browser.close();
}
