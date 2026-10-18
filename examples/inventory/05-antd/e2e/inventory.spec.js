import { test, expect } from "@playwright/test";

const home = "/js_web/";
const storageKey = "js_web:inventory:products:v1";

test("排序后编辑身份正确，校验、取消、保存与焦点形成闭环", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(home);
  await expect(page.getByRole("status")).toContainText("总库存 52 件，库存总价值 26348.00 元");
  await page.getByRole("columnheader", { name: "库存", exact: true }).click();
  const trigger = page.getByRole("button", { name: "编辑无线鼠标", exact: true });
  await trigger.focus();
  await page.keyboard.press("Enter");
  let dialog = page.getByRole("dialog");
  await expect(dialog).toHaveAccessibleName("编辑 P002 无线鼠标");
  await expect(dialog.getByLabel("商品名称", { exact: true })).toBeFocused();
  await dialog.getByLabel("库存数量").fill("8");
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
  await trigger.press("Enter");
  dialog = page.getByRole("dialog");
  const stock = dialog.getByLabel("库存数量");
  await expect(stock).toHaveValue("0");
  await stock.fill("");
  await dialog.getByRole("button", { name: "保存", exact: true }).click();
  await expect(dialog.getByText("请输入 0–99999 的整数库存。", { exact: true })).toBeVisible();
  await expect(stock).toBeFocused();
  await stock.fill("3");
  await dialog.getByRole("button", { name: "保存", exact: true }).click();
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
  await expect(page.getByRole("status")).toContainText("总库存 55 件，库存总价值 26735.00 元");
  await page.getByRole("button", { name: "保存本地快照", exact: true }).click();
  await page.reload();
  await expect(page.getByRole("status")).toContainText("总库存 55 件");
  expect(errors).toEqual([]);
});

test("全字段编辑复用单位、分类与标签规则", async ({ page }) => {
  await page.goto(home);
  await page.getByRole("button", { name: "编辑USB-C 扩展坞", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("商品名称", { exact: true }).fill("  USB-C 扩展坞  ");
  await dialog.getByLabel("库存数量").fill("0");
  await dialog.getByLabel("价格（元）").fill("299.001");
  await dialog.getByRole("button", { name: "保存", exact: true }).click();
  await expect(dialog.getByLabel("价格（元）")).toBeFocused();
  await dialog.getByLabel("价格（元）").fill("299.01");
  await dialog.getByLabel("分类", { exact: true }).click();
  await page.getByRole("option", { name: "音频", exact: true }).click();
  await dialog.getByLabel("热销").uncheck();
  await dialog.getByRole("button", { name: "保存", exact: true }).click();
  await expect(dialog).toBeHidden();
  const row = page.getByRole("row").filter({ hasText: "USB-C 扩展坞" });
  await expect(row).toContainText("音频");
  await expect(row).toContainText("299.01");
  await expect(row).toContainText("新品");
  await expect(row).not.toContainText("热销");
});

test("新增、补货、删除、空态与空快照", async ({ page }) => {
  await page.goto(home);
  await page.getByRole("button", { name: "新增商品", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("商品名称", { exact: true }).fill("测试配件");
  await dialog.getByLabel("库存数量").fill("2");
  await dialog.getByLabel("价格（元）").fill("1.20");
  await dialog.getByRole("button", { name: "保存", exact: true }).click();
  await expect(dialog).toBeHidden();
  await expect(page.getByRole("status")).toContainText("共 7 种商品，总库存 54 件");
  await page.getByRole("button", { name: "补货测试配件", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("总库存 55 件");
  await page.getByRole("button", { name: "删除测试配件", exact: true }).click();
  await page.getByLabel("搜索商品", { exact: true }).fill("不存在");
  await expect(page.getByText("没有符合条件的商品", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "清空筛选", exact: true }).click();
  await expect(page.getByRole("button", { name: "编辑无线鼠标", exact: true })).toBeVisible();
  await page.evaluate((key) => localStorage.setItem(key, JSON.stringify({ version: 1, products: [] })), storageKey);
  await page.reload();
  await expect(page.getByRole("status")).toContainText("共 0 种商品，总库存 0 件");
  await expect(page.getByText("没有符合条件的商品", { exact: true })).toBeVisible();
});

test("坏快照保留原记录、显式恢复，保存失败提示且内存数据保留", async ({ page }) => {
  await page.goto(home);
  await page.evaluate((key) => localStorage.setItem(key, "broken-json"), storageKey);
  await page.reload();
  await expect(page.getByText(/本地库存无法读取/)).toBeVisible();
  expect(await page.evaluate((key) => localStorage.getItem(key), storageKey)).toBe("broken-json");
  await page.getByRole("button", { name: "清除快照并恢复初始商品", exact: true }).click();
  expect(await page.evaluate((key) => localStorage.getItem(key), storageKey)).toBeNull();
  await page.getByRole("button", { name: "补货无线鼠标", exact: true }).click();
  await page.evaluate(() => { Storage.prototype.setItem = () => { throw new DOMException("blocked", "SecurityError"); }; });
  await page.getByRole("button", { name: "保存本地快照", exact: true }).click();
  await expect(page.getByText(/保存本地快照失败/)).toBeVisible();
  await expect(page.getByRole("status")).toContainText("总库存 53 件");
});

test("主题覆盖 Portal 弹窗，窄屏只在表格内滚动，Tab 留在弹窗", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto(home);
  await page.getByRole("button", { name: "深色主题", exact: true }).click();
  await page.getByRole("button", { name: "编辑无线鼠标", exact: true }).click();
  const dialog = page.getByRole("dialog");
  const name = dialog.getByLabel("商品名称", { exact: true });
  await expect(name).toBeFocused();
  const inputBackground = await name.evaluate((node) => getComputedStyle(node).backgroundColor);
  expect(inputBackground).toBe("rgb(20, 20, 20)");
  for (let i = 0; i < 24; i++) {
    await page.keyboard.press(i < 12 ? "Tab" : "Shift+Tab");
    expect(await page.evaluate(() => Boolean(document.activeElement.closest('[role="dialog"]')))).toBe(true);
  }
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(await page.locator(".ant-table-content").evaluate((node) => node.scrollWidth > node.clientWidth)).toBe(true);
});

test("表单保留错误可复现；正确参考在相同商品重开与切换时重置", async ({ page }) => {
  for (const mode of ["broken", "fixed"]) {
    await page.goto(`/js_web/labs/lifecycle.html?case=${mode}`);
    await page.getByRole("button", { name: "编辑机械键盘", exact: true }).click();
    let dialog = page.getByRole("dialog");
    await dialog.getByLabel("库存数量").fill("8");
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await page.getByRole("button", { name: "编辑无线鼠标", exact: true }).click();
    dialog = page.getByRole("dialog");
    await expect(dialog).toHaveAccessibleName("编辑 P002 无线鼠标");
    await expect(dialog.getByLabel("库存数量")).toHaveValue(mode === "broken" ? "8" : "0");
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  }
});
