import { afterAll, beforeAll, expect, test } from "../inventory/04-react/node_modules/vitest/dist/index.js";
import { chromium } from "../inventory/04-react/node_modules/@playwright/test/index.mjs";

const base = process.env.C41_BASE_URL ?? "http://127.0.0.1:8040/index.html";
let browser;
beforeAll(async () => { browser = await chromium.launch({ channel: "chrome" }); });
afterAll(async () => { await browser?.close(); });
async function state(page) {
  await page.locator(".sapMPage").first().waitFor();
  return page.evaluate(() => new Promise((resolve) => {
    sap.ui.require(["sap/ui/core/Component"], (Component) => {
      const view = Component.getComponentById("container-inventory")?.byId("inventoryView");
      if (!view) return resolve({ rows: [] });
      const table = view.byId("products");
      resolve({
        rows: table.getItems().map((item) => ({
          path: item.getBindingContext("inventory").getPath(),
          id: item.getBindingContext("inventory").getProperty("id"),
          title: item.getCells()[0].getTitle(), stock: item.getCells()[2].getNumber(),
          status: item.getCells()[2].getState(), price: item.getCells()[3].getNumber(),
        })),
        products: view.getModel("inventory").getProperty("/products"),
        ui: view.getModel("ui").getData(), draft: view.getModel("draft")?.getData(),
        dialogCount: document.querySelectorAll('[role="dialog"]').length,
      });
    });
  }));
}
async function open(action, setup = async () => {}) {
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  page.on("response", (response) => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
  try {
    await setup(page);
    if (process.env.C41_BROKEN_DRAFT || process.env.C41_BROKEN_PATH) {
      await page.route("**/controller/Inventory.controller.js", async (route) => {
        const response = await route.fetch();
        let body = await response.text();
        if (process.env.C41_BROKEN_DRAFT) body = body.replace("rules.toDraft(context.getObject())", "context.getObject()");
        if (process.env.C41_BROKEN_PATH) body = body.replace("this._editPath = context.getPath()", 'this._editPath = "/products/0"');
        await route.fulfill({ response, body });
      });
    }
    await page.goto(base);
    await expect.poll(async () => (await state(page)).rows.length, { timeout: 20000 }).toBe(6);
    await action(page);
    expect(errors).toEqual([]);
  } finally { await page.close(); }
}
async function search(page, query) {
  const field = page.getByRole("searchbox", { name: "搜索名称或编号", exact: true });
  await field.fill(query); await field.press("Enter");
}
async function edit(page, id) {
  await page.getByRole("row").filter({ hasText: id }).getByRole("button", { name: /编辑$/ }).click();
  await page.getByRole("dialog", { name: "编辑商品", exact: true }).waitFor();
}

test("真实 JSONModel 的属性、表达式与 formatter 显示 0 和整数分", async () => {
  await open(async (page) => {
    const snapshot = await state(page);
    expect(snapshot.ui).toMatchObject({ count: 6, stock: 52, valueCents: 2634800 });
    expect(snapshot.rows[1]).toMatchObject({ stock: "0", status: "Error", price: "129.00" });
    const result = await page.evaluate(() => new Promise((resolve) => {
      sap.ui.require(["sap/ui/model/json/JSONModel"], (JSONModel) => {
        const model = new JSONModel({ product: { stock: 0 } });
        const binding = model.bindProperty("/product/stock");
        let changes = 0; binding.attachChange(() => { changes++; }); binding.initialize();
        const before = changes; model.setProperty("/product/stock", 3);
        resolve([model.getDefaultBindingMode(), model.getProperty("/product/stock"), changes > before, typeof model.getProperty("/product/Stock")]);
        model.destroy();
      });
    }));
    expect(result).toEqual(["TwoWay", 3, true, "undefined"]);
  });
});

test("筛选保留原数组，空集合汇总为 0，清空恢复六件商品", async () => {
  await open(async (page) => {
    await search(page, "  P004  ");
    await expect.poll(async () => (await state(page)).ui.count).toBe(1);
    const snapshot = await state(page);
    expect(snapshot.rows[0]).toMatchObject({ id: "P004", path: "/products/3" });
    expect(snapshot.products).toHaveLength(6);
    expect(snapshot.ui).toMatchObject({ stock: 3, valueCents: 89700 });
    await search(page, "不存在");
    await expect.poll(async () => (await state(page)).ui.count).toBe(0);
    expect((await state(page)).ui).toMatchObject({ stock: 0, valueCents: 0 });
    await search(page, "");
    await expect.poll(async () => (await state(page)).ui.stock).toBe(52);
    await search(page, "鼠标");
    await expect.poll(async () => (await state(page)).rows[0]?.id).toBe("P002");
  });
});

test("草稿双向绑定隔离原商品，取消和 Escape 丢弃编辑，重复打开不重复创建", async () => {
  await open(async (page) => {
    await edit(page, "P002");
    await page.getByRole("textbox", { name: "库存", exact: true }).fill("3");
    expect((await state(page)).draft.stock).toBe("3");
    expect((await state(page)).products[1].stock).toBe(0);
    await page.getByRole("button", { name: "取消", exact: true }).click();
    await edit(page, "P001");
    expect((await state(page)).draft.stock).toBe("12");
    expect((await state(page)).dialogCount).toBe(1);
    await page.keyboard.press("Escape");
    await edit(page, "P002");
    expect((await state(page)).draft.stock).toBe("0");
    await page.getByRole("button", { name: "取消", exact: true }).click();
    expect((await state(page)).ui.stock).toBe(52);
  });
});

test("非法字段阻止保存并聚焦；筛选后的保存回写原路径且标签保留", async () => {
  await open(async (page) => {
    await search(page, "P004");
    await expect.poll(async () => (await state(page)).ui.count).toBe(1);
    await edit(page, "P004");
    const stock = page.getByRole("textbox", { name: "库存", exact: true });
    const price = page.getByRole("textbox", { name: "单价（元）", exact: true });
    const save = page.getByRole("button", { name: "保存", exact: true });
    await stock.fill(""); await price.fill("1.234"); await save.click();
    expect((await state(page)).draft.hasErrors).toBe(true);
    expect((await state(page)).products[3].stock).toBe(3);
    expect(await stock.evaluate((node) => node === document.activeElement)).toBe(true);
    await stock.fill("0"); await price.fill("299.01"); await save.click();
    await expect.poll(async () => (await state(page)).ui.stock).toBe(0);
    const snapshot = await state(page);
    expect(snapshot.products[3]).toMatchObject({ id: "P004", stock: 0, priceCents: 29901, tags: ["热销", "新品"] });
    expect(snapshot.products[0].stock).toBe(12);
    await search(page, "");
    await expect.poll(async () => (await state(page)).ui.stock).toBe(49);
  });
});

test("P002 补到 3 件后汇总更新，重命名失配会离开筛选结果，刷新恢复", async () => {
  await open(async (page) => {
    await edit(page, "P002");
    await page.getByRole("textbox", { name: "库存", exact: true }).fill("3");
    await page.getByRole("button", { name: "保存", exact: true }).click();
    await expect.poll(async () => (await state(page)).ui.stock).toBe(55);
    expect((await state(page)).ui.valueCents).toBe(2673500);
    await search(page, "无线鼠标");
    await edit(page, "P002");
    await page.getByRole("textbox", { name: "名称", exact: true }).fill("  办公鼠标  ");
    await page.getByRole("button", { name: "保存", exact: true }).click();
    await expect.poll(async () => (await state(page)).ui.count).toBe(0);
    await page.reload();
    await expect.poll(async () => (await state(page)).ui.stock).toBe(52);
    expect((await state(page)).products[1].name).toBe("无线鼠标");
  });
});

test("语言选择保留子路径并重载，英文资源、校验和返回中文可用", async () => {
  await open(async (page) => {
    const oldPath = new URL(page.url()).pathname;
    await page.getByRole("combobox", { name: "界面语言", exact: true }).press("Space");
    await page.getByRole("option", { name: "English", exact: true }).click();
    await page.waitForURL(/sap-ui-language=en/);
    await page.getByRole("button", { name: "Inspect product", exact: true }).waitFor();
    expect(new URL(page.url()).pathname).toBe(oldPath);
    await page.getByRole("button", { name: "Inspect product", exact: true }).click();
    await expect.poll(async () => (await state(page)).ui.message).toBe("P002 无线鼠标 · Stock 0");
    await page.getByRole("row").filter({ hasText: "P002" }).getByRole("button", { name: /Edit$/ }).click();
    const dialog = page.getByRole("dialog", { name: "Edit product", exact: true });
    await dialog.waitFor();
    await page.getByRole("textbox", { name: "Stock", exact: true }).fill("-1");
    await page.getByRole("button", { name: "Save", exact: true }).click();
    expect((await state(page)).draft.errors.stock).toBe(true);
    await dialog.getByText("Correct the highlighted fields before saving.").waitFor();
    await page.getByRole("button", { name: "Cancel", exact: true }).click();
    await page.getByRole("combobox", { name: "Language", exact: true }).press("Space");
    await page.getByRole("option", { name: "中文", exact: true }).click();
    await page.waitForURL(/sap-ui-language=zh-CN/);
    await page.getByRole("button", { name: "查看商品", exact: true }).waitFor();
  });
});
