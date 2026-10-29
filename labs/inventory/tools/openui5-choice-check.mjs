import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const notes = await readFile(new URL('../notes/ui5-choice.md', import.meta.url), 'utf8');
for (const name of ['Fiori', 'SAPUI5', 'OpenUI5', 'Web Components', 'React', 'P004']) {
  assert.ok(notes.includes(name), `notes/ui5-choice.md 缺少 ${name} 的选择说明`);
}
assert.match(notes, /(?:mock|模拟)/i, '记录静态 mock 的边界');
console.log('C39：选择记录包含四种家族、P004 任务与 mock 边界；判断理由请自行解释。');
