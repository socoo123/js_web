// @vitest-environment happy-dom
import { afterEach, it, expect, vi } from "vitest";
import { act } from "react";
import { products } from "../../../shared/products.js";
import ProductDetails from "../src/ProductDetails.jsx";
import RequestControls from "../labs/RequestControls.jsx";
import FinallyFixed from "../labs/FinallyFixed.jsx";
import { fetchProduct } from "../src/product-api.js";
import { readProductResponse } from "../src/read-product.js";
import { mount, click } from "./state-harness.jsx";
import { controlledLoader, resolveProduct, rejectProduct } from "./request-harness.jsx";

afterEach(() => vi.unstubAllEnvs());

it("保留独立 loading 时，旧 finally 同样需要检查 ignore", async () => {
  const api = controlledLoader();
  const host = await mount(<RequestControls Details={FinallyFixed} loadProduct={api.load} />);
  await click("选择 P002");
  const old = api.latest();
  await click("选择 P001");
  await resolveProduct(old);
  expect(host.textContent).toContain("当前 P001 · 加载中");
  await resolveProduct(api.latest());
  expect(host.textContent).toContain("当前 P001 · 未加载 · 详情 P001");
});

it("未选择时保持 idle，不发送请求", async () => {
  const api = controlledLoader();
  const host = await mount(<ProductDetails productId={null} loadProduct={api.load} />);
  expect(host.textContent).toContain("请选择商品查看详情");
  expect(api.load).not.toHaveBeenCalled();
});

it("加载后展示合法数据，开始时只显示 loading", async () => {
  const api = controlledLoader();
  const host = await mount(<ProductDetails productId="P002" loadProduct={api.load} />);
  expect(host.querySelector('[aria-busy="true"]')).not.toBeNull();
  await resolveProduct(api.latest());
  expect(host.textContent).toContain("详情已加载：P002");
  expect(host.textContent).toContain("无线鼠标 · 外设 · 初始库存 0 件 · ¥129.00");
  expect(host.querySelector('[aria-busy="false"]')).not.toBeNull();
});

it("旧请求晚成功也不能覆盖新商品，包括不遵守 signal 的后续处理", async () => {
  const api = controlledLoader();
  const host = await mount(<RequestControls loadProduct={api.load} />);
  const old = api.latest();
  await click("选择 P002");
  expect(old.signal.aborted).toBe(true);
  await resolveProduct(api.latest());
  await resolveProduct(old);
  expect(host.textContent).toContain("详情已加载：P002");
  expect(host.textContent).not.toContain("机械键盘 ·");
});

it("旧请求晚失败不会结束当前 loading 或显示旧错误", async () => {
  const api = controlledLoader();
  const host = await mount(<RequestControls loadProduct={api.load} />);
  const old = api.latest();
  await click("选择 P002");
  await rejectProduct(old);
  expect(host.textContent).toContain("正在加载 P002");
  expect(host.querySelector('[role="alert"]')).toBeNull();
  await resolveProduct(api.latest());
  expect(host.textContent).toContain("详情已加载：P002");
});

it("同编号 A→B→A 时，第一次 A 仍然过期", async () => {
  const api = controlledLoader();
  const host = await mount(<RequestControls loadProduct={api.load} />);
  const first = api.latest();
  await click("选择 P002");
  await click("选择 P001");
  const last = api.latest();
  await rejectProduct(first);
  expect(host.textContent).toContain("正在加载 P001");
  await resolveProduct(last);
  expect(host.textContent).toContain("详情已加载：P001");
});

it("当前请求失败后允许重试，失败文本在重试加载中清掉", async () => {
  const api = controlledLoader();
  const host = await mount(<RequestControls loadProduct={api.load} />);
  await rejectProduct(api.latest());
  expect(host.querySelector('[role="alert"]').textContent).toContain("HTTP 503");
  await click("重试详情");
  expect(host.querySelector('[role="alert"]')).toBeNull();
  expect(host.textContent).toContain("正在加载 P001");
  await resolveProduct(api.latest());
  expect(host.textContent).toContain("详情已加载：P001");
});

it("主动取消结束 loading，随后晚成功仍保持取消；重试使用新 signal", async () => {
  const api = controlledLoader();
  const host = await mount(<RequestControls loadProduct={api.load} />);
  const old = api.latest();
  await click("取消加载");
  expect(old.signal.aborted).toBe(true);
  expect(host.textContent).toContain("已取消 P001");
  await resolveProduct(old);
  expect(host.textContent).toContain("已取消 P001");
  await click("重新加载");
  expect(api.latest().signal).not.toBe(old.signal);
  expect(api.latest().signal.aborted).toBe(false);
  await resolveProduct(api.latest());
  expect(host.textContent).toContain("详情已加载：P001");
});

it("隐藏组件会取消并失效；旧结果不污染重新挂载的详情", async () => {
  const api = controlledLoader();
  const host = await mount(<RequestControls loadProduct={api.load} />);
  const old = api.latest();
  await click("显示或隐藏详情");
  expect(old.signal.aborted).toBe(true);
  await click("显示或隐藏详情");
  await resolveProduct(old);
  expect(host.textContent).toContain("正在加载 P001");
  await resolveProduct(api.latest());
  expect(host.textContent).toContain("详情已加载：P001");
});

it("StrictMode 的第一次 setup 已取消，晚返回不能结束第二次加载", async () => {
  const api = controlledLoader();
  const host = await mount(<ProductDetails productId="P001" loadProduct={api.load} />);
  expect(api.calls).toHaveLength(2);
  expect(api.calls[0].signal.aborted).toBe(true);
  expect(api.calls[1].signal.aborted).toBe(false);
  await resolveProduct(api.calls[0]);
  expect(host.textContent).toContain("正在加载 P001");
  await resolveProduct(api.calls[1]);
  expect(host.textContent).toContain("详情已加载：P001");
});

it("HTTP 错误、JSON 解析错误、字段错误分别拒绝", async () => {
  await expect(readProductResponse(new Response("missing", { status: 404 }), "P001")).rejects.toThrow("HTTP 404");
  await expect(readProductResponse(new Response("bad json"), "P001")).rejects.toThrow(SyntaxError);
  for (const changes of [{ id: "P002" }, { stock: -1 }, { stock: 100000 }, { priceCents: 1.5 },
    { name: "" }, { category: "未知" }, { tags: [1] }]) {
    const response = new Response(JSON.stringify({ ...products[0], ...changes }));
    await expect(readProductResponse(response, "P001")).rejects.toThrow("商品数据格式不正确");
  }
});

it("真实请求封装使用 Pages 子路径、编码 id 并传递 signal，网络失败继续抛出", async () => {
  vi.stubEnv("BASE_URL", "/js_web/");
  const spy = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify(products[0])));
  const controller = new AbortController();
  await expect(fetchProduct("P001", { signal: controller.signal })).resolves.toEqual(products[0]);
  // Vitest 默认把 BASE_URL 设为 /，这里明确测试部署子路径。
  expect(spy).toHaveBeenCalledWith("/js_web/data/products/P001.json", {
    signal: controller.signal, headers: { Accept: "application/json" },
  });
  spy.mockRejectedValue(new TypeError("Failed to fetch"));
  await expect(fetchProduct("P001")).rejects.toThrow(TypeError);
});

it("清空选择立即返回 idle，不展示上一个商品；卸载请求失效", async () => {
  const api = controlledLoader();
  const { createRoot } = await import("react-dom/client");
  const node = document.createElement("div");
  const root = createRoot(node);
  try {
    await act(async () => root.render(<ProductDetails productId="P001" loadProduct={api.load} />));
    const old = api.latest();
    await act(async () => root.render(<ProductDetails productId={null} loadProduct={api.load} />));
    expect(node.textContent).toContain("请选择商品查看详情");
    expect(old.signal.aborted).toBe(true);
    await resolveProduct(old);
    expect(node.textContent).toContain("请选择商品查看详情");
  } finally { await act(async () => root.unmount()); }
});
