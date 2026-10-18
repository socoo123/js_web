// @vitest-environment happy-dom
import { it, expect, vi } from "vitest";
import { act, useRef, useState } from "react";
import { products } from "../../../shared/products.js";
import WatchControls from "../labs/WatchControls.jsx";
import IntervalFixed from "../labs/IntervalFixed.jsx";
import LoopFixed from "../labs/LoopFixed.jsx";
import { TestApp as App } from "./router-harness.jsx";
import InventorySearchShortcut from "../src/InventorySearchShortcut.jsx";
import { mount, click, fill, advance } from "./state-harness.jsx";

it("首次开发检查配对 setup/cleanup，商品切换先清旧订阅再建新订阅", async () => {
  const log = vi.spyOn(console, "log").mockImplementation(() => {});
  await mount(<WatchControls />);
  expect(log.mock.calls).toEqual([["setup", "P001"], ["cleanup", "P001"], ["setup", "P001"]]);
  log.mockClear();
  await click("切换商品");
  expect(log.mock.calls).toEqual([["cleanup", "P001"], ["setup", "P002"]]);
  await click("发一条通知");
  expect(log.mock.calls.at(-1)).toEqual(["收到", "P002"]);
});

it("无关输入与通知导致重渲染，依赖未变时不重新订阅", async () => {
  const log = vi.spyOn(console, "log").mockImplementation(() => {});
  const host = await mount(<WatchControls />);
  log.mockClear();
  await fill(host.querySelector("input"), "保留订阅");
  await click("发一条通知");
  await click("发一条通知");
  expect(log.mock.calls).toEqual([["收到", "P001"], ["收到", "P001"]]);
  expect(host.querySelector('[role="status"]').textContent).toContain("收到 2 次通知");
});

it("隐藏后没有遗留监听，重挂载一次通知仍只记一次", async () => {
  const log = vi.spyOn(console, "log").mockImplementation(() => {});
  const host = await mount(<WatchControls />);
  await click("显示或隐藏监听");
  expect(log.mock.calls.at(-1)).toEqual(["cleanup", "P001"]);
  log.mockClear();
  await click("发一条通知");
  expect(log).not.toHaveBeenCalled();
  await click("显示或隐藏监听");
  await click("发一条通知");
  expect(host.querySelector('[role="status"]').textContent).toContain("收到 1 次通知");
});

it("函数式更新使空依赖 interval 每秒继续增长，而非停在旧快照的一", async () => {
  vi.useFakeTimers();
  const host = await mount(<IntervalFixed />);
  expect(vi.getTimerCount()).toBe(1);
  await advance(1000);
  expect(host.textContent).toBe("已检查 1 次");
  await advance(2000);
  expect(host.textContent).toBe("已检查 3 次");
});

it("interval 移除时清除最后的计时器", async () => {
  vi.useFakeTimers();
  function Toggle() {
    const [shown, setShown] = useState(true);
    return <><button onClick={() => setShown(false)}>停止检查</button>{shown && <IntervalFixed />}</>;
  }
  await mount(<Toggle />);
  await click("停止检查");
  expect(vi.getTimerCount()).toBe(0);
});

it("直接计算有货商品，来源更新后同步得到新结果且没有 Effect 循环", async () => {
  function Restock() {
    const [items, setItems] = useState(products);
    return <><button onClick={() => setItems((items) => items.map((item) => item.id === "P002"
      ? { ...item, stock: 1 } : item))}>补货鼠标</button><LoopFixed products={items} /></>;
  }
  const host = await mount(<Restock />);
  expect(host.textContent).toContain("有货 5 种");
  await click("补货鼠标");
  expect(host.textContent).toContain("有货 6 种");
});

it("标题同步真实总库存，补货后更新；筛选不改变全部库存", async () => {
  const host = await mount(<App />);
  expect(document.title).toBe("库存管理 · 52 件");
  const mouse = [...host.querySelectorAll("article")].find((node) => node.textContent.includes("P002"));
  await click("补 1 件", mouse);
  expect(document.title).toBe("库存管理 · 53 件");
  await fill(host.querySelector("header input"), "键盘");
  expect(document.title).toBe("库存管理 · 53 件");
});

it("标题依赖变化后仍能在卸载时恢复进入应用前的标题", async () => {
  document.title = "原页面标题";
  function Toggle() {
    const [shown, setShown] = useState(true);
    return <><button onClick={() => setShown(false)}>关闭库存</button>{shown && <App />}</>;
  }
  const host = await mount(<Toggle />);
  const mouse = [...host.querySelectorAll("article")].find((node) => node.textContent.includes("P002"));
  await click("补 1 件", mouse);
  await click("关闭库存");
  expect(document.title).toBe("原页面标题");
});

function ShortcutDemo() {
  const searchRef = useRef(null);
  const [shown, setShown] = useState(true);
  return <><button onClick={() => setShown(false)}>关闭快捷键</button>
    {shown && <InventorySearchShortcut inputRef={searchRef} />}
    <input ref={searchRef} aria-label="搜索" /><input aria-label="编辑名称" />
    <div contentEditable suppressContentEditableWarning>草稿</div></>;
}

async function key(target = window, options = {}) {
  const event = new KeyboardEvent("keydown", { key: "/", bubbles: true, cancelable: true, ...options });
  await act(async () => target.dispatchEvent(event));
  return event;
}

it("StrictMode 检查后一个快捷键只聚焦一次，卸载后不再拦截", async () => {
  const host = await mount(<ShortcutDemo />);
  const search = host.querySelector("input");
  const focus = vi.spyOn(search, "focus");
  expect((await key()).defaultPrevented).toBe(true);
  expect(document.activeElement).toBe(search);
  expect(focus).toHaveBeenCalledTimes(1);
  await click("关闭快捷键");
  focus.mockClear();
  expect((await key()).defaultPrevented).toBe(false);
  expect(focus).not.toHaveBeenCalled();
});

it("编辑控件和可编辑区内输入斜线保持原焦点与默认输入行为", async () => {
  const host = await mount(<ShortcutDemo />);
  for (const target of [host.querySelectorAll("input")[1], host.querySelector("[contenteditable]")]) {
    target.focus();
    expect((await key(target)).defaultPrevented).toBe(false);
    expect(document.activeElement).toBe(target);
  }
});

it("修饰键、输入法合成及已处理事件不触发搜索快捷键", async () => {
  const host = await mount(<ShortcutDemo />);
  const focus = vi.spyOn(host.querySelector("input"), "focus");
  for (const options of [{ ctrlKey: true }, { metaKey: true }, { altKey: true }, { isComposing: true }]) {
    expect((await key(window, options)).defaultPrevented).toBe(false);
  }
  const event = new KeyboardEvent("keydown", { key: "/", cancelable: true });
  event.preventDefault();
  await act(async () => window.dispatchEvent(event));
  expect(focus).not.toHaveBeenCalled();
});
