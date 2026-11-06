import test from 'node:test';
import assert from 'node:assert/strict';
import { globSync, readFileSync } from 'node:fs';
import { importedContent, codeLimitIssues } from '../scripts/lesson-sources.mjs';
import { checkedPath, extractRegion, pairs } from '../labs/sources.mjs';
import { readRunnable } from '../src/lib/examples.mjs';
import { sandboxRuntime } from '../src/lib/run-snippet-runtime.mjs';

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
test('同一个 ESM 节点中的第二个声明与导入别名也必须检查', () => {
  const first = 'import CodeCompare from "../../../components/CodeCompare.astro";\n';
  assert.throws(() => importedContent(first + 'export const hidden = "code";'));
  assert.throws(() => importedContent(first + 'import Answer from "./answer.js";'));
  assert.throws(() => importedContent('import CodeCompare from "../../../components/LessonTask.astro";'));
  assert.throws(() => importedContent('<script src="./answer.js" />'));
});
test('导入的两侧累加到普通课 16 块限制，26 行片段失败', () => {
  const source = Array(9).fill('<CodeCompare pairId="c03-input-number" />').join('\n\n');
  const blocks = importedContent(source).code.map((ref) => ({ lines: ref.code.split('\n') }));
  assert.match(codeLimitIssues(blocks, 16).join('\n'), /18.*超过 16/);
  assert.equal(codeLimitIssues(blocks, 20).length, 0);
  blocks[0].lines = Array(26).fill('code');
  assert.match(codeLimitIssues(blocks, 20).join('\n'), /26 行.*25/);
});

const fence = '```js\nconsole.log(1);\n```';
const answer = '<div slot="answer">\n\n打印 1。\n\n</div>';
const predict = (...parts) => `<Predict question="打印几？">\n\n${parts.join('\n\n')}\n\n</Predict>`;
test('Predict：问题代码块在前，唯一且非空的答案区在最后', () => {
  const result = importedContent(predict(fence, answer));
  assert.deepEqual(result.components, [{ component: 'Predict', id: '打印几？' }]);
  assert.match(result.prose, /先猜一猜：打印几？/);
  assert.equal(importedContent(predict(fence, '<div slot="answer">\n\n<Effect kind="console" example="c03/defaults" />\n\n</div>')).code.length, 1);
  for (const [source, reason] of [
    ['<Predict>\n\n' + fence + '\n\n' + answer + '\n\n</Predict>', /question/],
    [predict(fence), /只能有一个/],
    [predict(fence, answer, answer), /只能有一个/],
    [predict(fence, '<div slot="answer" class="x">\n\n打印 1。\n\n</div>'), /只写 slot/],
    [predict(fence, '<div slot="answer"></div>'), /不能为空/],
    [predict('先想想。', answer), /问题代码块/],
    [predict(answer, fence), /最后/],
    [predict(fence, '<div slot="answer">\n\n' + predict(fence, answer) + '\n\n</div>'), /嵌套/],
    ['<Predict question="打印几？" hint="x">\n\n' + fence + '\n\n' + answer + '\n\n</Predict>', /不支持属性/],
  ]) assert.throws(() => importedContent(source), reason);
});
test('Effect：输出面板二选一，页面截图只给 ID，演示必须登记', () => {
  const output = importedContent('<Effect kind="console" example="c03/defaults" />');
  assert.equal(output.code.length, 1);
  assert.deepEqual(output.components, [{ component: 'Effect', id: 'c03/defaults', kind: 'console', output: '12\n0\ntrue true false\ntrue true' }]);
  assert.deepEqual(importedContent('<Effect kind="terminal" title="检查">\n\n```text\n通过\n```\n\n</Effect>').components[0], { component: 'Effect', id: null, kind: 'terminal', output: null });
  assert.equal(importedContent('<Effect kind="page" preview="c23/actions" caption="补货后 15" />').components[0].id, 'c23/actions');
  assert.equal(importedContent('<Effect kind="demo" demo="c23-update-queue" />').components[0].kind, 'demo');
  for (const [source, reason] of [
    ['<Effect kind="console" />', /二选一/],
    ['<Effect kind="console" example="c03/defaults">\n\n```text\n12\n```\n\n</Effect>', /二选一/],
    ['<Effect kind="terminal">\n\n通过\n\n</Effect>', /只能是一个代码块/],
    ['<Effect kind="terminal">\n\n```text\n1\n```\n\n```text\n2\n```\n\n</Effect>', /只能是一个代码块/],
    ['<Effect kind="console" example="c03/missing" />', /ENOENT|不存在|缺少/],
    ['<Effect kind="page" preview="c23/actions">\n\n```text\n1\n```\n\n</Effect>', /只接受 preview/],
    ['<Effect kind="page" preview="../shots/x" />', /形如/],
    ['<Effect kind="demo" demo="c99-unknown" />', /未登记/],
    ['<Effect kind="demo" demo="c23-update-queue" preview="c23/actions" />', /只接受 demo/],
    ['<Effect kind="video" />', /kind/],
    ['<Effect kind="page" preview="c23/actions" alt="x" />', /不支持属性/],
  ]) assert.throws(() => importedContent(source), reason);
});
test('RunSnippet：只接受带已验证输出、不依赖 Node 的浏览器片段', () => {
  const result = importedContent('<RunSnippet example="c03/defaults" title="默认值" />');
  assert.equal(result.code.length, 2);
  assert.equal(result.components[0].output, '12\n0\ntrue true false\ntrue true');
  assert.throws(() => importedContent('<RunSnippet example="c23/closure" />'), /含 import/);
  assert.throws(() => importedContent('<RunSnippet example="c03/defaults">\n\n```js\n1\n```\n\n</RunSnippet>'), /只接受 example/);
  assert.throws(() => importedContent('<RunSnippet title="x" />'), /只接受 example/);
  assert.throws(() => importedContent('<RunSnippet example="c03/restock-fixed" />'), /ENOENT|不存在|缺少/);
});

async function runInSandbox(code) {
  const lines = [];
  await new Promise((resolve) => sandboxRuntime((message) => {
    if (message.type === 'log' && ['log', 'info', 'debug'].includes(message.level)) lines.push(message.text);
    if (message.type === 'done') resolve();
  }, globalThis).run(code));
  return lines.join('\n').replace(/[\t ]+$/gm, '');
}
test('浏览器沙箱的 console 输出与每个可运行示例的已验证输出一致', async () => {
  const runnable = globSync('examples/c[0-9][0-9]/*.expected.txt').sort()
    .map((file) => file.replace(/^examples\//, '').replace(/\.expected\.txt$/, ''))
    .flatMap((ref) => { try { return [readRunnable(ref)]; } catch { return []; } });
  assert.ok(runnable.length > 0);
  const mismatched = [];
  for (const item of runnable) if (await runInSandbox(item.source) !== item.expected) mismatched.push(item.ref);
  assert.deepEqual(mismatched, []);
  for (const file of globSync('src/content/docs/**/*.mdx')) {
    for (const [, ref] of readFileSync(file, 'utf8').matchAll(/<RunSnippet\b[^>]*\bexample="([^"]+)"/g)) assert.ok(runnable.some((item) => item.ref === ref), `${file} 的 ${ref} 不能在浏览器沙箱运行`);
  }
  assert.equal(await runInSandbox('console.log({ id: "P001", tags: ["热销"] }, 10n, new Map([["P001", 12]]));'), "{ id: 'P001', tags: [ '热销' ] } 10n Map(1) { 'P001' => 12 }");
});
