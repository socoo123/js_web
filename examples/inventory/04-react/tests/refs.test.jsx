// @vitest-environment happy-dom
import { it, expect, vi } from "vitest";
import { useState } from "react";
import RefProbe from "../labs/RefProbe.jsx";
import RefCountFixed from "../labs/RefCountFixed.jsx";
import FocusForm from "../labs/FocusForm.jsx";
import FocusMountFixed from "../labs/FocusMountFixed.jsx";
import InventoryCounter from "../src/InventoryCounter.jsx";
import App from "../src/App.jsx";
import { mount, click, fill, advance } from "./state-harness.jsx";

it("事件中读写 ref，跨渲染保留；普通局部变量重新开始", async () => {
  const log = vi.spyOn(console, "log").mockImplementation(() => {});
  const host = await mount(<RefProbe />);
  await click("只记录日志");
  await click("只记录日志");
  expect(host.textContent).toContain("界面版本 0");
  await click("更新界面版本");
  await click("只记录日志");
  expect(log.mock.calls).toEqual([
    ["局部 / ref / state", 1, 1, 0], ["局部 / ref / state", 2, 2, 0], ["局部 / ref / state", 1, 3, 1],
  ]);
});

it("可见计数使用 state，备注输入保留且不影响计数", async () => {
  const host = await mount(<RefCountFixed />);
  await click("盘点一次");
  expect(host.textContent).toContain("已盘点 1 次");
  await fill(host.querySelector("input"), "下次再盘");
  await click("盘点一次");
  expect(host.textContent).toContain("已盘点 2 次");
  expect(host.querySelector("input").value).toBe("下次再盘");
});

it("提交后清空数量并聚焦仍然存在的输入节点", async () => {
  const host = await mount(<FocusForm />);
  const input = host.querySelector("input");
  await click("确认补货");
  expect(host.textContent).toContain("机械键盘：15 件");
  expect(input.value).toBe("");
  expect(document.activeElement).toBe(input);
});

it("打开条件子组件后，Effect 聚焦已经提交的输入", async () => {
  const host = await mount(<FocusMountFixed />);
  expect(host.querySelector("input")).toBeNull();
  await click("打开名称输入");
  expect(document.activeElement).toBe(host.querySelector("input"));
});

it("等待期间立即盘点触发重渲染，之后仍可以取消原定时器", async () => {
  vi.useFakeTimers();
  const host = await mount(<InventoryCounter />);
  await click("2 秒后记录 3 次");
  await click("记录 1 次");
  await click("取消延时记录");
  await advance(2000);
  expect(host.textContent).toContain("已记录 1 次盘点操作");
  expect(host.textContent).toContain("没有等待中的延时记录");
});

it("重复安排替换旧定时器，最新一条到期后只加三且可重新安排", async () => {
  vi.useFakeTimers();
  const host = await mount(<InventoryCounter />);
  await click("2 秒后记录 3 次");
  await advance(1000);
  await click("2 秒后记录 3 次");
  await advance(1000);
  expect(host.textContent).toContain("已记录 0 次盘点操作");
  await advance(1000);
  expect(host.textContent).toContain("已记录 3 次盘点操作");
  await click("2 秒后记录 3 次");
  await advance(2000);
  expect(host.textContent).toContain("已记录 6 次盘点操作");
});

it("各实例的取消句柄独立", async () => {
  vi.useFakeTimers();
  const host = await mount(<><InventoryCounter /><InventoryCounter /></>);
  const [first, second] = host.querySelectorAll("section");
  await click("2 秒后记录 3 次", first);
  await click("2 秒后记录 3 次", second);
  await click("取消延时记录", first);
  await advance(2000);
  expect(first.textContent).toContain("已记录 0 次盘点操作");
  expect(second.textContent).toContain("已记录 3 次盘点操作");
});

it("隐藏组件撤销等待中的外部任务，重新挂载从零开始", async () => {
  vi.useFakeTimers();
  function Toggle() {
    const [shown, setShown] = useState(true);
    return <><button onClick={() => setShown((value) => !value)}>切换盘点区</button>
      {shown && <InventoryCounter />}</>;
  }
  const host = await mount(<Toggle />);
  await click("2 秒后记录 3 次");
  expect(vi.getTimerCount()).toBe(1);
  await click("切换盘点区");
  expect(vi.getTimerCount()).toBe(0);
  await advance(2000);
  await click("切换盘点区");
  expect(host.textContent).toContain("已记录 0 次盘点操作");
});

it("编辑首次挂载聚焦名称，输入后保留当前焦点；切换商品再聚焦新名称", async () => {
  const host = await mount(<App />);
  const card = (id) => [...host.querySelectorAll("article")].find((node) => node.textContent.includes(id));
  await click("编辑", card("P001"));
  expect(document.activeElement).toBe(host.querySelector('[name="name"]'));
  const price = host.querySelector('[name="price"]');
  price.focus();
  await fill(price, "399.50");
  expect(document.activeElement).toBe(price);
  await click("编辑", card("P002"));
  expect(document.activeElement).toBe(host.querySelector('[name="name"]'));
  expect(document.activeElement.value).toBe("无线鼠标");
});
