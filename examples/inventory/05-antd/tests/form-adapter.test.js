import { describe, it, expect } from "vitest";
import { products } from "../../../shared/products.js";
import { toDraft } from "../../04-react/src/product-form.js";
import { productsReducer } from "../../04-react/src/products-reducer.js";
import { parseInventorySnapshot } from "../../04-react/src/inventory-storage.js";
import { commitDraft, fieldRule } from "../src/form-adapter.js";

describe("组件库入口仍遵守库存规则", () => {
  it.each(["", "-1", "3.8", "100000", "3件"])("拒绝库存 %j", async (value) => {
    await expect(fieldRule("stock").validator({}, value)).rejects.toThrow();
  });
  it.each(["0", "99999"])("保留合法库存 %j", async (value) => {
    await expect(fieldRule("stock").validator({}, value)).resolves.toBeUndefined();
  });
  it.each(["", "-1", "1.001", "1元"])("拒绝价格 %j", async (value) => {
    await expect(fieldRule("price").validator({}, value)).rejects.toThrow();
  });
  it("提交后金额是整数分，保存保留新品标签且不改原对象", () => {
    const dock = products.find((p) => p.id === "P004");
    const { value } = commitDraft(products, dock.id, { ...toDraft(dock), name: "  USB-C 扩展坞  ", stock: "0", price: "299.01", featured: false });
    expect(value).toMatchObject({ name: dock.name, stock: 0, priceCents: 29901, tags: ["新品"] });
    const updated = productsReducer(products, { type: "saved", id: dock.id, changes: value });
    expect(updated.find((p) => p.id === dock.id).stock).toBe(0);
    expect(dock.stock).toBe(3);
  });
  it("跨版本快照保留 0 和空数组", () => {
    expect(parseInventorySnapshot(JSON.stringify({ version: 1, products: [] }))).toEqual([]);
    expect(parseInventorySnapshot(JSON.stringify({ version: 1, products }))[1].stock).toBe(0);
  });
  it("商品已删除时拒绝保存旧草稿", () => {
    expect(() => commitDraft([], "P002", toDraft(products[1]))).toThrow("商品已不存在");
  });
  it("整次提交再次校验字段", () => {
    expect(commitDraft(products, "P002", { ...toDraft(products[1]), stock: "" }).value).toBeNull();
  });
});
