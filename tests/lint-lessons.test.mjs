import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { READABILITY, readabilityIssues, sentenceCount } from '../scripts/lint-lessons.mjs';

const lesson = (body, intro = INTRO) => `---\ntitle: T\nlesson:\n  time: 1\n  prereq: 1\n  env: 1\n  verified: all\n---\n\n## 这一课解决什么问题\n\n${intro}\n\n${body}\n`;
const INTRO = '一句场景。\n\n<Effect kind="page" preview="c15/layout" />\n\n学完你能：\n\n- 一\n- 二\n- 三\n\n**Java 对照：** 一句。';
const has = (issues, text) => issues.some((issue) => issue.includes(text));

test('句数按「。！？」计，句末引号不多算一句', () => {
  assert.equal(sentenceCount('一。二？三！'), 3);
  assert.equal(sentenceCount('只有一句没有句号'), 1);
  assert.equal(sentenceCount('他说「好。」'), 1);
});

test('段落按字数、句数、行内代码和分号报警', () => {
  const long = '字'.repeat(READABILITY.paragraphChars + 1) + '。';
  assert.ok(has(readabilityIssues(lesson(`## 1. 概念\n\n${long}`)), '段落过长'));
  assert.ok(has(readabilityIssues(lesson('## 1. 概念\n\n一。二。三。四。')), '4 句'));
  assert.ok(has(readabilityIssues(lesson('## 1. 概念\n\n`a` `b` `c` `d`。')), '行内代码过密'));
  assert.ok(has(readabilityIssues(lesson('## 1. 概念\n\n甲；乙；丙。')), '多个分号'));
  assert.ok(!has(readabilityIssues(lesson(':::tip[自己尝试 · 本地网页]\n' + '字'.repeat(200) + '。\n:::')), '段落过长'));
});

test('代码后要有效果；Predict 自带答案效果', () => {
  const bare = readabilityIssues(lesson('## 1. 概念\n\n主张。\n\n```js\na\n```\n\n```js\nb\n```\n'));
  assert.ok(has(bare, '两个代码块之间既没有效果也没有解释'));
  assert.ok(has(bare, '代码块后没有效果'));
  assert.ok(has(bare, '没有任何效果'));
  const ok = readabilityIssues(lesson('## 1. 概念\n\n主张。\n\n```js\na\n```\n\n<Effect kind="console" example="c03/types" />\n\n<Predict question="几？">\n\n```js\nb\n```\n\n<div slot="answer">\n\n```text\n1\n```\n\n</div>\n</Predict>\n'));
  assert.deepEqual(ok, []);
});

test('引言、学完你能、记住与 Java 对照的结构检查', () => {
  const issues = readabilityIssues(lesson('## 1. 概念\n\n<RunSnippet example="c03/types" />\n\n**记住：** 一。二。', '一。二。三。四。五。\n\n学完你能：\n\n- 一\n- 二'));
  assert.ok(has(issues, '5 句'));
  assert.ok(has(issues, '缺少「完成后的效果」'));
  assert.ok(has(issues, '应为 3 条，现在 2 条'));
  assert.ok(has(issues, '「记住」只写一句'));
  assert.ok(has(issues, '没有任何「**Java 对照：**」段落'));
});

test('C03、C15 范例课没有可读性警告', () => {
  for (const file of ['src/content/docs/02-language-data/c03-values-types.mdx', 'src/content/docs/03-async-modules/c15-css-layout-responsive.mdx']) {
    assert.deepEqual(readabilityIssues(readFileSync(file, 'utf8')), [], file);
  }
});
