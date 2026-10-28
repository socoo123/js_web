import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import { workspace, run } from './lab.mjs';

const id = process.argv[2];
const n = Number(id?.slice(1));
const data = JSON.parse(await readFile(path.join(workspace, 'data/products.json')));
const core = await import(pathToFileURL(path.join(workspace, 'src/core/inventory.js')));
let count = 0;
function equal(input, actual, expected) {
  try { assert.deepEqual(actual, expected); count++; }
  catch { throw new Error(`${id} 检查失败\n输入：${JSON.stringify(input)}\n期望：${JSON.stringify(expected)}\n实际：${JSON.stringify(actual)}`); }
}
function rejects(input, callback) {
  let error; try { callback(); } catch (caught) { error = caught; }
  equal(input, Boolean(error?.message), true);
}
try {
  equal('固定数据 P001', data[0], { id: 'P001', name: '机械键盘', category: '外设', stock: 12, priceCents: 39900, tags: ['热销'] });
  if (n >= 1) { equal('入口 stockValue', typeof core.stockValue, 'function'); equal('P001 价值（分）', core.stockValue(data[0]), 478800); }
  if (n >= 2) {
    const html = await readFile(path.join(workspace, 'src/vanilla/index.html'), 'utf8');
    equal('C02 label / input / module', ['for="amount"', 'id="amount"', 'type="module"', './app.js'].every((text) => html.includes(text)), true);
  }
  if (n >= 3) {
    equal('入口 parseStock', typeof core.parseStock, 'function');
    for (const [text, value] of [['3', 3], [' 3 ', 3], ['0', 0], ['99999', 99999]]) equal({ parseStock: text }, core.parseStock(text), value);
    for (const text of ['', '  ', '3件', '-1', '3.5', 'Infinity', '100000']) rejects({ parseStock: text, expected: '明确错误' }, () => core.parseStock(text));
    equal('初始库存 0', core.initialStock(0), 0);
    equal('初始库存 undefined', core.initialStock(undefined), 12);
    const before = structuredClone(data[0]);
    equal('P001 12 + 输入 3', core.restockProduct(before, '3').stock, 15);
    equal('补货不改原对象', before, data[0]);
    rejects('补货后超过 99999', () => core.restockProduct({ ...data[0], stock: 99999 }, '1'));
  }
  if (n >= 20) {
    for (const [text, value] of [['0', 0], ['0.29', 29], ['399.00', 39900], ['90071992547409.91', Number.MAX_SAFE_INTEGER]]) equal({ parsePriceCents: text }, core.parsePriceCents(text), value);
    for (const text of ['', ' ', '-1', '1.001', '3元', '90071992547409.92']) rejects({ parsePriceCents: text }, () => core.parsePriceCents(text));
    equal('固定统计', core.summarize(data), { count: 6, stock: 52, valueCents: 2634800, soldOut: 1, lowStock: 2 });
    equal('空列表统计', core.summarize([]), { count: 0, stock: 0, valueCents: 0, soldOut: 0, lowStock: 0 });
    rejects('汇总超过安全整数', () => core.summarize([{ ...data[0], stock: 2, priceCents: Number.MAX_SAFE_INTEGER }]));
    rejects('重复 id', () => core.validateProducts([data[0], data[0]]));
    for (const changes of [{ stock: -1 }, { stock: '' }, { name: ' ' }, { category: '未知' }, { priceCents: 1.5 }, { tags: [1] }]) equal({ invalidProduct: changes }, Object.keys(core.validateProduct({ ...data[0], ...changes })).length > 0, true);
    const original = structuredClone(data); const next = core.updateStock(original, 'P004', 8);
    equal('按 id 更新 P004', next[3].stock, 8); equal('不改 P001', next[0].stock, 12); equal('原对象不改', original, data);
    equal('新数组与目标新对象', next !== original && next[3] !== original[3], true);
    const draft = core.toDraft(original[3]); draft.tags.push('仅草稿');
    equal('取消草稿 tags 不污染', original[3].tags, data[3].tags);
    equal('空白库存校验', core.parseDraft({ ...draft, stock: '' }).hasErrors, true);
    equal('合法零库存', core.parseDraft({ ...draft, stock: '0' }).value.stock, 0);
  }
  if (n >= 23 && n <= 39) {
    equal('src/react/StockActions.jsx 已创建', existsSync(path.join(workspace, 'src/react/StockActions.jsx')), true);
    await run(process.execPath, ['node_modules/vitest/vitest.mjs', 'run', '--config', 'tools/vitest.config.mjs']);
  }
  if (n >= 41 && n <= 42) {
    equal('view/EditDialog.fragment.xml 已创建', existsSync(path.join(workspace, 'adapters/openui5/webapp/view/EditDialog.fragment.xml')), true);
    await run(process.execPath, ['tools/ui5-check.mjs']);
  }
  console.log(`${id}：${count} 条当前工作文件检查通过；没有修改商品数据或源码。`);
} catch (error) { console.error(error.stack); process.exitCode = 1; }
