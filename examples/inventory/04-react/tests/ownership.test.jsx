// @vitest-environment happy-dom
import { it, expect } from "vitest";
import { act } from "react";
import { TestApp as App } from "./router-harness.jsx";
import SharedStock from "../labs/SharedStock.jsx";
import SwitchProductFixed from "../labs/SwitchProductFixed.jsx";
import IdentityProbe from "../labs/IdentityProbe.jsx";
import { mount, click, fill } from "./state-harness.jsx";

const card = (host, id) => [...host.querySelectorAll("article")].find((node) => node.textContent.includes(id));
const editor = (host) => host.querySelector("#product-editor");
const input = (host, name) => host.querySelector(`[name="${name}"]`);

it("共享父节点更新一份商品，使子组件和统计同步", async () => {
  const host = await mount(<SharedStock />);
  await click("给鼠标补 1 件");
  expect(host.textContent).toContain("鼠标库存：1 件");
  expect(host.querySelector('[role="status"]').textContent).toBe("总库存 53 件");
});

it("商品 key 改变时重置整份草稿和校验错误", async () => {
  const host = await mount(<SwitchProductFixed />);
  await fill(input(host, "name"), " ");
  await click("保存商品");
  expect(host.querySelector('[role="alert"]')).not.toBeNull();
  await click("选择 P002");
  expect(input(host, "name").value).toBe("无线鼠标");
  expect(input(host, "stock").value).toBe("0");
  expect(input(host, "price").value).toBe("129.00");
  expect(host.querySelector('[role="alert"]')).toBeNull();
  await click("选择 P001");
  expect(input(host, "name").value).toBe("机械键盘");
});

it("同位置同类型切换 props 保留状态，更换祖先类型和移除会重置", async () => {
  const host = await mount(<IdentityProbe />);
  await click("盘点 0 次");
  await click("切换强调");
  expect(host.textContent).toContain("盘点 1 次");
  await click("更换容器类型");
  expect(host.textContent).toContain("盘点 0 次");
  await click("盘点 0 次");
  await click("显示或隐藏计数器");
  expect(host.textContent).not.toContain("盘点 1 次");
  await click("显示或隐藏计数器");
  expect(host.textContent).toContain("盘点 0 次");
});

it("只有一个编辑区，同商品保留草稿，切换商品及返回均重新初始化", async () => {
  const host = await mount(<App />);
  await click("编辑", card(host, "P001"));
  await fill(input(host, "name"), "键盘待盘点");
  await click("编辑", card(host, "P001"));
  expect(input(host, "name").value).toBe("键盘待盘点");
  expect(card(host, "P001").querySelector("form")).toBeNull();
  expect([...card(host, "P001").querySelectorAll("button")].find((node) => node.textContent === "补 1 件").disabled).toBe(true);
  await click("编辑", card(host, "P002"));
  expect(host.querySelectorAll("form")).toHaveLength(1);
  expect(input(host, "name").value).toBe("无线鼠标");
  expect(input(host, "stock").value).toBe("0");
  expect(card(host, "P001").querySelector('[aria-expanded]').getAttribute("aria-expanded")).toBe("false");
  expect(card(host, "P002").querySelector('[aria-expanded]').getAttribute("aria-expanded")).toBe("true");
  await click("编辑", card(host, "P001"));
  expect(input(host, "name").value).toBe("机械键盘");
});

it("筛选隐藏当前卡片及排序不卸载编辑器，隐藏后取消把焦点交给标题", async () => {
  const host = await mount(<App />);
  await click("编辑", card(host, "P001"));
  await fill(input(host, "name"), "保留中的键盘草稿");
  const form = editor(host).querySelector("form");
  const sort = host.querySelector('[aria-label="排序"]');
  await act(async () => { sort.value = "stock"; sort.dispatchEvent(new Event("change", { bubbles: true })); });
  expect(editor(host).querySelector("form")).toBe(form);
  await fill(host.querySelector("input"), "鼠标");
  expect(card(host, "P001")).toBeUndefined();
  expect(editor(host).querySelector("form")).toBe(form);
  expect(input(host, "name").value).toBe("保留中的键盘草稿");
  await click("取消编辑", editor(host));
  expect(host.querySelector("form")).toBeNull();
  expect(document.activeElement.id).toBe("inventory-heading");
});

it("隐藏列表中的当前商品仍可保存，重新显示后列表与统计使用保存值", async () => {
  const host = await mount(<App />);
  await click("编辑", card(host, "P002"));
  await fill(input(host, "stock"), "3");
  await fill(input(host, "price"), "129.90");
  await fill(host.querySelector("input"), "键盘");
  await click("保存商品", editor(host));
  expect(host.textContent).toContain("总库存 55 件");
  expect(host.textContent).toContain("¥26737.70");
  await fill(host.querySelector("input"), "");
  expect(card(host, "P002").textContent).toContain("库存：3 件");
  await click("编辑", card(host, "P002"));
  expect(input(host, "stock").value).toBe("3");
  expect(input(host, "price").value).toBe("129.90");
});

it("删除其他商品保留草稿，删除当前商品关闭编辑并安排焦点", async () => {
  const host = await mount(<App />);
  await click("编辑", card(host, "P001"));
  await fill(input(host, "name"), "尚未保存");
  await click("删除", card(host, "P002"));
  expect(input(host, "name").value).toBe("尚未保存");
  await click("删除", card(host, "P001"));
  expect(host.querySelector("form")).toBeNull();
  expect(host.textContent).toContain("已删除 P001，编辑已结束。");
  expect(host.textContent).toContain("总库存 40 件");
  expect(document.activeElement.id).toBe("inventory-heading");
});
