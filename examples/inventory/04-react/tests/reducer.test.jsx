import { it, expect } from "vitest";
import { products } from "../../../shared/products.js";
import { productsReducer } from "../src/products-reducer.js";

const frozenProducts = () => Object.freeze(products.map((product) => Object.freeze({
  ...product, tags: Object.freeze([...product.tags]),
})));

it("补货保留旧快照，并同步得到新的库存价值", () => {
  const before = frozenProducts();
  const after = productsReducer(before, { type: "restocked", id: "P002" });
  expect(before[1].stock).toBe(0);
  expect(after[1].stock).toBe(1);
  expect(after[0]).toBe(before[0]);
  expect(after.reduce((sum, product) => sum + product.stock, 0)).toBe(53);
  expect(after.reduce((sum, product) => sum + product.stock * product.priceCents, 0)).toBe(2647700);
});

it("依次处理两个补货和一次删除，不丢失前一个 action 的结果", () => {
  const actions = [{ type: "restocked", id: "P002" }, { type: "restocked", id: "P002" }, { type: "removed", id: "P001" }];
  const after = actions.reduce(productsReducer, frozenProducts());
  expect(after).toHaveLength(5);
  expect(after.find((product) => product.id === "P002").stock).toBe(2);
  expect(after.reduce((sum, product) => sum + product.stock, 0)).toBe(42);
});

it("保存经过校验的数据，固定 id 并隔离 action 的标签数组", () => {
  const before = frozenProducts();
  const changes = { ...products[1], id: "P999", name: " 无线鼠标 ", stock: 3, priceCents: 12990, tags: ["热销"] };
  const after = productsReducer(before, { type: "saved", id: "P002", changes });
  expect(after[1]).toEqual({ ...products[1], stock: 3, priceCents: 12990, tags: ["热销"] });
  expect(after[1].tags).not.toBe(changes.tags);
  expect(before[1].tags).toEqual([]);
  expect(after.reduce((sum, product) => sum + product.stock * product.priceCents, 0)).toBe(2673770);
});

it("相同输入可以重复计算新增结果，编号和共享起点保持稳定", () => {
  const before = frozenProducts();
  const first = productsReducer(before, { type: "sampleAdded" });
  const second = productsReducer(before, { type: "sampleAdded" });
  expect(first).toEqual(second);
  expect(first.at(-1)).toEqual({ id: "P007", name: "新商品", category: "配件", stock: 0, priceCents: 0, tags: [] });
  expect(productsReducer(first, { type: "sampleAdded" }).at(-1).id).toBe("P008");
  expect(before).toHaveLength(6);
});

it("达到库存或编号上限时保持业务边界", () => {
  const before = [{ ...products[1], stock: 99999, id: "P999" }];
  expect(productsReducer(before, { type: "restocked", id: "P999" })[0].stock).toBe(99999);
  expect(productsReducer(before, { type: "sampleAdded" })).toBe(before);
  expect(productsReducer([], { type: "sampleAdded" })[0].id).toBe("P001");
});

it.each(["restocked", "removed", "saved"])("%s 找不到商品时保留数据内容", (type) => {
  const before = frozenProducts();
  expect(productsReducer(before, { type, id: "P998", changes: products[1] })).toEqual(before);
});

it.each([null, {}, { type: "restokced", id: "P002" }])("拒绝未知 action：%j", (action) => {
  const before = frozenProducts();
  expect(() => productsReducer(before, action)).toThrow("未知 action");
  expect(before[1].stock).toBe(0);
});

it.each([undefined, "P2", 2])("拒绝缺失或格式错误的编号：%s", (id) => {
  expect(() => productsReducer(frozenProducts(), { type: "restocked", id })).toThrow("商品编号无效");
});

it.each([{ stock: "3" }, { stock: -1 }, { stock: 100000 }, { name: " " }, { category: "其他" },
  { priceCents: 129.9 }, { priceCents: Number.MAX_SAFE_INTEGER + 1 }, { tags: [1] }])("拒绝非法保存数据：%j", (invalid) => {
  const before = frozenProducts();
  expect(() => productsReducer(before, { type: "saved", id: "P002", changes: { ...products[1], ...invalid } })).toThrow(TypeError);
  expect(before[1].stock).toBe(0);
});
