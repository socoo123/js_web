import { readFileSync, existsSync } from 'node:fs';
import { checkedPath } from '../../labs/sources.mjs';

// 引用格式 c03/defaults → examples/c03/defaults.js 与 defaults.expected.txt（已由 npm run examples 核对）。
export function readExample(ref) {
  if (typeof ref !== 'string' || !/^c\d{2}\/[a-z0-9-]+$/.test(ref)) throw new Error(`示例引用无效：${ref}`);
  const expectedFile = checkedPath(`examples/${ref}.expected.txt`);
  const sourceFile = `examples/${ref}.js`;
  const source = existsSync(sourceFile) ? readFileSync(checkedPath(sourceFile), 'utf8').replaceAll('\r\n', '\n').trimEnd() : null;
  const expected = readFileSync(expectedFile, 'utf8').replaceAll('\r\n', '\n').trimEnd();
  return { ref, file: `${ref.split('/')[1]}.js`, source, expected };
}
