// @vitest-environment happy-dom
import { it, expect, vi } from "vitest";
import { act } from "react";
import ProductForm from "../src/ProductForm.jsx";
import App from "../src/App.jsx";
import ControlledName from "../labs/ControlledName.jsx";
import BlankStockFixed from "../labs/BlankStockFixed.jsx";
import { products } from "../../../shared/products.js";
import { parseStock, parsePriceCents, toDraft, validateDraft } from "../src/product-form.js";
import { updateProduct } from "../src/product-state.js";
import { mount, click, fill } from "./state-harness.jsx";

it.each(["", " ", "-1", "3.5", "100000", "1e2", "3件"])("库存文本 %j 不能变成合法业务库存", (raw) => {
  expect(parseStock(raw)).toBeNull();
});

it.each(["", "-0.01", "1.001", "3元", "1e2", "90071992547409.92"])("非法价格 %j 不截断或舍入保存", (raw) => {
  expect(parsePriceCents(raw)).toBeNull();
});

it("保留库存 0 和上限，金额按十进制文本转换为安全整数分", () => {
  expect(parseStock(" 0 ")).toBe(0);
  expect(parseStock("99999")).toBe(99999);
  expect(parsePriceCents("0.29")).toBe(29);
  expect(parsePriceCents("129.9")).toBe(12990);
  expect(parsePriceCents("0")).toBe(0);
  expect(parsePriceCents("90071992547409.91")).toBe(Number.MAX_SAFE_INTEGER);
  const expensive = { ...products[1], priceCents: Number.MAX_SAFE_INTEGER - 1 };
  expect(toDraft(expensive).price).toBe("90071992547409.90");
  expect(parsePriceCents(toDraft(expensive).price)).toBe(expensive.priceCents);
});

it("全部字段通过才产出业务记录，分类与去空格后的名称仍需校验", () => {
  const draft = { ...toDraft(products[1]), name: " ", category: "未知", stock: "-1", price: "0.001" };
  expect(validateDraft(draft)).toEqual({ value: null, errors: {
    name: expect.any(String), category: expect.any(String), stock: expect.any(String), price: expect.any(String),
  } });
  expect(validateDraft({ ...toDraft(products[1]), name: "名".repeat(41) }).value).toBeNull();
});

it("取消热销保留新品，添加热销不重复且不修改旧商品", () => {
  const before = Object.freeze(products.map((product) => Object.freeze({ ...product, tags: Object.freeze([...product.tags]) })));
  const result = validateDraft({ ...toDraft(before[3]), name: "  USB-C 扩展坞  ", featured: false }, before[3].tags);
  const after = updateProduct(before, "P004", result.value);
  expect(after[3].name).toBe("USB-C 扩展坞");
  expect(after[3].tags).toEqual(["新品"]);
  expect(before[3].tags).toEqual(["热销", "新品"]);
  expect(after[0]).toBe(before[0]);
  expect(after[3].id).toBe("P004");
  expect(validateDraft(toDraft(before[3]), before[3].tags).value.tags).toEqual(["热销", "新品"]);
});

it("受控输入接受用户输入并可以完全清空", async () => {
  const host = await mount(<ControlledName />);
  await fill(host.querySelector("input"), "键盘待盘点");
  expect(host.querySelector("input").value).toBe("键盘待盘点");
  await fill(host.querySelector("input"), "");
  expect(host.querySelector("input").value).toBe("");
});

it("空库存显示错误，合法的 0 仍可以提交", async () => {
  const host = await mount(<BlankStockFixed />);
  await click("保存库存");
  expect(host.textContent).toContain("库存无效");
  await fill(host.querySelector("input"), "0");
  await click("保存库存");
  expect(host.textContent).toContain("已保存库存 0");
});

it("多字段失败时禁止保存、关联错误说明并聚焦第一个错误", async () => {
  const save = vi.fn();
  const host = await mount(<ProductForm product={products[1]} onSave={save} onCancel={() => {}} />);
  await fill(host.querySelector('[name="name"]'), "   ");
  await fill(host.querySelector('[name="stock"]'), "-1");
  await fill(host.querySelector('[name="price"]'), "129.999");
  await click("保存商品");
  expect(save).not.toHaveBeenCalled();
  expect(host.querySelectorAll('[aria-invalid="true"]')).toHaveLength(3);
  expect(document.activeElement).toBe(host.querySelector('[name="name"]'));
  for (const input of host.querySelectorAll('[aria-invalid="true"]')) {
    expect(document.getElementById(input.getAttribute("aria-describedby")).textContent.length).toBeGreaterThan(0);
  }
  expect(host.querySelector('[role="alert"]').textContent).toContain("保存失败");
});

it("草稿直到提交才更新列表，转换后的数字和标签同时刷新统计", async () => {
  const host = await mount(<App />);
  let card = [...host.querySelectorAll("article")].find((node) => node.textContent.includes("P002"));
  await click("编辑", card);
  expect(document.activeElement).toBe(card.querySelector('[name="name"]'));
  await fill(card.querySelector('[name="stock"]'), "3");
  await fill(card.querySelector('[name="price"]'), "129.90");
  await fill(card.querySelector('[name="name"]'), "  无线鼠标  ");
  await act(async () => card.querySelector('[name="featured"]').click());
  expect(host.textContent).toContain("总库存 52 件");
  await click("保存商品", card);
  card = [...host.querySelectorAll("article")].find((node) => node.textContent.includes("P002"));
  expect(card.querySelector("form")).toBeNull();
  expect(card.querySelector("h2").textContent).toBe("无线鼠标");
  expect(card.textContent).toContain("库存：3 件");
  expect(card.textContent).toContain("129.90");
  expect(card.textContent).toContain("标签：热销");
  expect(host.textContent).toContain("总库存 55 件");
  expect(host.textContent).toContain("¥26737.70");
  expect(document.activeElement.id).toBe("inventory-heading");
  expect(products[1].stock).toBe(0);
});

it("取消不保存，焦点返回编辑按钮，再次打开读取已保存值", async () => {
  const host = await mount(<App />);
  const card = host.querySelector("article");
  await click("编辑", card);
  await fill(card.querySelector('[name="name"]'), "放弃的草稿");
  await click("取消编辑", card);
  expect(card.querySelector("h2").textContent).toBe("机械键盘");
  expect(document.activeElement.id).toBe("open-editor-P001");
  await click("编辑", card);
  expect(card.querySelector('[name="name"]').value).toBe("机械键盘");
});

it("保存后即使商品移出筛选，仍有持久的成功反馈和焦点目标", async () => {
  const host = await mount(<App />);
  await fill(host.querySelector("input"), "鼠标");
  const card = host.querySelector("article");
  await click("编辑", card);
  await fill(card.querySelector('[name="name"]'), "办公指针");
  await click("保存商品", card);
  expect(host.querySelector("article")).toBeNull();
  expect(host.textContent).toContain("已保存 P002");
  expect(document.activeElement.id).toBe("inventory-heading");
  await fill(host.querySelector("input"), "");
  expect(host.textContent).toContain("办公指针");
});
