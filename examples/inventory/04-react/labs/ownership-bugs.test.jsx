// @vitest-environment happy-dom
import { it, expect } from "vitest";
import LocalStockBroken from "./LocalStockBroken.jsx";
import SwitchProductBroken from "./SwitchProductBroken.jsx";
import { mount, click, fill } from "../tests/state-harness.jsx";

it("补货后列表和统计应同时更新", async () => {
  const host = await mount(<LocalStockBroken />);
  await click("给鼠标补 1 件");
  expect(host.querySelector('[role="status"]').textContent).toBe("总库存 53 件");
});

it("切换到鼠标应丢弃键盘草稿并读取鼠标的起始值", async () => {
  const host = await mount(<SwitchProductBroken />);
  await fill(host.querySelector('[name="name"]'), "键盘待盘点");
  await click("选择 P002");
  expect(host.querySelector('[name="name"]').value).toBe("无线鼠标");
});
