import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { READABILITY, V3_ERROR_RULES, lintLesson, readabilityIssues, sentenceCount } from '../scripts/lint-lessons.mjs';

const LESSON = 'lesson:\n  time: 1\n  prereq: 1\n  env: 1\n  verified: all\n';
const INTRO = '一句场景。\n\n<Effect kind="page" preview="c15/layout" />\n\n学完你能：\n\n- 一\n- 二\n- 三\n\n**Java 对照：** 一句。';
const lesson = (body, intro = INTRO) => `---\ntitle: T\n${LESSON}---\n\n## 这一课解决什么问题\n\n${intro}\n\n${body}\n`;
const has = (issues, text) => issues.some((issue) => issue.message.includes(text));
const level = (issues, rule) => issues.find((issue) => issue.rule === rule)?.level;
const lint = (text) => lintLesson('99-test/c99-fixture.mdx', { text });

test('句数按「。！？」计，句末引号不多算一句', () => {
  assert.equal(sentenceCount('一。二？三！'), 3);
  assert.equal(sentenceCount('只有一句没有句号'), 1);
  assert.equal(sentenceCount('他说「好。」'), 1);
});

test('段落按字数、句数、行内代码和分号报 warning', () => {
  const long = '字'.repeat(READABILITY.paragraphChars + 1) + '。';
  assert.equal(level(readabilityIssues(lesson(`## 1. 概念\n\n${long}`)), 'paragraph-long'), 'warning');
  assert.ok(has(readabilityIssues(lesson('## 1. 概念\n\n一。二。三。四。')), '4 句'));
  assert.equal(level(readabilityIssues(lesson('## 1. 概念\n\n`a` `b` `c` `d`。')), 'inline-code'), 'warning');
  assert.equal(level(readabilityIssues(lesson('## 1. 概念\n\n甲；乙；丙。')), 'semicolons'), 'warning');
  assert.ok(!has(readabilityIssues(lesson(':::tip[自己尝试 · 本地网页]\n' + '字'.repeat(200) + '。\n:::')), '段落过长'));
});

test('error 规则清单与主 agent 决定一致', () => {
  assert.deepEqual([...V3_ERROR_RULES].sort(), ['code-pair', 'concept-no-effect', 'intro-no-effect', 'learn-items', 'missing-lesson', 'old-header']);
});

test('error：两个代码块之间既无效果也无解释（先红后绿）', () => {
  const red = readabilityIssues(lesson('## 1. 概念\n\n主张。\n\n```js\na\n```\n\n```js\nb\n```\n\n<Effect kind="console" example="c03/types" />'));
  assert.equal(level(red, 'code-pair'), 'error');
  const green = readabilityIssues(lesson('## 1. 概念\n\n主张。\n\n```js\na\n```\n\n两段写法的差别在下一行。\n\n```js\nb\n```\n\n<Effect kind="console" example="c03/types" />'));
  assert.equal(level(green, 'code-pair'), undefined);
  assert.equal(level(green, 'code-no-effect'), 'warning');
});

test('error：概念节没有任何效果（先红后绿）', () => {
  const red = readabilityIssues(lesson('## 1. 概念\n\n主张。\n\n```js\na\n```\n\n解释。'));
  assert.equal(level(red, 'concept-no-effect'), 'error');
  assert.equal(level(red, 'code-no-effect'), 'warning');
  const green = readabilityIssues(lesson('## 1. 概念\n\n主张。\n\n```js\na\n```\n\n<Effect kind="console" example="c03/types" />\n\n解释。'));
  assert.deepEqual(green, []);
});

test('error：引言缺效果、「学完你能」不是 3 条（先红后绿）', () => {
  const body = '## 1. 概念\n\n<RunSnippet example="c03/types" />';
  const red = readabilityIssues(lesson(body, '一句场景。\n\n学完你能：\n\n- 一\n- 二\n\n**Java 对照：** 一句。'));
  assert.equal(level(red, 'intro-no-effect'), 'error');
  assert.equal(level(red, 'learn-items'), 'error');
  assert.ok(has(red, '应为 3 条，现在 2 条'));
  assert.deepEqual(readabilityIssues(lesson(body)), []);
});

test('error：有 lesson 仍保留旧页首（先红后绿）', () => {
  const header = '> **第 1 周 · 第 2 天** · 阅读约 45 分钟';
  const red = lint(`---\ntitle: T\n${LESSON}---\n\n${header}\n\n## 这一课解决什么问题\n\n一句。\n`);
  assert.ok(red.errors.includes('已有 frontmatter lesson，仍保留旧页首引用块'));
  const green = lint(`---\ntitle: T\n${LESSON}---\n\n## 这一课解决什么问题\n\n一句。\n`);
  assert.ok(!green.errors.some((message) => message.includes('旧页首')));
});

test('error：用了 V3 组件却没有 lesson（先红后绿）', () => {
  const body = '## 这一课解决什么问题\n\n一句。\n\n<Effect kind="console" example="c03/types" />\n';
  const red = lint(`---\ntitle: T\n---\n\n${body}`);
  assert.ok(red.errors.includes('使用了 V3 组件，但缺少 frontmatter lesson'));
  const green = lint(`---\ntitle: T\n${LESSON}---\n\n${body}`);
  assert.ok(!green.errors.some((message) => message.includes('缺少 frontmatter lesson')));
});

test('其余规则只报 warning；--preview-v3 预览旧课时不产生 error', () => {
  const issues = readabilityIssues(lesson('## 1. 概念\n\n<RunSnippet example="c03/types" />\n\n**记住：** 一。二。', '一。二。三。四。五。\n\n<Effect kind="page" preview="c15/layout" />\n\n学完你能：\n\n- 一\n- 二\n- 三'));
  assert.equal(level(issues, 'intro-sentences'), 'warning');
  assert.equal(level(issues, 'remember'), 'warning');
  assert.equal(level(issues, 'no-java'), 'warning');
  const old = '---\ntitle: T\n---\n\n## 这一课解决什么问题\n\n一句。\n\n## 1. 概念\n\n```js\na\n```\n\n```js\nb\n```\n';
  const plain = lintLesson('99-test/c99-fixture.mdx', { text: old });
  const preview = lintLesson('99-test/c99-fixture.mdx', { text: old, previewV3: true });
  assert.deepEqual(preview.errors, plain.errors);
  assert.ok(preview.warnings.some((message) => message.includes('两个代码块之间')));
});

test('C03、C15 范例课没有可读性问题', () => {
  for (const file of ['src/content/docs/02-language-data/c03-values-types.mdx', 'src/content/docs/03-async-modules/c15-css-layout-responsive.mdx']) {
    assert.deepEqual(readabilityIssues(readFileSync(file, 'utf8')), [], file);
  }
});
