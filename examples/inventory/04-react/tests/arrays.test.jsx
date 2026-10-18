// @vitest-environment happy-dom
import { it, expect } from "vitest";
import { act } from "react";
import { TestApp as App } from "./router-harness.jsx";
import MutationFixed from "../labs/MutationFixed.jsx";
import StableKeys from "../labs/StableKeys.jsx";
import DerivedFixed from "../labs/DerivedFixed.jsx";
import { products } from "../../../shared/products.js";
import { mount, click } from "./state-harness.jsx";
import { restockProduct } from "../src/product-state.js";

async function select(host, label, value) {
  const node = [...host.querySelectorAll("label")].find((item) => item.textContent.startsWith(label)).querySelector("select");
  await act(async () => {
    node.value = value;
    node.dispatchEvent(new Event("change", { bubbles: true }));
  });
}
const card = (host, id) => [...host.querySelectorAll("article")].find((node) => node.textContent.includes(id));

it("补货产生新记录，旧快照及共享数据保留原值", () => {
  const before = Object.freeze(products.map((product) => Object.freeze({ ...product, tags: Object.freeze([...product.tags]) })));
  const after = restockProduct(before, "P001");
  expect(before[0].stock).toBe(12);
  expect(after[0].stock).toBe(13);
  expect(after[1]).toBe(before[1]);
});

it("补货按钮能连续更新页面", async () => {
  const host = await mount(<MutationFixed />);
  await click("给键盘补 1 件");
  await click("给键盘补 1 件");
  expect(host.querySelector('[role="status"]').textContent).toBe("库存：14 件");
});

it("删除前一行后，鼠标仍保留自己的编辑草稿", async () => {
  const host = await mount(<StableKeys />);
  await click("删除 P001");
  expect(host.querySelector("input").value).toBe("无线鼠标");
  expect(host.querySelector("article").textContent).toContain("P002");
});

it("补货后筛选结果随源数据更新", async () => {
  const host = await mount(<DerivedFixed />);
  await click("给鼠标补 1 件");
  expect(host.querySelector('[role="status"]').textContent).toBe("筛选库存：1 件");
});

it("排序后按商品 id 补货，分类切换与删除都更新统计", async () => {
  const host = await mount(<App />);
  await select(host, "排序", "stock");
  expect(host.querySelector("article").textContent).toContain("P002");
  await click("补 1 件", card(host, "P002"));
  expect(card(host, "P002").textContent).toContain("库存：1 件");
  expect(host.textContent).toContain("总库存 53 件");
  expect(host.textContent).toContain("¥26477.00");
  await select(host, "分类", "外设");
  expect(host.querySelectorAll("article")).toHaveLength(2);
  await click("删除", card(host, "P001"));
  expect(host.querySelectorAll("article")).toHaveLength(1);
  expect(host.textContent).toContain("总库存 41 件");
  await select(host, "分类", "全部");
  expect(host.querySelectorAll("article")).toHaveLength(5);
  expect(card(host, "P002").textContent).toContain("库存：1 件");
  expect(products[1].stock).toBe(0);
});

it("新增商品获得自己的编号，删除至空后可重新新增", async () => {
  const host = await mount(<App />);
  await click("新增示例商品");
  await click("新增示例商品");
  expect(card(host, "P007").textContent).toContain("新商品");
  expect(card(host, "P008").textContent).toContain("库存：0 件");
  while (host.querySelector("article")) await click("删除", host.querySelector("article"));
  expect(host.textContent).toContain("共 0 种商品");
  expect(host.textContent).toContain("没有匹配的商品。");
  expect(host.textContent).toContain("总库存 0 件");
  await click("新增示例商品");
  expect(host.querySelectorAll("article")).toHaveLength(1);
});
