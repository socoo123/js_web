import { it, expect } from "vitest";
import { products } from "../../../shared/products.js";
import { productsReducer } from "../src/products-reducer.js";
import { INVENTORY_STORAGE_KEY, parseInventorySnapshot, writeInventorySnapshot } from "../src/inventory-storage.js";

it("非法库存不能覆盖最后一份可恢复的快照", () => {
  const original = JSON.stringify({ version: 1, products });
  const records = new Map([[INVENTORY_STORAGE_KEY, original]]);
  const storage = { setItem: (key, raw) => records.set(key, raw) };
  const invalid = products.map((product) => product.id === "P002"
    ? { ...product, stock: "0" } : product);
  expect(() => writeInventorySnapshot(storage, invalid)).toThrow("库存商品字段无效");
  expect(records.get(INVENTORY_STORAGE_KEY)).toBe(original);
});

it("保存售罄商品再删除其他商品，恢复后保留 0 和精确单价", () => {
  const saved = productsReducer(products, { type: "saved", id: "P002",
    changes: { ...products[1], stock: 0, priceCents: 29 } });
  const remaining = products.filter(({ id }) => id !== "P002").reduce((items, { id }) =>
    productsReducer(items, { type: "removed", id }), saved);
  const restored = parseInventorySnapshot(JSON.stringify({ version: 1, products: remaining }));
  expect(restored).toEqual([{ ...products[1], stock: 0, priceCents: 29 }]);
  expect(products[1].priceCents).toBe(12900);
  expect(products).toHaveLength(6);
});
