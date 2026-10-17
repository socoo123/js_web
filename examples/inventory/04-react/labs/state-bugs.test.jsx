// @vitest-environment happy-dom
import { it, expect, vi } from "vitest";
import QueueBroken from "./QueueBroken.jsx";
import DelayBroken from "./DelayBroken.jsx";
import { mount, click, advance } from "../tests/state-harness.jsx";

it("连续补三件应从 12 到 15", async () => {
  const host = await mount(<QueueBroken />);
  await click("补 3 件");
  expect(host.textContent).toContain("库存：15 件");
});

it("延时补货应保留期间新增的一件", async () => {
  vi.useFakeTimers();
  const host = await mount(<DelayBroken />);
  await click("2 秒后补 3 件");
  await click("立即补 1 件");
  await advance(2000);
  expect(host.textContent).toContain("库存：16 件");
});
