// @vitest-environment happy-dom
import { it, expect } from "vitest";
import RaceBroken from "./RaceBroken.jsx";
import AbortOnly from "./AbortOnly.jsx";
import FinallyBroken from "./FinallyBroken.jsx";
import RequestControls from "./RequestControls.jsx";
import { mount, click } from "../tests/state-harness.jsx";
import { controlledLoader, resolveProduct } from "../tests/request-harness.jsx";

for (const [name, Details] of [["旧请求", RaceBroken], ["只做 abort", AbortOnly]]) {
  it(`${name}：当前选择 P002 时不应被晚返回的 P001 覆盖`, async () => {
    const api = controlledLoader();
    const host = await mount(<RequestControls Details={Details} loadProduct={api.load} />);
    const old = api.latest();
    await click("选择 P002");
    await resolveProduct(api.latest());
    await resolveProduct(old);
    expect(host.querySelector('[role="status"]').textContent).toMatch(/(?:详情 |详情已加载：)P002$/);
  });
}

it("旧 finally：P001 仍在等待时应保持加载中", async () => {
  const api = controlledLoader();
  const host = await mount(<RequestControls Details={FinallyBroken} loadProduct={api.load} />);
  await click("选择 P002");
  const old = api.latest();
  await click("选择 P001");
  await resolveProduct(old);
  expect(host.querySelector('[role="status"]').textContent).toMatch(/当前 P001 · 加载中|正在加载 P001/);
});
