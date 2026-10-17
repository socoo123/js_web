// @vitest-environment happy-dom
import { it, expect, vi } from "vitest";
import RefCountBroken from "./RefCountBroken.jsx";
import LocalTimerBroken from "./LocalTimerBroken.jsx";
import { mount, click, advance } from "../tests/state-harness.jsx";

it("盘点后界面应立即显示新次数", async () => {
  const host = await mount(<RefCountBroken />);
  await click("盘点一次");
  expect(host.querySelector('[role="status"]').textContent).toBe("已盘点 1 次");
});

it("显示等待状态后，取消仍应阻止盘点执行", async () => {
  vi.useFakeTimers();
  const host = await mount(<LocalTimerBroken />);
  await click("2 秒后记录 3 次");
  await click("取消延时记录");
  await advance(2000);
  expect(host.querySelector('[role="status"]').textContent).toBe("已记录 0 次盘点操作");
});
