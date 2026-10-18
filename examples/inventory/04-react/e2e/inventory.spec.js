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


test("本地快照可恢复、损坏可清除，新增商品有本地详情", async ({ page }) => {
  await page.goto("/js_web/#/products");
  const mouse = page.getByRole("article", { name: "无线鼠标" });
  await mouse.getByRole("button", { name: "补 1 件" }).click();
  await page.getByRole("button", { name: "保存本地快照" }).click();
  await page.reload();
  await expect(mouse).toContainText("库存：1 件");
  await expect(page.getByText(/全部：6 种/)).toContainText("总库存 53 件 · 库存总价值 ¥26477.00");
  await page.getByRole("button", { name: "新增示例商品" }).click();
  await page.getByRole("article", { name: "新商品" }).getByRole("link").click();
  await expect(page.getByRole("heading", { name: "商品详情 P007" })).toBeVisible();
  await expect(page.getByRole("region", { name: "本地商品详情" })).toContainText("本地库存 0 件");
  await page.evaluate(() => localStorage.setItem("js_web:inventory:products:v1", "{"));
  await page.goto("/js_web/#/products");
  await page.reload();
  await expect(page.getByRole("region", { name: "本地库存快照" })).toContainText("原记录保留");
  await expect(mouse).toContainText("库存：0 件");
  await page.getByRole("button", { name: "清除本地快照" }).click();
  await page.reload();
  await expect(page.getByText(/全部：6 种/)).toContainText("总库存 52 件");
  expect(await page.evaluate(() => localStorage.getItem("js_web:inventory:products:v1"))).toBeNull();
});
