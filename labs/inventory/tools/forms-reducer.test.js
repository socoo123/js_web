import React from "react";
import { afterEach, describe, test, expect } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import seed from "../data/products.json" with { type: "json" };
import { inventoryReducer } from "../src/react/inventory-reducer.js";
import { InventoryProvider, useInventory } from "../src/react/InventoryProvider.jsx";
import { summarize } from "../src/core/inventory.js";

afterEach(cleanup);

function freeze(value) {
  Object.freeze(value);
  for (const child of Object.values(value)) if (child && typeof child === "object") freeze(child);
  return value;
}

describe("C27 实际 inventoryReducer 的纯转换", () => {
  test("课内连续 action 得到 41，旧输入保持 0", () => {
    const before = freeze(structuredClone(seed));
    const afterRestock = inventoryReducer(before, { type: "restocked", id: "P002", amount: 1 });
    const afterDelete = inventoryReducer(afterRestock, { type: "deleted", id: "P001" });
    expect(summarize(afterDelete).stock).toBe(41); expect(before[1].stock).toBe(0);
  });

  test("补货保留旧输入，不可变更新只替换目标记录", () => {
    const before = freeze(structuredClone(seed));
    const action = freeze({ type: "restocked", id: "P002", amount: 1 });
    const after = inventoryReducer(before, action);
    expect(before[1].stock).toBe(0); expect(after[1].stock).toBe(1);
    expect(after).not.toBe(before); expect(after[1]).not.toBe(before[1]); expect(after[0]).toBe(before[0]);
    expect(inventoryReducer(before, action)).toEqual(after);
  });

  test("五种 action 连续计算，新旧数据和 action 的 tags 都不共享可写副本", () => {
    const before = freeze(structuredClone(seed));
    const added = freeze({ id: "P007", name: "新商品", category: "配件", stock: 0, priceCents: 0, tags: ["草稿标签"] });
    const created = inventoryReducer(before, { type: "created", product: added });
    expect(created.at(-1)).not.toBe(added); expect(created.at(-1).tags).not.toBe(added.tags);
    const savedProduct = freeze({ ...seed[1], stock: 3, priceCents: 12990 });
    const saved = inventoryReducer(created, { type: "saved", product: savedProduct });
    expect(saved[1].tags).not.toBe(savedProduct.tags); expect(summarize(saved).stock).toBe(55);
    const deleted = inventoryReducer(saved, { type: "deleted", id: "P001" });
    expect(summarize(deleted).stock).toBe(43);
    const replacement = freeze(structuredClone(seed));
    const replaced = inventoryReducer(deleted, { type: "replaced", products: replacement });
    expect(replaced).toEqual(seed); expect(replaced[0]).not.toBe(replacement[0]); expect(replaced[0].tags).not.toBe(replacement[0].tags);
    expect(before).toEqual(seed);
  });

  test("未知或缺失 action 明确抛错，不返回 undefined", () => {
    const before = freeze(structuredClone(seed));
    expect(() => inventoryReducer(before, { type: "restokced" })).toThrow("未知 action：restokced");
    expect(() => inventoryReducer(before, {})).toThrow("未知 action：undefined");
    expect(() => inventoryReducer(before, null)).toThrow("未知 action：undefined");
    expect(before).toEqual(seed);
  });

  test("沿用前课补货上限：后来到达的任务不能冲破 99999", () => {
    const before = freeze([{ ...structuredClone(seed[0]), stock: 99998 }]);
    const after = inventoryReducer(before, { type: "restocked", id: "P001", amount: 1 });
    const ignored = inventoryReducer(after, { type: "restocked", id: "P001", amount: 3 });
    expect(after[0].stock).toBe(99999); expect(ignored).toBe(after); expect(before[0].stock).toBe(99998);
  });

  test.each([
    { type: "created", product: { ...seed[0] } },
    { type: "saved", product: { ...seed[0], stock: "3" } },
    { type: "saved", product: { ...seed[0], id: "P999" } },
    { type: "restocked", id: "P001", amount: -1 },
    { type: "replaced", products: [{ ...seed[0], stock: -1 }] },
  ])("非法 action 不破坏旧数组：$type", (action) => {
    const before = freeze(structuredClone(seed));
    expect(() => inventoryReducer(before, action)).toThrow();
    expect(before).toEqual(seed);
  });
});

describe("C27 实际 Provider 的队列与作用域", () => {
  test("一次事件两个 action：旧快照 0、返回 undefined、新界面 2", () => {
    let observed, returned;
    function Probe() {
      const { products, dispatch } = useInventory();
      const stock = products.find((product) => product.id === "P002").stock;
      return React.createElement("button", { onClick() {
        returned = dispatch({ type: "restocked", id: "P002", amount: 1 });
        dispatch({ type: "restocked", id: "P002", amount: 1 });
        observed = stock;
      } }, String(stock));
    }
    render(React.createElement(InventoryProvider, null, React.createElement(Probe)));
    fireEvent.click(screen.getByRole("button", { name: "0", exact: true }));
    expect(observed).toBe(0); expect(returned).toBeUndefined();
    expect(screen.getByRole("button", { name: "2", exact: true })).toBeTruthy();
  });

  test("两个 Provider 有独立商品来源，Context 不成为全局单例", () => {
    function Probe({ name }) {
      const { products, dispatch } = useInventory();
      const stock = products.find((product) => product.id === "P002").stock;
      return React.createElement("button", { onClick() { dispatch({ type: "restocked", id: "P002", amount: 1 }); } }, `${name}:${stock}`);
    }
    render(React.createElement(React.Fragment, null,
      React.createElement(InventoryProvider, null, React.createElement(Probe, { name: "A" })),
      React.createElement(InventoryProvider, null, React.createElement(Probe, { name: "B" }))));
    fireEvent.click(screen.getByRole("button", { name: "A:0", exact: true }));
    expect(screen.getByRole("button", { name: "A:1", exact: true })).toBeTruthy();
    expect(screen.getByRole("button", { name: "B:0", exact: true })).toBeTruthy();
  });
});
