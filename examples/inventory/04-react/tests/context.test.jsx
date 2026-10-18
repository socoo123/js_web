// @vitest-environment happy-dom
import { it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import ContextJoined from "../labs/ContextJoined.jsx";
import ContextScopes, { MissingProvider } from "../labs/ContextScopes.jsx";
import ReducerQueue from "../labs/ReducerQueue.jsx";
import ReducerProbe from "../labs/ReducerProbe.jsx";
import { restockReducer } from "../labs/MutationReducerFixed.js";
import InventorySummary from "../src/InventorySummary.jsx";
import { TestApp as App } from "./router-harness.jsx";
import { mount, click, fill } from "./state-harness.jsx";

it("补货和统计消费同一 Provider，连续操作都能同步", async () => {
  const host = await mount(<ContextJoined />);
  await click("给鼠标补 1 件");
  expect(host.textContent).toContain("总库存 53 件");
  await click("给鼠标补 1 件");
  expect(host.textContent).toContain("总库存 54 件");
});

it("不同 Provider 实例各自拥有库存，一个更新不改变另一个", async () => {
  const host = await mount(<ContextScopes />);
  const first = host.querySelector('[aria-label="库存 A"]');
  const second = host.querySelector('[aria-label="库存 B"]');
  await click("给鼠标补 1 件", first);
  expect(first.textContent).toContain("总库存 53 件");
  expect(second.textContent).toContain("总库存 52 件");
});

it("没有 Provider 时得到静态默认值，必需的业务消费者明确报错", async () => {
  const host = await mount(<MissingProvider />);
  expect(host.textContent).toBe("尚未连接库存");
  expect(() => renderToStaticMarkup(<InventorySummary />)).toThrow("InventorySummary 需要 InventoryProvider");
});

it("同一事件派发两次 action 使用前一次结果，下一次点击继续累加", async () => {
  const host = await mount(<ReducerQueue />);
  await click("鼠标库存 0 件，连续补两次");
  expect(host.textContent).toBe("鼠标库存 2 件，连续补两次");
  await click("鼠标库存 2 件，连续补两次");
  expect(host.textContent).toBe("鼠标库存 4 件，连续补两次");
});

it("纯 reducer 在 StrictMode 中一次点击只补一件", async () => {
  const host = await mount(<ReducerProbe reducer={restockReducer} />);
  await click("给鼠标补 1 件");
  expect(host.querySelector('[role="status"]').textContent).toBe("鼠标库存 1 件 · 总库存 53 件");
});

it("库存更新不重建本地筛选和编辑草稿，跨区域统计读取新值", async () => {
  const host = await mount(<App />);
  const card = (id) => [...host.querySelectorAll("article")].find((node) => node.textContent.includes(id));
  await click("编辑", card("P001"));
  await fill(host.querySelector('[name="name"]'), "键盘待盘点");
  await fill(host.querySelector("input"), "鼠标");
  await click("补 1 件", card("P002"));
  expect(host.querySelector("input").value).toBe("鼠标");
  expect(host.querySelector('[name="name"]').value).toBe("键盘待盘点");
  expect(host.textContent).toContain("总库存 53 件");
  expect(host.querySelectorAll("article")).toHaveLength(1);
});
