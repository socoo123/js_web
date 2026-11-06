import { readFileSync, existsSync } from 'node:fs';
import { checkedPath } from '../../labs/sources.mjs';

// 引用格式 c03/defaults → examples/c03/defaults.js 与 defaults.expected.txt（已由 npm run examples 核对）。
export function readExample(ref) {
  if (typeof ref !== 'string' || !/^c\d{2}\/[a-z0-9-]+$/.test(ref)) throw new Error(`示例引用无效：${ref}`);
  const expectedFile = checkedPath(`examples/${ref}.expected.txt`);
  const sourceFile = `examples/${ref}.js`;
  const source = existsSync(sourceFile) ? readFileSync(checkedPath(sourceFile), 'utf8').replaceAll('\r\n', '\n').trimEnd() : null;
  const expected = readFileSync(expectedFile, 'utf8').replaceAll('\r\n', '\n').replace(/[\t ]+$/gm, '').trimEnd();
  return { ref, file: `${ref.split('/')[1]}.js`, source, expected };
}

// 浏览器沙箱里没有模块加载器和 Node 全局；出现这些写法的片段只能用 Effect 展示输出。
const NODE_ONLY = [
  [/\bimport\b/, 'import'],
  [/\bexport\b/, 'export'],
  [/\brequire\s*\(/, 'require()'],
  [/\bprocess\b/, 'process'],
  [/\bnode:/, 'node: 模块'],
  [/\b__(?:dirname|filename)\b/, '__dirname/__filename'],
  [/\bBuffer\b/, 'Buffer'],
];

export function readRunnable(ref) {
  const item = readExample(ref);
  if (item.source === null) throw new Error(`RunSnippet 缺少源码：examples/${ref}.js`);
  for (const [pattern, name] of NODE_ONLY) {
    if (pattern.test(item.source)) throw new Error(`RunSnippet 只运行浏览器能执行的片段：${ref} 含 ${name}`);
  }
  return item;
}
