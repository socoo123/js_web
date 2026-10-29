import { expect, test } from 'vitest';
import { readFile } from 'node:fs/promises';
import { selectProduct } from '../adapters/antd/select-product.js';
import { parseStock, summarize } from '../src/core/inventory.js';
import { createInventoryRepository } from '../src/services/inventory-repository.js';

const seed = JSON.parse(await readFile(new URL('../data/products.json', import.meta.url)));
test('显示顺序与正式商品身份分离，未知编号不回退到首行', () => {
  const row = { id: seed.toSorted((a, b) => a.stock - b.stock)[0].id, index: 0 };
  expect(selectProduct(seed, row)).toEqual(seed[1]);
  expect(selectProduct(seed, { id: 'P004', index: 0 })).toEqual(seed[3]);
  expect(selectProduct(seed, { id: 'P999', index: 0 })).toBeNull();
});
test('共享输入规则拒绝空白/负数，保留合法 0', () => {
  for (const value of ['', ' ', '-1', '1.5', '3件', '100000']) expect(() => parseStock(value)).toThrow();
  expect(parseStock('0')).toBe(0);
});
test('P004 取消不写仓库；保存 8 只改库存且总量为 57', async () => {
  const repository = createInventoryRepository({ storage: null, seed, delay: 0 });
  const draft = await repository.get('P004');
  draft.stock = parseStock('8'); draft.tags.push('仅草稿');
  expect(await repository.get('P004')).toEqual(seed[3]);
  expect(summarize(await repository.list()).stock).toBe(52);
  const product = await repository.get('P004');
  await repository.save({ ...product, stock: parseStock('8') });
  expect(await repository.get('P004')).toEqual({ ...seed[3], stock: 8 });
  expect(await repository.get('P001')).toEqual(seed[0]);
  expect(summarize(await repository.list()).stock).toBe(57);
  expect(seed[3].stock).toBe(3);
});
test('统一仓库拒绝非法业务数据且好数据不丢失', async () => {
  const repository = createInventoryRepository({ storage: null, seed, delay: 0 });
  await expect(repository.save({ ...seed[3], stock: -1 })).rejects.toThrow();
  expect(await repository.list()).toEqual(seed);
  await repository.save({ ...seed[3], stock: 0 });
  expect((await repository.get('P004')).stock).toBe(0);
});
