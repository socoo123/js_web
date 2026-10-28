import test from 'node:test';
import assert from 'node:assert/strict';
import { importedContent, codeLimitIssues } from '../scripts/lesson-sources.mjs';
import { checkedPath, extractRegion, pairs } from '../labs/sources.mjs';

test('对照两侧分别计块、输出/差异计入正文；围栏里的标签不当作组件', () => {
  const result = importedContent('<CodeCompare pairId="c03-input-number" />');
  assert.equal(result.code.length, 2); assert.match(result.prose, /15/); assert.match(result.prose, /转换失败/);
  assert.equal(importedContent('```mdx\n<CodeCompare pairId="missing" />\n```').code.length, 0);
});
test('缺来源、越界、区域缺失或重复、未运行原因缺失均拒绝', () => {
  assert.throws(() => importedContent('<CodeCompare pairId="missing" />'), /缺少/);
  assert.throws(() => checkedPath('../secrets'), /越界/);
  assert.throws(() => extractRegion('// region x\n1\n// endregion x\n// region x\n2\n// endregion x', 'x'), /重复/);
  assert.throws(() => extractRegion('abc', 'missing'), /缺失/);
  const original = pairs['c03-input-number'].left.verified;
  try { pairs['c03-input-number'].left.verified = false; assert.throws(() => importedContent('<CodeCompare pairId="c03-input-number" />'), /原因标注/); }
  finally { pairs['c03-input-number'].left.verified = original; }
});
test('MDX 不能用代码字符串、表达式、slot 或任意 import 绕过门禁', () => {
  for (const source of ['<CodeCompare pairId={"c03-input-number"} />', '<CodeCompare pairId="c03-input-number" code="hidden" />', '<CodeCompare pairId="c03-input-number">hidden</CodeCompare>', 'export const code = "hidden";', 'import Code from "./answer.js";', '<div title={"hidden"} />']) assert.throws(() => importedContent(source));
});
test('导入的两侧累加到普通课 16 块限制，26 行片段失败', () => {
  const source = Array(9).fill('<CodeCompare pairId="c03-input-number" />').join('\n\n');
  const blocks = importedContent(source).code.map((ref) => ({ lines: ref.code.split('\n') }));
  assert.match(codeLimitIssues(blocks, 16).join('\n'), /18.*超过 16/);
  assert.equal(codeLimitIssues(blocks, 20).length, 0);
  blocks[0].lines = Array(26).fill('code');
  assert.match(codeLimitIssues(blocks, 20).join('\n'), /26 行.*25/);
});
