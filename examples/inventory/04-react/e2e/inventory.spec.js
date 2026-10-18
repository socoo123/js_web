import { test, expect } from "@playwright/test";

test("筛选、详情、刷新与返回贯通生产产物", async ({ page }) => {
  await page.goto("/js_web/#/products");
  await page.getByRole("textbox", { name: "搜索名称（按 / 聚焦）" }).fill("鼠标");
  await expect(page.getByRole("article")).toHaveCount(1);
  const mouse = page.getByRole("article", { name: "无线鼠标" });
  await mouse.getByRole("link", { name: "查看缓存详情" }).click();
  await expect(page).toHaveURL(/#\/products\/P002\?q=/);
  await expect(page.getByRole("region", { name: "缓存商品详情" })).toContainText("缓存库存 0 件");
  await page.reload();
  await expect(page.getByRole("heading", { name: "商品详情 P002" })).toBeVisible();
  await expect(page.getByRole("region", { name: "缓存商品详情" })).toContainText("无线鼠标");
  await page.getByRole("link", { name: "返回筛选列表" }).click();
  await expect(page.getByRole("textbox", { name: "搜索名称（按 / 聚焦）" })).toHaveValue("鼠标");
  await expect(page.getByRole("article")).toHaveCount(1);
});
