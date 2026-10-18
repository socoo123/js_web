// @vitest-environment happy-dom
import { it, expect } from "vitest";
import StaleMemoBroken from "./StaleMemoBroken.jsx";
import { mount, click } from "../tests/state-harness.jsx";

it("补货后库存与库存价值同步", async () => {
  const host = await mount(<StaleMemoBroken />);
  await click("补 1 件");
  expect(host.textContent).toContain("库存 13 件 · 价值 5187.00 元");
  await click("补 1 件");
  expect(host.textContent).toContain("库存 14 件 · 价值 5586.00 元");
});
