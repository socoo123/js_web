// @vitest-environment happy-dom
import { it, expect } from "vitest";
import { act } from "react";
import SignatureBroken from "./SignatureBroken.jsx";
import StatusScopeBroken from "./StatusScopeBroken.jsx";
import { mount } from "../tests/state-harness.jsx";

async function submit(form) {
  await act(async () => { form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })); });
}
it("提交后应读到 P001", async () => {
  const host = await mount(<SignatureBroken />);
  await submit(host.querySelector("form"));
  expect(host.textContent).toContain("收到 P001");
});
it("正在提交时按钮应禁用", async () => {
  let finish;
  const host = await mount(<StatusScopeBroken save={() => new Promise((resolve) => { finish = resolve; })} />);
  await submit(host.querySelector("form"));
  try { expect(host.querySelector("button").disabled).toBe(true); }
  finally { await act(async () => finish()); }
});
