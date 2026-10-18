// @vitest-environment happy-dom
import { afterEach, it, expect, vi } from "vitest";
import { act, useState } from "react";
import ActionProductDetails from "../src/ActionProductDetails.jsx";
import RestockActionForm from "../src/RestockActionForm.jsx";
import { createRestockAction, initialRestockResult } from "../src/restock-action.js";
import { productKey } from "../src/product-query.js";
import SignatureFixed from "../labs/SignatureFixed.jsx";
import StatusScopeFixed from "../labs/StatusScopeFixed.jsx";
import RefPropInput from "../labs/RefPropInput.jsx";
import { mount, click } from "./state-harness.jsx";
import { QueryHarness, testClient, flushQuery } from "./query-harness.jsx";
import { products } from "../../../shared/products.js";

const clients = [];
function clientForTest() { const client = testClient(); clients.push(client); return client; }
afterEach(() => { clients.forEach((client) => client.clear()); clients.length = 0; });
async function submit(form) {
  await act(async () => { form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })); });
}
function service() {
  let current = structuredClone(products[0]);
  const writes = [];
  const save = vi.fn((id) => new Promise((resolve, reject) => {
    writes.push({ id, reject, resolve: () => { current = { ...current, stock: current.stock + 1 }; resolve(current); } });
  }));
  const load = vi.fn(async (id) => structuredClone(id === current.id ? current : products[1]));
  return { writes, save, load };
}
async function showDetails(api, client = clientForTest()) {
  const host = await mount(<QueryHarness client={client}>
    <ActionProductDetails productId="P001" loadProduct={api.load} saveProduct={api.save} />
  </QueryHarness>);
  await flushQuery();
  return { host, client, form: host.querySelector("form") };
}

it("表单 Action 正确取出编号，等待时只显示临时预览并禁用按钮", async () => {
  const api = service(); const { host, client, form } = await showDetails(api);
  await submit(form);
  expect(api.save).toHaveBeenCalledExactlyOnceWith("P001");
  expect(form.getAttribute("aria-busy")).toBe("true");
  expect(form.textContent).toContain("预览库存 13 件（等待确认）");
  expect(form.querySelector("button").disabled).toBe(true);
  expect(client.getQueryData(productKey("P001")).stock).toBe(12);
  await act(async () => api.writes[0].resolve()); await flushQuery();
  expect(host.textContent).toContain("缓存库存 13 件");
  expect(form.textContent).toContain("预览库存 13 件（当前缓存）");
  expect(form.textContent).toContain("模拟保存成功：P001 已保存 13 件。");
  expect(form.querySelector("button").disabled).toBe(false);
});

it("保存失败回退到缓存库存，恢复后可重新提交且不重试原写入", async () => {
  const api = service(); const { host, form } = await showDetails(api);
  await submit(form);
  await act(async () => api.writes[0].reject(new Error("模拟保存失败"))); await flushQuery();
  expect(form.textContent).toContain("预览库存 12 件（当前缓存）");
  expect(form.querySelector('[role="alert"]').textContent).toContain("保存失败：模拟保存失败");
  expect(api.save).toHaveBeenCalledTimes(1);
  await submit(form);
  expect(form.querySelector('[role="alert"]')).toBeNull();
  await act(async () => api.writes[1].resolve()); await flushQuery();
  expect(host.textContent).toContain("缓存库存 13 件");
});

it("等待失效读回期间仍 pending，缓存更新不把乐观预览叠加成 14", async () => {
  const api = service(); let finishRead; let gateRead = false;
  api.load.mockImplementation(() => gateRead
    ? new Promise((resolve) => { finishRead = resolve; }) : Promise.resolve(structuredClone(products[0])));
  const { host, form } = await showDetails(api);
  gateRead = true;
  await submit(form); await act(async () => api.writes[0].resolve()); await flushQuery();
  expect(form.textContent).toContain("等待确认");
  expect(form.querySelector("button").disabled).toBe(true);
  expect(host.textContent).toContain("缓存库存 12 件");
  await act(async () => finishRead({ ...products[0], stock: 13 })); await flushQuery();
  expect(form.textContent).toContain("预览库存 13 件（当前缓存）");
  expect(host.textContent).not.toContain("14 件");
});

it("写成功而读回失败时分别提示，重读恢复不重复补货", async () => {
  const api = service(); const { host, form } = await showDetails(api);
  await submit(form); api.load.mockRejectedValueOnce(new Error("HTTP 503"));
  await act(async () => api.writes[0].resolve()); await flushQuery();
  expect(host.textContent).toContain("已保存 13 件");
  expect(host.textContent).toContain("更新失败：HTTP 503");
  expect(form.textContent).toContain("预览库存 12 件（当前缓存）");
  await click("重新读取详情"); await flushQuery();
  expect(host.textContent).toContain("缓存库存 13 件");
  expect(form.textContent).toContain("预览库存 13 件（当前缓存）");
  expect(api.save).toHaveBeenCalledTimes(1);
});

it("切换商品卸载旧表单后，完成的写入只失效原编号", async () => {
  const api = service(); const client = clientForTest();
  function Switcher() {
    const [id, setId] = useState("P001");
    return <><button onClick={() => setId("P002")}>选择鼠标</button>
      <ActionProductDetails key={id} productId={id} loadProduct={api.load} saveProduct={api.save} /></>;
  }
  const host = await mount(<QueryHarness client={client}><Switcher /></QueryHarness>); await flushQuery();
  await submit(host.querySelector("form")); await click("选择鼠标"); await flushQuery();
  await act(async () => api.writes[0].resolve()); await flushQuery();
  expect(host.textContent).toContain("缓存库存 0 件");
  expect(host.textContent).not.toContain("已保存 13 件");
  expect(client.getQueryState(productKey("P001")).isInvalidated).toBe(true);
  expect(client.getQueryState(productKey("P002")).isInvalidated).toBe(false);
});

it("库存到达上限时提交按钮禁用", async () => {
  const host = await mount(<QueryHarness client={clientForTest()}>
    <RestockActionForm product={{ ...products[0], stock: 99999 }} saveProduct={vi.fn()} />
  </QueryHarness>);
  expect(host.querySelector("button").disabled).toBe(true);
});

it("Action 拒绝编号不符和库存上限，不调用模拟写入或预览", async () => {
  const save = vi.fn(); const preview = vi.fn(); const data = new FormData();
  data.set("productId", "P002");
  const action = createRestockAction({ product: products[0], saveProduct: save, showOptimistic: preview });
  expect((await action(initialRestockResult, data)).status).toBe("error");
  data.set("productId", "P001");
  const capped = createRestockAction({ product: { ...products[0], stock: 99999 }, saveProduct: save, showOptimistic: preview });
  expect((await capped(initialRestockResult, data)).message).toContain("上限");
  expect(save).not.toHaveBeenCalled(); expect(preview).not.toHaveBeenCalled();
});

it("useActionState 的第二个参数才是表单数据", async () => {
  const host = await mount(<SignatureFixed />);
  await submit(host.querySelector("form"));
  expect(host.textContent).toContain("收到 P001");
});

it("表单内部子组件能通过 useFormStatus 禁用提交按钮", async () => {
  let finish; const save = () => new Promise((resolve) => { finish = resolve; });
  const host = await mount(<StatusScopeFixed save={save} />);
  await submit(host.querySelector("form"));
  expect(host.textContent).toContain("正在提交");
  expect(host.querySelector("button").disabled).toBe(true);
  await act(async () => finish());
  expect(host.querySelector("button").disabled).toBe(false);
});

it("函数组件接收 ref prop 后可将焦点交给实际 input", async () => {
  const host = await mount(<RefPropInput />);
  await click("聚焦名称");
  expect(document.activeElement).toBe(host.querySelector("input"));
});
