// @vitest-environment happy-dom
import { it, expect, vi } from "vitest";
import InventoryCounter from "../src/InventoryCounter.jsx";
import SnapshotProbe from "../labs/SnapshotProbe.jsx";
import QueueFixed from "../labs/QueueFixed.jsx";
import DelayFixed from "../labs/DelayFixed.jsx";
import MixedQueue from "../labs/MixedQueue.jsx";
import { mount, click, advance } from "./state-harness.jsx";

it("一次连续补货增加三件，第二次点击接着累计", async () => {
  const host = await mount(<QueueFixed />);
  await click("补 3 件");
  expect(host.textContent).toContain("库存：15 件");
  await click("补 3 件");
  expect(host.textContent).toContain("库存：18 件");
});

it("延时补货保留等待期间的立即补货", async () => {
  vi.useFakeTimers();
  const host = await mount(<DelayFixed />);
  await click("2 秒后补 3 件");
  await click("立即补 1 件");
  expect(host.textContent).toContain("库存：13 件");
  await advance(2000);
  expect(host.textContent).toContain("库存：16 件");
});

it("两次未到期的延时补货都计入结果", async () => {
  vi.useFakeTimers();
  const host = await mount(<DelayFixed />);
  await click("2 秒后补 3 件");
  await click("2 秒后补 3 件");
  await advance(2000);
  expect(host.textContent).toContain("库存：18 件");
});

it("页面更新后，先前回调仍报告点击时的快照", async () => {
  vi.useFakeTimers();
  const log = vi.spyOn(console, "log").mockImplementation(() => {});
  const host = await mount(<SnapshotProbe />);
  await click("补 3 件并观察日志");
  expect(host.textContent).toContain("库存：15 件");
  await click("补 1 件");
  await advance(2000);
  expect(host.textContent).toContain("库存：16 件");
  expect(log.mock.calls).toEqual([["点击时", 12], ["调用 setter 后", 12], ["两秒后", 12]]);
});

it.each([["先替换再累加", 16], ["先累加再替换", 15]])("混合更新：%s", async (label, stock) => {
  const host = await mount(<MixedQueue />);
  await click(label);
  expect(host.textContent).toContain(`库存：${stock} 件`);
});

it("首页盘点计数保留延时操作与期间的新记录", async () => {
  vi.useFakeTimers();
  const host = await mount(<InventoryCounter />);
  await click("2 秒后记录 3 次");
  await click("连续记录 3 次");
  await click("记录 1 次");
  expect(host.textContent).toContain("已记录 4 次盘点操作");
  await advance(2000);
  expect(host.textContent).toContain("已记录 7 次盘点操作");
});

it("两个盘点区域各自记数", async () => {
  const host = await mount(<><InventoryCounter /><InventoryCounter /></>);
  const sections = host.querySelectorAll("section");
  await click("记录 1 次", sections[0]);
  expect(sections[0].textContent).toContain("已记录 1 次盘点操作");
  expect(sections[1].textContent).toContain("已记录 0 次盘点操作");
});
