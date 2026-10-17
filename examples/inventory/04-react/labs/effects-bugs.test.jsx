// @vitest-environment happy-dom
import { afterEach, it, expect, vi } from "vitest";
import { products } from "../../../shared/products.js";
import WatchControls from "./WatchControls.jsx";
import SubscriptionBroken from "./SubscriptionBroken.jsx";
import StaleSubscriptionBroken from "./StaleSubscriptionBroken.jsx";
import IntervalBroken from "./IntervalBroken.jsx";
import LoopBroken from "./LoopBroken.jsx";
import EffectBoundary from "./EffectBoundary.jsx";
import { mount, click, advance } from "../tests/state-harness.jsx";

const listeners = [];
const add = window.addEventListener.bind(window);
it("开发检查和商品切换后，一条通知应只计算一次", async () => {
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(window, "addEventListener").mockImplementation((type, handler, options) => {
    if (type === "inventory-pulse") listeners.push(handler);
    add(type, handler, options);
  });
  const host = await mount(<WatchControls Watch={SubscriptionBroken} />);
  await click("切换商品");
  await click("发一条通知");
  expect(host.querySelector('[role="status"]').textContent).toBe("当前 P002 · 收到 1 次通知");
});
afterEach(() => { for (const handler of listeners.splice(0)) window.removeEventListener("inventory-pulse", handler); });

it("切换商品后，订阅回调应读取新编号", async () => {
  const log = vi.spyOn(console, "log").mockImplementation(() => {});
  await mount(<WatchControls Watch={StaleSubscriptionBroken} />);
  await click("切换商品");
  await click("发一条通知");
  expect(log.mock.calls.at(-1)).toEqual(["收到", "P002"]);
});

it("三秒后应已检查三次", async () => {
  vi.useFakeTimers();
  const host = await mount(<IntervalBroken />);
  await advance(3000);
  expect(host.textContent).toBe("已检查 3 次");
});

it("有货数量应直接显示五种，不能触发 Effect 连续更新", async () => {
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
  const host = await mount(<EffectBoundary><LoopBroken products={products} /></EffectBoundary>);
  expect(host.querySelector('[role="alert"]')).toBeNull();
  expect(host.querySelector('[role="status"]').textContent).toBe("有货 5 种");
});
