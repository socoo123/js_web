// @vitest-environment happy-dom
import { it, expect } from "vitest";
import { useState } from "react";
import QueryKeyBroken from "./QueryKeyBroken.jsx";
import { QueryHarness, testClient, flushQuery } from "../tests/query-harness.jsx";
import { mount, click } from "../tests/state-harness.jsx";
import { controlledLoader, resolveProduct } from "../tests/request-harness.jsx";

it("切换到鼠标必须请求鼠标，不能沿用键盘的缓存", async () => {
  const client = testClient(); const api = controlledLoader();
  function Probe() {
    const [id, setId] = useState("P001");
    return <><button onClick={() => setId("P002")}>选择鼠标</button>
      <QueryKeyBroken key={id} productId={id} loadProduct={api.load} /></>;
  }
  try {
    const host = await mount(<QueryHarness client={client}><Probe /></QueryHarness>);
    await resolveProduct(api.latest()); await flushQuery();
    await click("选择鼠标"); await flushQuery();
    expect(api.latest().id).toBe("P002");
    await resolveProduct(api.latest()); await flushQuery();
    expect(host.textContent).toContain("详情已加载：P002");
  } finally { client.clear(); }
});
