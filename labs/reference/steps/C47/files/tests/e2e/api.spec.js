import { test, expect } from "@playwright/test";
// 需要真实后端：check C47 会启动临时数据的后端和带 /api 代理的严格预览。
// 自己连 npm run lab -- api 运行时，reset 会把后端数据恢复为固定数据。
// region api-flow
test("真实后端：保存 P004=8 后刷新仍是 8，总库存 57", async ({ page, request }) => {
  expect((await request.post("/api/_lab/reset")).status()).toBe(204);
  await page.goto("./");
  await expect(page.locator("#summary")).toHaveText("库存 52 / 价值 2634800 分");
  await page.getByRole("button", { name: "编辑 P004", exact: true }).click();
  const form = page.getByRole("form", { name: "商品编辑", exact: true });
  await form.getByLabel("库存", { exact: true }).fill("8");
  await form.getByRole("button", { name: "保存", exact: true }).click();
  await expect(form).toHaveCount(0);
  await page.reload();
  await expect(page.locator('article[data-id="P004"]')).toContainText("库存 8 件");
  await expect(page.locator("#summary")).toHaveText("库存 57 / 价值 2784300 分");
  const saved = await request.get("/api/products/P004");
  expect(await saved.json()).toMatchObject({ id: "P004", stock: 8, version: 2 });
});
// endregion api-flow
