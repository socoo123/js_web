import { test, expect } from "@playwright/test";
// region smoke
test("严格静态子路径：筛选、详情、刷新和返回", async ({ page, request }) => {
  const failures = [];
  page.on("pageerror", (error) => failures.push(error.message));
  const missing = await request.get("missing-route");
  expect(missing.status()).toBe(404);
  await page.goto("./");
  await page.getByRole("textbox", { name: "搜索", exact: true }).fill("P004");
  await expect(page.locator("#list article")).toHaveCount(1);
  await page.getByRole("link", { name: "详情 P004", exact: true }).click();
  await expect(page).toHaveURL(/#\/products\/P004\?q=P004$/);
  await expect(page.getByRole("region", { name: "商品详情" })).toContainText("P004 USB-C 扩展坞");
  await page.reload();
  await expect(page.getByRole("region", { name: "商品详情" })).toContainText("库存 3");
  await page.getByRole("link", { name: "返回列表", exact: true }).click();
  await expect(page.getByRole("textbox", { name: "搜索", exact: true })).toHaveValue("P004");
  await expect(page.locator("#list article")).toHaveCount(1);
  expect(failures).toEqual([]);
});
// endregion smoke
