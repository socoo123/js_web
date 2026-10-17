// @vitest-environment happy-dom
import { it, expect } from "vitest";
import LockedNameBroken from "./LockedNameBroken.jsx";
import BlankStockBroken from "./BlankStockBroken.jsx";
import { mount, click, fill } from "../tests/state-harness.jsx";

it("修改名称后应保留用户输入", async () => {
  const host = await mount(<LockedNameBroken />);
  await fill(host.querySelector("input"), "键盘待盘点");
  expect(host.querySelector("input").value).toBe("键盘待盘点");
});

it("清空库存应被拒绝，而不是保存为 0", async () => {
  const host = await mount(<BlankStockBroken />);
  await click("保存库存");
  expect(host.querySelector('[role="status"]').textContent).toBe("库存无效");
});
