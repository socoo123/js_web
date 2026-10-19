import { expect, test } from "@playwright/test";

const issues = new WeakMap();
test.beforeEach(async ({ page }) => {
  const errors = [];
  issues.set(page, errors);
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  page.on("response", (response) => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
  page.on("requestfailed", (request) => errors.push(request.url()));
  if (process.env.C44_BROKEN_FORM) await page.route("**/src/ProductEditor.jsx", async (route) => {
    const response = await route.fetch();
    await route.fulfill({ response, body: (await response.text()).replace(/jsxDEV\("form",/, "jsxDEV(Form,") });
  });
  await page.goto("./");
  await expect(page.getByRole("textbox", { name: "商品名称", exact: true })).toHaveValue("机械键盘");
});
test.afterEach(async ({ page }) => { expect(issues.get(page)).toEqual([]); });

const choose = async (page, name) => page.locator("ui5-li").filter({ hasText: name }).click();
const field = (page, name) => page.getByRole("textbox", { name, exact: true });
const save = (page) => page.getByRole("button", { name: "保存商品", exact: true });

test("真实 item-click、Input 与保存：P002 从 0 到 3，列表汇总同步", async ({ page }) => {
  await expect(page.locator("#summary")).toHaveText("6 件商品 · 总库存 52 · 库存价值 26348.00 元");
  await choose(page, "无线鼠标");
  await expect(field(page, "库存")).toHaveValue("0");
  await field(page, "库存").fill("3");
  await save(page).click();
  await expect(page.getByRole("status")).toHaveText("P002 已保存。");
  await expect(page.locator("#summary")).toContainText("总库存 55 · 库存价值 26735.00 元");
  await expect(page.locator('ui5-li[data-product-id="P002"]')).toHaveAttribute("description", /库存 3 件/);
  await page.reload();
  await expect(page.locator("#summary")).toContainText("总库存 52");
});

test("Form 只布局；原生提交校验非法字段并聚焦，合法 0 与金额换算", async ({ page }) => {
  await field(page, "商品名称").fill(" ");
  await field(page, "库存").fill("-1");
  await field(page, "单价（元）").fill("1.234");
  await save(page).click();
  await expect(page.locator("form [role=alert]")).toHaveText("保存失败，请修正标出的字段。");
  await expect(field(page, "商品名称")).toBeFocused();
  await expect(page.locator("#edit-stock")).toHaveAttribute("value-state", "Negative");
  await expect(page.locator("#summary")).toContainText("总库存 52");
  await field(page, "商品名称").fill("机械键盘");
  await field(page, "库存").fill("0");
  await field(page, "单价（元）").fill("29.90");
  await save(page).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("status")).toHaveText("P001 已保存。");
  await expect(page.locator("#summary")).toContainText("总库存 40 · 库存价值 21560.00 元");
});

test("受控 Select/CheckBox、key 重置草稿、重置按钮与空列表", async ({ page }) => {
  await choose(page, "USB-C 扩展坞");
  await field(page, "商品名称").fill("未保存的名称");
  await choose(page, "无线鼠标");
  await choose(page, "USB-C 扩展坞");
  await expect(field(page, "商品名称")).toHaveValue("USB-C 扩展坞");
  await page.getByRole("checkbox", { name: "热销", exact: true }).click();
  await expect(page.getByRole("checkbox", { name: "热销", exact: true })).not.toBeChecked();
  const select = page.getByRole("combobox", { name: "分类", exact: true });
  await select.click();
  await page.getByRole("option", { name: "外设", exact: true }).click();
  await save(page).click();
  await expect(page.locator('ui5-li[data-product-id="P004"]')).toHaveAttribute("description", /外设/);
  await choose(page, "无线鼠标");
  await choose(page, "USB-C 扩展坞");
  await expect(page.getByRole("checkbox", { name: "热销", exact: true })).not.toBeChecked();
  await field(page, "库存").fill("9");
  await page.getByRole("button", { name: "重置草稿", exact: true }).click();
  await expect(field(page, "库存")).toHaveValue("3");
  await field(page, "搜索商品").fill("不存在");
  await expect(page.locator('ui5-list[accessible-name="商品列表"]')).toContainText("没有匹配的商品");
  await expect(field(page, "商品名称")).toHaveValue("USB-C 扩展坞");
});

test("资源主题、组件语言、Card slot 与窄屏布局", async ({ page }) => {
  await expect(page.locator("ui5-card-header")).toHaveAttribute("slot", "header");
  await page.selectOption('[aria-label="组件主题"]', "sap_horizon_dark");
  await expect(page.locator("#settings")).toContainText("sap_horizon_dark");
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--sapBackgroundColor").trim())).toBe("#12171c");
  await page.selectOption('[aria-label="组件语言"]', "en");
  await expect(page.locator("#settings")).toContainText("组件语言 en");
  await field(page, "搜索商品").fill("P");
  await expect(page.locator('.toolbar ui5-input [part="clear-icon"]')).toHaveAttribute("accessible-name", "Clear");
  await expect(page.getByRole("heading", { name: "UI5 React · 库存编辑", exact: true })).toBeVisible();
  await page.setViewportSize({ width: 360, height: 800 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
