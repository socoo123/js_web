import { expect, test } from "vitest";
import { products } from "../../../shared/products.js";
import { saveDraft, summarize, toDraft } from "../src/editor-state.js";

const mouse = products.find((product) => product.id === "P002");
test("售罄保存为数字 3，创建新数组并保留其他商品引用", () => {
  const result = saveDraft(products, mouse.id, { ...toDraft(mouse), stock: "3" });
  expect(result.value.stock).toBe(3);
  expect(mouse.stock).toBe(0);
  expect(result.products).not.toBe(products);
  expect(result.products[0]).toBe(products[0]);
  expect(summarize(result.products)).toBe("总库存 55 · 库存价值 26735.00 元");
});
test("固定数据基线保持一致", () => {
  expect(summarize(products)).toBe("总库存 52 · 库存价值 26348.00 元");
});
test("空库存、负数、小数、超界与非法价格均拦截提交", () => {
  for (const stock of ["", " ", "-1", "3.8", "100000", "3件"]) {
    const result = saveDraft(products, mouse.id, { ...toDraft(mouse), stock });
    expect(result.errors.stock).toBeTruthy();
    expect(result.products).toBe(products);
  }
  for (const price of ["", "-1", "1.234", "3元"]) {
    expect(saveDraft(products, mouse.id, { ...toDraft(mouse), price }).errors.price).toBeTruthy();
  }
  expect(saveDraft(products, mouse.id, { ...toDraft(mouse), stock: "0", price: "0" }).value)
    .toMatchObject({ stock: 0, priceCents: 0 });
});
test("名称去空白、分类白名单和标签保留沿用同一业务规则", () => {
  const dock = products.find((product) => product.id === "P004");
  expect(saveDraft(products, dock.id, { ...toDraft(dock), name: "  扩展坞  ", featured: false }).value)
    .toMatchObject({ name: "扩展坞", tags: ["新品"] });
  expect(saveDraft(products, dock.id, { ...toDraft(dock), name: " ", category: "其他" }).errors)
    .toHaveProperty("category");
  expect(saveDraft(products, dock.id, { ...toDraft(dock), name: "x".repeat(41) }).errors.name).toBeTruthy();
});
