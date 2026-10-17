// @vitest-environment happy-dom
import { it, expect } from "vitest";
import MutationBroken from "./MutationBroken.jsx";
import IndexKeysBroken from "./IndexKeysBroken.jsx";
import DerivedBroken from "./DerivedBroken.jsx";
import { mount, click } from "../tests/state-harness.jsx";

it("给键盘补货后应显示 13 件", async () => {
  const host = await mount(<MutationBroken />);
  await click("给键盘补 1 件");
  expect(host.querySelector('[role="status"]').textContent).toBe("库存：13 件");
});

it("删除键盘后鼠标应保留自己的草稿", async () => {
  const host = await mount(<IndexKeysBroken />);
  await click("删除 P001");
  expect(host.querySelector("input").value).toBe("无线鼠标");
});

it("鼠标补货后筛选库存应同步", async () => {
  const host = await mount(<DerivedBroken />);
  await click("给鼠标补 1 件");
  expect(host.querySelector('[role="status"]').textContent).toBe("筛选库存：1 件");
});
