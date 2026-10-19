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
