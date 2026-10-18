// @vitest-environment happy-dom
import { afterEach, it, expect, vi } from "vitest";
import { useState } from "react";
import HookCounters from "../labs/HookCounters.jsx";
import StoredNotes from "../labs/StoredNotes.jsx";
import { useLocalStorage } from "../src/useLocalStorage.js";
import ProductDetails from "../src/ProductDetails.jsx";
import { mount, click, fill } from "./state-harness.jsx";
import { controlledLoader, resolveProduct } from "./request-harness.jsx";

afterEach(() => { vi.unstubAllGlobals(); localStorage.clear(); });

it("调用同一个 Hook 两次仍是两个独立计数器", async () => {
  const host = await mount(<HookCounters />);
  await click("盘点 A：0");
  await click("盘点 A：1");
  expect(host.textContent).toBe("盘点 A：2盘点 B：0");
});

it("两个请求 Hook 的取消与完成互不干扰", async () => {
  const api = controlledLoader();
  const host = await mount(<><div id="a"><ProductDetails productId="P001" loadProduct={api.load} /></div>
    <div id="b"><ProductDetails productId="P002" loadProduct={api.load} /></div></>);
  await click("取消加载", host.querySelector("#a"));
  await resolveProduct(api.latest());
  expect(host.querySelector("#a").textContent).toContain("已取消 P001");
  expect(host.querySelector("#b").textContent).toContain("详情已加载：P002");
});

it("模块级 loader 在无关重渲染时保持身份，不重复发请求", async () => {
  const api = controlledLoader();
  function Probe() {
    const [count, setCount] = useState(0);
    return <><button onClick={() => setCount(count + 1)}>其他操作 {count}</button>
      <ProductDetails productId="P001" loadProduct={api.load} /></>;
  }
  await mount(<Probe />);
  const calls = api.calls.length;
  await click("其他操作 0");
  expect(api.calls).toHaveLength(calls);
});

it("初始读取已有文本，首次挂载不写回；StrictMode 保持读取无写入", async () => {
  localStorage.setItem("js_web:c31:note:A", JSON.stringify("先盘点鼠标"));
  const storage = localStorage;
  const spy = vi.fn();
  vi.stubGlobal("localStorage", { getItem: (key) => storage.getItem(key), setItem: spy });
  const host = await mount(<StoredNotes />);
  expect(host.querySelector("input").value).toBe("先盘点鼠标");
  expect(spy).not.toHaveBeenCalled();
});

it.each(["broken", "0", "null", "{}"])("损坏或非文本记录 %s 恢复默认，用户编辑后可恢复正常保存", async (raw) => {
  localStorage.setItem("js_web:c31:note:A", raw);
  const host = await mount(<StoredNotes />);
  expect(host.querySelector("input").value).toBe("");
  expect(host.querySelector('[role="alert"]').textContent).toContain("无法读取");
  expect(localStorage.getItem("js_web:c31:note:A")).toBe(raw);
  await fill(host.querySelector("input"), "新备注");
  expect(host.querySelector('[role="alert"]')).toBeNull();
  expect(JSON.parse(localStorage.getItem("js_web:c31:note:A"))).toBe("新备注");
});

it("保存失败仍显示本次输入并提示，恢复存储后可以重试", async () => {
  const host = await mount(<StoredNotes />);
  const storage = localStorage;
  const spy = vi.fn(() => { throw new Error("QuotaExceededError"); });
  vi.stubGlobal("localStorage", { getItem: (key) => storage.getItem(key), setItem: spy });
  await fill(host.querySelector("input"), "未落盘");
  expect(host.querySelector("input").value).toBe("未落盘");
  expect(host.querySelector('[role="alert"]').textContent).toContain("保存失败");
  spy.mockImplementation((key, value) => storage.setItem(key, value));
  await fill(host.querySelector("input"), "已落盘");
  expect(host.querySelector('[role="alert"]')).toBeNull();
  expect(JSON.parse(localStorage.getItem("js_web:c31:note:A"))).toBe("已落盘");
});

it("读取权限失败时保留默认文本并提示", async () => {
  vi.stubGlobal("localStorage", { getItem: () => { throw new Error("SecurityError"); } });
  const host = await mount(<StoredNotes />);
  expect(host.querySelector("input").value).toBe("");
  expect(host.querySelectorAll('[role="alert"]')).toHaveLength(2);
});

it("即使传入相同 key，两个 Hook 也不自动同步 React state", async () => {
  function Note({ name }) {
    const [value, save] = useLocalStorage("shared-note", "");
    return <label>{name}<input value={value} onChange={(event) => save(event.target.value)} /></label>;
  }
  const host = await mount(<><Note name="A" /><Note name="B" /></>);
  const [a, b] = host.querySelectorAll("input");
  await fill(a, "A 的输入");
  expect(a.value).toBe("A 的输入");
  expect(b.value).toBe("");
});
