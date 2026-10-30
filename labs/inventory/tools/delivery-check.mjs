import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { workspace, run } from './lab.mjs';

const id = process.argv[2];
assert(/^C4[5-8]$/.test(id ?? ''), '交付检查需要 C45..C48');
const n = Number(id.slice(1));
for (const [from, file] of [[45, 'debug.md'], [46, 'delivery.md'], [47, 'test-plan.md'], [48, 'final-review.md']]) {
  if (n < from) continue;
  const text = await readFile(path.join(workspace, 'notes', file), 'utf8');
  assert(text.trim().length >= 80, `请填写 notes/${file}；记录实际证据和待完成项。`);
}
if (n >= 47) {
  const files = ['tests/react/regression.test.jsx', 'tests/react/inventory.test.jsx', 'tests/react/review.test.jsx'];
  if (n >= 48) files.push('tests/react/final-filter.test.jsx');
  await run(process.execPath, ['node_modules/vitest/vitest.mjs', 'run', '--config', 'tools/delivery.config.mjs', ...files]);
}
await run(process.execPath, ['tools/delivery-browser.mjs', id]);
console.log(`${id}：交付行为通过。笔记仅检查存在与基本长度；性能/内存判断、个人发布与理解程度仍由你记录和确认。`);
