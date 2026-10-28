// region imports
import { describe, it, expect } from "vitest";
import { parseStock, parsePriceCents, parseDraft, toDraft, summarize, updateStock } from "../../src/core/inventory.js";
import products from "../../data/products.json" with { type: "json" };
// endregion imports
// region tests
describe("库存边界", () => {
  it.each([["0", 0], ["3", 3], [" 3 ", 3]])("合法库存 %s", (text, stock) => {
    expect(parseStock(text)).toBe(stock);
  });
  it.each(["", " ", "3件", "-1", "3.5", "100000"])("拒绝非法库存 %s", (text) => {
    expect(() => parseStock(text)).toThrow();
  });
  it("固定统计与空列表", () => {
    expect(summarize(products)).toEqual({ count: 6, stock: 52, valueCents: 2634800, soldOut: 1, lowStock: 2 });
    expect(summarize([]).valueCents).toBe(0);
  });
  it("按 id 更新且不污染输入", () => {
    const next = updateStock(products, "P004", 8);
    expect(next[3].stock).toBe(8);
    expect(next[0].stock).toBe(12);
    expect(products[3].stock).toBe(3);
    expect(next[3]).not.toBe(products[3]);
  });
});
// endregion tests
// region price-tests
it("价格按十进制文本转为整数分", () => {
  expect(parsePriceCents("0.29")).toBe(29);
  expect(() => parsePriceCents("1.001")).toThrow();
  expect(() => parsePriceCents("90071992547409.92")).toThrow();
});
it("表单草稿独立，空白报错而零有效", () => {
  const draft = toDraft(products[3]); draft.tags.push("仅草稿");
  expect(products[3].tags).toEqual(["热销", "新品"]);
  expect(parseDraft({ ...draft, stock: "" }).hasErrors).toBe(true);
  expect(parseDraft({ ...draft, stock: "0" }).value.stock).toBe(0);
});
// endregion price-tests
