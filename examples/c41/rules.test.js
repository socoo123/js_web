import { expect, test } from "../inventory/04-react/node_modules/vitest/dist/index.js";
import { products } from "../shared/products.js";
import { rules, loadModule } from "./load-rules.js";

test("草稿保持输入文本，取消不泄漏，保存保留编号与标签", () => {
  const original = structuredClone(products[3]);
  const draft = rules.toDraft(original);
  draft.name = "  USB-C 扩展坞  "; draft.stock = "0"; draft.price = "299.01";
  expect(original).toEqual(products[3]);
  const result = rules.parseDraft(draft);
  expect(result.hasErrors).toBe(false);
  expect({ ...original, ...result.value }).toEqual({ ...original, stock: 0, priceCents: 29901 });
});

test("空白、负数、小数库存和非法分类不能提交；金额用整数分解析", () => {
  for (const change of [
    { name: " " }, { name: "名".repeat(41) }, { category: "其他" },
    ...["", "-1", "3.8", "100000", "Infinity", "3件"].map((stock) => ({ stock })),
    ...["", "-1", "1.234", "1e2", "90071992547409.92"].map((price) => ({ price })),
  ]) expect(rules.parseDraft({ ...rules.toDraft(products[1]), ...change }).value).toBeNull();
  for (const [price, cents] of [["0", 0], ["1.23", 123], ["129.00", 12900], ["90071992547409.91", Number.MAX_SAFE_INTEGER]]) {
    const draft = { ...rules.toDraft(products[1]), stock: "0", price };
    expect(rules.parseDraft(draft).value).toEqual({ name: "无线鼠标", category: "外设", stock: 0, priceCents: cents });
  }
});

test("汇总使用当前集合，空集合为零；金额显示不修改分值", () => {
  expect(rules.summarize(products)).toEqual({ count: 6, stock: 52, valueCents: 2634800 });
  expect(rules.summarize([products[3]])).toEqual({ count: 1, stock: 3, valueCents: 89700 });
  expect(rules.summarize([])).toEqual({ count: 0, stock: 0, valueCents: 0 });
  expect(loadModule("formatter").money(0)).toBe("0.00");
  expect(loadModule("formatter").money(Number.MAX_SAFE_INTEGER)).toBe("90071992547409.91");
  expect(rules.toDraft({ ...products[1], priceCents: Number.MAX_SAFE_INTEGER }).price).toBe("90071992547409.91");
});
