import { test, expect } from "@playwright/test";

test("静态服务器只认文件，hash 详情可以直接打开并刷新", async ({ page, request }) => {
  expect((await request.get("/js_web/products/P002/")).status()).toBe(404);
  expect((await request.get("/data/products/P002.json")).status()).toBe(404);
  const product = await request.get("/js_web/data/products/P002.json");
  expect(product.status()).toBe(200);
  expect(product.headers()["content-type"]).toContain("application/json");
  expect(await product.json()).toMatchObject({ id: "P002", stock: 0, priceCents: 12900 });
  const failures = [];
  page.on("pageerror", (error) => failures.push(error.message));
  page.on("response", (response) => {
    if (response.status() >= 400) failures.push(`${response.status()} ${response.url()}`);
  });
  expect((await page.goto("/js_web/#/products/P002")).status()).toBe(200);
  await expect(page.getByRole("region", { name: "缓存商品详情" })).toContainText("缓存库存 0 件");
  expect((await page.reload()).status()).toBe(200);
  await expect(page.getByRole("heading", { name: "商品详情 P002" })).toBeVisible();
  await page.getByRole("link", { name: "返回筛选列表" }).click();
  await expect(page.getByRole("article")).toHaveCount(6);
  await expect(page.getByText(/全部：6 种/)).toContainText("总库存 52 件");
  await page.getByRole("button", { name: "查看分类报表" }).click();
  await expect(page.getByRole("table", { name: "按分类汇总（本地库存）" })).toBeVisible();
  expect(failures).toEqual([]);
});

test("键盘编辑、保存快照、刷新和本地详情贯通静态产物", async ({ page }) => {
  const tabTo = async (target) => {
    for (let count = 0; count < 60; count += 1) {
      if (await target.evaluate((element) => element === document.activeElement)) return;
      await page.keyboard.press("Tab");
    }
    throw new Error("Tab 未到达目标控件");
  };
  await page.goto("/js_web/#/products");
  await expect(page.getByRole("heading", { name: "库存管理" })).toBeFocused();
  await page.keyboard.press("/");
  const search = page.getByRole("textbox", { name: "搜索名称（按 / 聚焦）" });
  await expect(search).toBeFocused();
  await page.keyboard.type("鼠标");
  await expect(search).toHaveValue("鼠标");
  const mouse = page.getByRole("article", { name: "无线鼠标" });
  await tabTo(mouse.getByRole("button", { name: "编辑" }));
  await page.keyboard.press("Enter");
  await expect(page.getByRole("textbox", { name: "商品名称（必填）" })).toBeFocused();
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("spinbutton", { name: "库存数量（必填）" })).toBeFocused();
  await page.keyboard.press("ControlOrMeta+A");
  await page.keyboard.type("3");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("textbox", { name: "单价（元，必填）" })).toBeFocused();
  await page.keyboard.press("ControlOrMeta+A");
  await page.keyboard.type("0.29");
  await tabTo(page.getByRole("button", { name: "保存商品" }));
  await page.keyboard.press("Enter");
  await expect(mouse).toContainText("库存：3 件");
  await expect(mouse).toContainText("¥0.29");
  await expect(page.getByRole("heading", { name: "库存管理" })).toBeFocused();
  await tabTo(page.getByRole("button", { name: "保存本地快照" }));
  await page.keyboard.press("Enter");
  await expect(page.getByRole("region", { name: "本地库存快照" })).toContainText("本地快照已保存");
  await page.reload();
  await expect(mouse).toContainText("库存：3 件");
  await expect(mouse).toContainText("¥0.29");
  await expect(search).toHaveValue("鼠标");
  await expect(page.getByText(/全部：6 种/)).toContainText("总库存 55 件 · 库存总价值 ¥26348.87");
  await tabTo(mouse.getByRole("link", { name: "查看缓存详情" }));
  await page.keyboard.press("Enter");
  await expect(page.getByRole("region", { name: "本地商品详情" })).toContainText("本地库存 3 件 · ¥0.29");
  await expect(page.getByRole("region", { name: "缓存商品详情" })).toContainText("缓存库存 0 件 · ¥129.00");
  await tabTo(page.getByRole("link", { name: "返回筛选列表" }));
  await page.keyboard.press("Enter");
  await expect(search).toHaveValue("鼠标");
  await expect(mouse).toContainText("库存：3 件");
});
