import { describe, it, expect } from "vitest";
import { products } from "../../../shared/products.js";
import { Inventory } from "../../01-core/inventory.js";
import { parseStock } from "../../02-web/validation.js";

describe("库存修改", () => {
  it("补货与撤销同步改变统计", () => {
    const inventory = new Inventory(structuredClone(products));
    expect(inventory.setStock("P002", 3)).toBe(true);
    expect(inventory.summary()).toEqual({
      totalStock: 55, totalValueCents: 2673500, soldOutCount: 0, lowStockCount: 3,
    });
    expect(inventory.undo()).toBe(true);
    expect(inventory.getById("P002").stock).toBe(0);
    expect(inventory.summary().totalStock).toBe(52);
  });

  it.each([-1, 3.8, 100000, NaN, "3", null, undefined])(
    "非法库存 %s 被拒绝，原库存和撤销栈保留", stock => {
      const inventory = new Inventory(structuredClone(products));
      expect(() => inventory.setStock("P001", stock)).toThrow(RangeError);
      expect(inventory.getById("P001").stock).toBe(12);
      expect(inventory.undo()).toBe(false);
    },
  );

  it.each([0, 99999])("允许库存端点 %i", stock => {
    const inventory = new Inventory(structuredClone(products));
    inventory.setStock("P001", stock);
    expect(inventory.getById("P001").stock).toBe(stock);
  });
});

describe("parseStock", () => {
  it.each([["0", 0], [" 3 ", 3], ["99999", 99999]])(
    "文本 %s 转成 %i", (text, expected) => expect(parseStock(text)).toBe(expected),
  );
  it.each(["", "  ", "-1", "3.8", "3件", "100000"])(
    "文本 %s 无效", text => expect(parseStock(text)).toBeNull(),
  );
});
