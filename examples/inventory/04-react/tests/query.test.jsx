// @vitest-environment happy-dom
import { afterEach, it, expect, vi } from "vitest";
import { act, useState } from "react";
import CachedProductDetails from "../src/CachedProductDetails.jsx";
import { productKey } from "../src/product-query.js";
import { mount, click } from "./state-harness.jsx";
import { QueryHarness, testClient, flushQuery } from "./query-harness.jsx";
import { controlledLoader, resolveProduct, rejectProduct } from "./request-harness.jsx";
import { products } from "../../../shared/products.js";

const clients = [];
function clientForTest() { const client = testClient(); clients.push(client); return client; }
afterEach(() => clients.forEach((client) => client.clear()));
function Switcher({ loadProduct, saveProduct }) {
  const [id, setId] = useState("P001");
  const [shown, setShown] = useState(true);
  return <>
    <button onClick={() => setId("P001")}>键盘</button>
    <button onClick={() => setId("P002")}>鼠标</button>
    <button onClick={() => setShown((value) => !value)}>切换显示</button>
    {shown && <CachedProductDetails key={id} productId={id} loadProduct={loadProduct} saveProduct={saveProduct} />}
  </>;
}
async function finish(api) { await resolveProduct(api.latest()); await flushQuery(); }

it("不同编号独立缓存，fresh 返回与卸载重挂均复用已成功结果", async () => {
  const client = clientForTest(); const api = controlledLoader();
  const host = await mount(<QueryHarness client={client}><Switcher loadProduct={api.load} /></QueryHarness>);
  await finish(api);
  await click("鼠标"); await finish(api);
  expect(host.textContent).toContain("无线鼠标");
  const count = api.load.mock.calls.length;
  await click("键盘"); await flushQuery();
  expect(host.textContent).toContain("机械键盘");
  await click("切换显示"); await click("切换显示"); await flushQuery();
  expect(api.load).toHaveBeenCalledTimes(count);
  expect(client.getQueryData(productKey("P001")).stock).toBe(12);
  expect(client.getQueryData(productKey("P002")).stock).toBe(0);
});

it("相同 key 的两个观察者共用进行中的请求与结果", async () => {
  const client = clientForTest(); const api = controlledLoader();
  const host = await mount(<QueryHarness client={client}>
    <CachedProductDetails productId="P001" loadProduct={api.load} />
    <CachedProductDetails productId="P001" loadProduct={api.load} />
  </QueryHarness>);
  expect(api.calls.filter((call) => !call.signal.aborted)).toHaveLength(1);
  await finish(api);
  expect(host.querySelectorAll('[aria-label="缓存商品详情"]')).toHaveLength(2);
  expect(host.textContent.match(/机械键盘/g)).toHaveLength(2);
});

it("后台读取保留旧结果，失败可重试并恢复", async () => {
  const client = clientForTest(); const api = controlledLoader();
  const host = await mount(<QueryHarness client={client}><Switcher loadProduct={api.load} /></QueryHarness>);
  await finish(api);
  await click("重新读取详情"); await flushQuery();
  expect(host.textContent).toContain("机械键盘");
  expect(host.textContent).toContain("正在后台更新");
  await rejectProduct(api.latest()); await flushQuery();
  expect(host.textContent).toContain("更新失败");
  expect(host.textContent).toContain("缓存库存 12 件");
  await click("重新读取详情"); await finish(api);
  expect(host.querySelector('[role="alert"]')).toBeNull();
});

it("首次失败显示错误，点击重试可加载详情", async () => {
  const client = clientForTest(); const api = controlledLoader();
  const host = await mount(<QueryHarness client={client}><Switcher loadProduct={api.load} /></QueryHarness>);
  await rejectProduct(api.latest()); await flushQuery();
  expect(host.textContent).toContain("加载失败：HTTP 503");
  await click("重试详情"); await finish(api);
  expect(host.textContent).toContain("机械键盘");
});

it("mutation 成功后仅对应详情重新读取，更新完成前按钮保持等待", async () => {
  const client = clientForTest(); const api = controlledLoader();
  client.setQueryData(productKey("P002"), structuredClone(products[1]));
  let complete;
  const save = vi.fn(() => new Promise((resolve) => { complete = resolve; }));
  const host = await mount(<QueryHarness client={client}><Switcher loadProduct={api.load} saveProduct={save} /></QueryHarness>);
  await finish(api); const before = api.load.mock.calls.length;
  await click("模拟远端补 1 件"); await flushQuery();
  expect(save).toHaveBeenCalledWith("P001");
  expect([...host.querySelectorAll("button")].find((button) => button.textContent.includes("正在保存")).disabled).toBe(true);
  await act(async () => { complete({ ...products[0], stock: 13 }); }); await flushQuery();
  expect(api.load).toHaveBeenCalledTimes(before + 1);
  expect(host.textContent).toContain("正在保存并更新");
  await act(async () => { api.latest().resolve({ ...products[0], stock: 13 }); }); await flushQuery();
  expect(host.textContent).toContain("缓存库存 13 件");
  expect(host.textContent).toContain("模拟保存成功");
  expect(client.getQueryState(productKey("P002")).isInvalidated).toBe(false);
});

it("保存失败不会失效已有缓存或重试写入", async () => {
  const client = clientForTest(); const api = controlledLoader();
  const save = vi.fn(async () => { throw new Error("模拟保存失败"); });
  const host = await mount(<QueryHarness client={client}><Switcher loadProduct={api.load} saveProduct={save} /></QueryHarness>);
  await finish(api); const before = api.load.mock.calls.length;
  await click("模拟远端补 1 件"); await flushQuery();
  expect(host.textContent).toContain("保存失败：模拟保存失败");
  expect(host.textContent).toContain("缓存库存 12 件");
  expect(save).toHaveBeenCalledTimes(1);
  expect(api.load).toHaveBeenCalledTimes(before);
});

it("写入过程中切换编号，旧 mutation 仍使原编号失效", async () => {
  const client = clientForTest(); const api = controlledLoader();
  let complete;
  const save = () => new Promise((resolve) => { complete = resolve; });
  await mount(<QueryHarness client={client}><Switcher loadProduct={api.load} saveProduct={save} /></QueryHarness>);
  await finish(api); await click("模拟远端补 1 件");
  await click("鼠标"); await finish(api);
  await act(async () => { complete({ ...products[0], stock: 13 }); }); await flushQuery();
  expect(client.getQueryState(productKey("P001")).isInvalidated).toBe(true);
  expect(client.getQueryState(productKey("P002")).isInvalidated).toBe(false);
});

it("旧请求迟到不会写入新编号，旧 signal 已取消", async () => {
  const client = clientForTest(); const api = controlledLoader();
  const host = await mount(<QueryHarness client={client}><Switcher loadProduct={api.load} /></QueryHarness>);
  const old = api.latest(); await click("鼠标");
  expect(old.signal.aborted).toBe(true);
  await finish(api); await resolveProduct(old); await flushQuery();
  expect(host.textContent).toContain("详情已加载：P002");
  expect(host.textContent).not.toContain("详情已加载：P001");
});

it("保存成功但读回失败时保留旧结果，提示两种不同结果", async () => {
  const client = clientForTest(); const api = controlledLoader();
  const save = vi.fn(async () => ({ ...products[0], stock: 13 }));
  const host = await mount(<QueryHarness client={client}><Switcher loadProduct={api.load} saveProduct={save} /></QueryHarness>);
  await finish(api);
  await click("模拟远端补 1 件"); await flushQuery();
  await rejectProduct(api.latest()); await flushQuery();
  expect(host.textContent).toContain("模拟保存成功");
  expect(host.textContent).toContain("更新失败：HTTP 503");
  expect(host.textContent).toContain("缓存库存 12 件");
});
