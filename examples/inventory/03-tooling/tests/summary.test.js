import { describe, it, expect } from "vitest";
import { products } from "../../../shared/products.js";
import { Inventory } from "../../01-core/inventory.js";

describe("Inventory.summary", () => {
  it("统计固定商品的库存、金额和状态", () => {
    const inventory = new Inventory(structuredClone(products)); // Arrange
    const summary = inventory.summary(); // Act
    expect(summary).toEqual({ // Assert
      totalStock: 52,
      totalValueCents: 2634800,
      soldOutCount: 1,
      lowStockCount: 2,
    });
  });

  it("空数组得到零统计", () => {
    expect(new Inventory([]).summary()).toEqual({
      totalStock: 0, totalValueCents: 0, soldOutCount: 0, lowStockCount: 0,
    });
  });

  it.each([[0, 0], [1, 1], [5, 1], [6, 0]])(
    "库存为 %i 时低库存计数为 %i", (stock, expected) => {
      const row = { ...products[3], stock };
      expect(new Inventory([row]).summary().lowStockCount).toBe(expected);
    },
  );

  it("统计不修改商品", () => {
    const rows = structuredClone(products);
    const before = structuredClone(rows);
    new Inventory(rows).summary();
    expect(rows).toEqual(before);
  });
});
