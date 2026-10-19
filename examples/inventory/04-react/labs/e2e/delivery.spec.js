import { test, expect } from "@playwright/test";

const url = (mode) => `/js_web/labs/delivery.html?case=${mode}`;
test("资源路径和请求故障具有不同证据，答案恢复正常", async ({ page }) => {
  const missing = page.waitForResponse((response) => response.url().endsWith("/media/inventory.svg"));
  await page.goto(url("asset"));
  expect((await missing).status()).toBe(404);
  await page.goto(url("asset-answer"));
  await expect.poll(() => page.getByRole("img", { name: "库存", exact: true }).evaluate((image) => image.naturalWidth)).toBe(96);
  await page.goto(url("request"));
  await expect(page.getByRole("alert")).toContainText("HTTP 404");
  const html = page.waitForResponse((response) => response.url().endsWith("/data/products/missing.json"));
  await page.goto(url("html-response"));
  expect((await html).status()).toBe(200);
  await expect(page.getByRole("alert")).toContainText("not valid JSON");
  await page.goto(url("request-answer"));
  await expect(page.getByRole("status")).toContainText("详情已加载：P002");
  const context = page.context();
  await context.setOffline(true);
  await page.getByRole("button", { name: "重新加载", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("Failed to fetch");
  await context.setOffline(false);
  await page.getByRole("button", { name: "重试详情" }).click();
  await expect(page.getByRole("status")).toContainText("详情已加载：P002");
});

test("同引用状态与移动溢出可复现，正确版本通过", async ({ page }) => {
  await page.goto(url("state"));
  await page.getByRole("button", { name: "给键盘补 1 件" }).click();
  await expect(page.getByRole("status")).toHaveText("库存：12 件");
  await page.goto(url("state-answer"));
  await page.getByRole("button", { name: "给键盘补 1 件" }).click();
  await expect(page.getByRole("status")).toHaveText("库存：13 件");
  await page.setViewportSize({ width: 360, height: 800 });
  const overflows = () => page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
  await page.goto(url("overflow"));
  expect(await overflows()).toBe(true);
  await page.goto(url("overflow-answer"));
  expect(await overflows()).toBe(false);
  await page.getByRole("button", { name: "保存检查结果" }).focus();
  await expect(page.getByRole("button", { name: "保存检查结果" })).toBeFocused();
});

test("坏存储保留原文并恢复数据；监听器释放有可观察差异", async ({ page }) => {
  await page.goto(url("storage"));
  await page.getByRole("button", { name: "写入损坏副本并读取" }).click();
  await expect(page.getByRole("status")).toContainText("原记录保留");
  await expect(page.getByText("总库存 52", { exact: true })).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem("js_web:c45:products:v1"))).toBe("{");
  await page.getByRole("button", { name: "清除实验副本" }).click();
  expect(await page.evaluate(() => localStorage.getItem("js_web:c45:products:v1"))).toBeNull();
  const session = await page.context().newCDPSession(page);
  for (const [mode, expected] of [["memory", 3], ["memory-answer", 0]]) {
    await page.goto(url(mode));
    for (let count = 0; count < 3; count += 1) {
      await page.getByRole("button", { name: "开启探针" }).click();
      await page.getByRole("button", { name: "关闭探针" }).click();
    }
    await expect(page.locator(".c45-stock-probe")).toHaveCount(0);
    const { result } = await session.send("Runtime.evaluate", { expression: "window" });
    const { listeners } = await session.send("DOMDebugger.getEventListeners", { objectId: result.objectId });
    expect(listeners.filter((listener) => listener.type === "c45-stock-probe")).toHaveLength(expected);
    await session.send("Runtime.releaseObject", { objectId: result.objectId });
  }
});
