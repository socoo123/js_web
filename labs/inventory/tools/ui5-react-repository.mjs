import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { workspace } from './lab.mjs';

const seed = JSON.parse(await readFile(path.join(workspace, 'data/products.json')));
const { parseDraft, toDraft, summarize } = await import(pathToFileURL(path.join(workspace, 'src/core/inventory.js')));
const { createInventoryRepository } = await import(pathToFileURL(path.join(workspace, 'src/services/inventory-repository.js')));
const repository = createInventoryRepository({ storage: null, seed, delay: 0 });
const dock = await repository.get('P004');
const draft = toDraft(dock);
draft.stock = '8'; draft.tags.push('仅草稿');
assert.deepEqual(await repository.get('P004'), seed[3], '取消草稿不能更改 repository');
for (const stock of ['', '   ', '-1', '3.5', '3件']) {
  assert.equal(parseDraft({ ...toDraft(dock), stock }).hasErrors, true, `非法库存 ${JSON.stringify(stock)} 没有拒绝`);
}
await assert.rejects(repository.save({ ...dock, stock: -1 }));
assert.deepEqual(await repository.get('P004'), dock, '非法保存污染了原商品');
const parsed = parseDraft({ ...toDraft(dock), stock: '8' });
assert.equal(parsed.hasErrors, false);
await repository.save(parsed.value);
const next = await repository.list();
assert.deepEqual(next[3], { ...seed[3], stock: 8 });
assert.deepEqual(next.filter((item) => item.id !== 'P004'), seed.filter((item) => item.id !== 'P004'));
assert.equal(summarize(next).stock, 57);
assert.equal(parseDraft({ ...toDraft(dock), stock: '0' }).value.stock, 0);
repository.failNext('save');
await assert.rejects(repository.save({ ...dock, stock: 9 }), /模拟 save 失败/);
assert.equal((await repository.get('P004')).stock, 8);
console.log('C44 当前 core/repository：P004 取消3/52、保存8/57、其余字段/商品保留、非法拒绝、0合法、失败不写入，通过。');
