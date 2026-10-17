import { it, expect } from "vitest";
import { products } from "../../../shared/products.js";
import { loadInventory } from "../../01-core/inventory.js";

it("等待加载成功再读取统计", async () => {
  const inventory = await loadInventory(products, { delayMs: 0 });
  expect(inventory.summary().totalStock).toBe(52);
});

it("加载失败向调用方传递错误", async () => {
  await expect(loadInventory(products, { fail: true, delayMs: 0 }))
    .rejects.toThrow("库存加载失败");
});
