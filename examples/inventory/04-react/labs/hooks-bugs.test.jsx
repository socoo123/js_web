// @vitest-environment happy-dom
import { it, expect } from "vitest";
import RequestControls from "./RequestControls.jsx";
import StaleHookDetails from "./StaleHookDetails.jsx";
import { mount, click } from "../tests/state-harness.jsx";
import { controlledLoader, resolveProduct } from "../tests/request-harness.jsx";

it("切换编号后，自定义 Hook 应加载新商品", async () => {
  const api = controlledLoader();
  const host = await mount(<RequestControls Details={StaleHookDetails} loadProduct={api.load} />);
  await resolveProduct(api.latest());
  await click("选择 P002");
  expect(api.latest().id).toBe("P002");
  await resolveProduct(api.latest());
  expect(host.textContent).toContain("详情已加载：P002");
});
