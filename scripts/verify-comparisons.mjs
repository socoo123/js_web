import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { pairs, snippets, comparison, snippet, checkedPath } from '../labs/sources.mjs';

const java = new Set();
for (const id of Object.keys(pairs)) {
  const pair = comparison(id);
  if (!pair.input || !pair.difference || !pair.left.output || !pair.right.output) throw new Error(`对照缺共同输入/结果/差异：${id}`);
  for (const ref of [pair.left, pair.right]) {
    if (ref.code.split('\n').length > 25) throw new Error(`导入片段超过 25 行：${id}`);
    if (!ref.verified && !ref.reason) throw new Error(`未运行片段缺少原因：${id}`);
    if (ref.lang === 'java' && ref.verified) java.add(ref.source);
  }
}
for (const id of Object.keys(snippets)) if (snippet(id).code.split('\n').length > 25) throw new Error(`导入片段超过 25 行：${id}`);
for (const file of java) {
  const result = spawnSync('java', [checkedPath(file)], { encoding: 'utf8', timeout: 20000 });
  const expected = readFileSync(checkedPath(file.replace(/\.java$/, '.expected.txt')), 'utf8');
  if (result.status !== 0 || result.stdout.replaceAll('\r\n', '\n') !== expected) throw new Error(`Java 实际运行失败：${file}\n${result.error?.message ?? result.stderr}\n期望：${expected}\n实际：${result.stdout}`);
}
console.log(`源码对照检查：${Object.keys(pairs).length} 张双栏、${Object.keys(snippets).length} 个片段，Java ${java.size} 个完整源文件实际运行通过。`);
