// @vitest-environment happy-dom
import { it, expect } from "vitest";
import { products } from "../../../shared/products.js";
import { restockReducer } from "./MutationReducerBroken.js";
import ContextSplitBroken from "./ContextSplitBroken.jsx";
import { mount, click } from "../tests/state-harness.jsx";

it("补货必须保留调用前的旧快照", () => {
  const before = structuredClone(products);
  const after = restockReducer(before, { type: "restocked", id: "P002" });
  expect(before[1].stock).toBe(0);
  expect(after[1].stock).toBe(1);
  expect(after).not.toBe(before);
});

it("点击补货后，同一业务界面的统计应随库存更新", async () => {
  const host = await mount(<ContextSplitBroken />);
  await click("给鼠标补 1 件");
  expect(host.textContent).toContain("总库存 53 件");
});
