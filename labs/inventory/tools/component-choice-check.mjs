import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const workspace = fileURLToPath(new URL('../', import.meta.url));
const products = JSON.parse(await readFile(path.join(workspace, 'data/products.json')));
const { selectProduct } = await import(pathToFileURL(path.join(workspace, 'adapters/antd/select-product.js')));
const visible = products.toSorted((a, b) => a.stock - b.stock);
const row = { id: visible[0].id, index: 0 };
const selected = selectProduct(products, row);
assert.equal(selected?.id, 'P002', '排序后 row.id=P002、index=0，必须仍选择 P002，而不是原数组首行 P001');
assert.equal(selected.stock, 0, '合法的零库存不能被初值替代');
assert.equal(selectProduct(products, { id: 'P004', index: 0 })?.id, 'P004', '筛选后的首行仍按 id 选择');
assert.equal(selectProduct(products, { id: 'P999', index: 0 }), null, '未知 id 不回退到第一行');
assert.equal(products[0].id, 'P001', '显示排序不能修改源数组');
const notes = await readFile(path.join(workspace, 'notes/components.md'), 'utf8');
for (const text of ['契约', 'id', 'P004', '52', '57', '可访问性', '主题', '维护', '许可', 'Ant Design', 'Radix', 'shadcn', 'https://']) {
  assert(notes.includes(text), `notes/components.md 缺少 ${text}；检查只确认契约要点，选择理由仍需自己解释`);
}
console.log('C37：商品身份 5 项与选型记录要点通过（选择理由由你解释）。');
