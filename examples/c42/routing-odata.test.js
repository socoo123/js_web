import { afterAll, beforeAll, expect, test } from "../inventory/04-react/node_modules/vitest/dist/index.js";
import { chromium } from "../inventory/04-react/node_modules/@playwright/test/index.mjs";
import { readFileSync } from "node:fs";

const base = process.env.C42_BASE_URL ?? "http://127.0.0.1:8040/index.html";
let browser;
beforeAll(async () => { browser = await chromium.launch({ channel: "chrome" }); });
afterAll(async () => { await browser?.close(); });
async function open(url, action, setup = async () => {}) {
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  page.on("response", (response) => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
  try {
    await setup(page);
    if (process.env.C42_BROKEN_SET) await page.route("**/test/OData.controller.js", async (route) => {
      const response = await route.fetch();
      await route.fulfill({ response, body: (await response.text()).replace('read("/Products",', 'read("/products",') });
    });
    await page.goto(url);
    await page.locator(".sapMPage").first().waitFor();
    await action(page);
    expect(errors).toEqual([]);
  } finally { await page.close(); }
}
async function state(page) {
  await page.locator(".sapMPage").first().waitFor();
  return page.evaluate(() => new Promise((resolve) => {
    if (!globalThis.sap?.ui?.require) return resolve({});
    sap.ui.require(["sap/ui/core/Component"], (Component) => {
      const component = Component.getComponentById("container-inventory");
      const detail = component?.byId("detailView");
      resolve({
        status: detail?.getModel("detail")?.getProperty("/status"),
        id: detail?.getBindingContext("inventory")?.getProperty("id"),
        stock: detail?.byId("detailStock").getNumber(),
        count: component?.byId("inventoryView")?.byId("products").getItems().length,
      });
    });
  }));
}

test("筛选第一行按业务编号进入详情；返回、浏览器前进后退与刷新一致", async () => {
  await open(base, async (page) => {
    const search = page.getByRole("searchbox", { name: "搜索名称或编号", exact: true });
    await search.fill("P004"); await search.press("Enter");
    await expect.poll(async () => (await state(page)).count, { timeout: 15000 }).toBe(1);
    await page.getByRole("row").filter({ hasText: "P004" }).getByText("USB-C 扩展坞", { exact: true }).click();
    await expect.poll(async () => (await state(page)).id, { timeout: 15000 }).toBe("P004");
    expect((await state(page)).stock).toBe("3");
    expect(new URL(page.url()).hash).toBe("#/products/P004");
    await page.goBack(); await search.waitFor({ state: "visible" });
    await page.goForward();
    await page.getByRole("button", { name: "返回列表", exact: true }).waitFor();
    await page.reload();
    await expect.poll(async () => (await state(page)).id, { timeout: 15000 }).toBe("P004");
    await page.getByRole("button", { name: "返回列表", exact: true }).click();
    await search.waitFor({ state: "visible" });
  }, async (page) => {
    if (process.env.C42_BROKEN_ID) await page.route("**/controller/Inventory.controller.js", async (route) => {
      const response = await route.fetch();
      const body = (await response.text()).replace('getProperty("id");\n      this.getOwnerComponent().getRouter()', 'getPath().split("/").at(-1);\n      this.getOwnerComponent().getRouter()');
      await route.fulfill({ response, body });
    });
  });
});

test("冷启动详情等待 JSON；快速改编号采用最后一个地址；零库存和无历史返回可用", async () => {
  await open(`${base}#/products/P001`, async (page) => {
    await expect.poll(async () => (await state(page)).status, { timeout: 15000 }).toBe("loading");
    await page.evaluate(() => { window.location.hash = "/products/P002"; });
    await expect.poll(async () => (await state(page)).id, { timeout: 15000 }).toBe("P002");
    expect((await state(page)).stock).toBe("0");
    await page.getByRole("button", { name: "返回列表", exact: true }).click();
    await page.getByRole("searchbox").waitFor({ state: "visible" });
  }, async (page) => {
    await page.route("**/model/products.json", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 3000));
      await route.continue();
    });
  });
});

test("不存在的编号和未知 hash 有不同反馈；列表编辑会更新详情", async () => {
  await open(`${base}#/products/P999`, async (page) => {
    await expect.poll(async () => (await state(page)).status, { timeout: 15000 }).toBe("missing");
    await page.getByText("未找到商品。", { exact: true }).waitFor({ state: "visible" });
    await page.evaluate(() => { window.location.hash = "/wrong/path"; });
    const missingPage = page.locator(".sapMPage").filter({ has: page.getByRole("heading", { name: "页面地址不存在", exact: true }) });
    await missingPage.getByRole("button", { name: "返回列表", exact: true }).click();
    const row = page.getByRole("row").filter({ hasText: "P002" });
    await row.getByRole("button", { name: /编辑$/ }).click();
    await page.getByRole("textbox", { name: "库存", exact: true }).fill("3");
    await page.getByRole("button", { name: "保存", exact: true }).click();
    await row.getByText("无线鼠标", { exact: true }).click();
    await expect.poll(async () => (await state(page)).id, { timeout: 15000 }).toBe("P002");
    expect((await state(page)).stock).toBe("3");
  });
});

test("详情加载失败与商品不存在分开，刷新成功后恢复", async () => {
  await open(`${base}#/products/P002`, async (page) => {
    await expect.poll(async () => (await state(page)).status, { timeout: 15000 }).toBe("error");
    await page.getByText("商品加载失败，请刷新后重试。", { exact: true }).waitFor();
    await page.unroute("**/model/products.json");
    await page.reload();
    await expect.poll(async () => (await state(page)).id, { timeout: 15000 }).toBe("P002");
  }, async (page) => {
    // 请求成功但缺少约定的 products，避免把故意 HTTP 错误混入资源检查。
    await page.route("**/model/products.json", (route) => route.fulfill({ json: {} }));
  });
});

async function mockState(page) {
  return page.evaluate(() => new Promise((resolve) => {
    if (!globalThis.sap?.ui?.require) return resolve({ count: 0 });
    sap.ui.require(["sap/ui/core/Element"], (Element) => {
      const view = Element.getElementById("odataView");
      resolve({ count: view?.byId("odataProducts").getItems().length ?? 0,
        result: view?.getModel("probe")?.getProperty("/result") });
    });
  }));
}
test("真实 V2 Model 读取元数据、绑定六件商品，有限查询、主键和未缓存属性行为正确", async () => {
  const url = new URL("test/odata.html", base).href;
  await open(url, async (page) => {
    await expect.poll(async () => (await mockState(page)).count, { timeout: 20000 }).toBe(6);
    await page.getByRole("row").filter({ hasText: "P002" }).getByText("0", { exact: true }).waitFor();
    const metadata = await page.evaluate(() => new Promise((resolve) => {
      sap.ui.require(["sap/ui/core/Element"], (Element) => {
        const model = Element.getElementById("odataView").getModel("odata");
        resolve(model.getServiceMetadata().dataServices.schema[0].entityContainer[0].entitySet[0].name);
      });
    }));
    expect(metadata).toBe("Products");
    await page.getByRole("button", { name: "有限查询", exact: true }).click();
    await expect.poll(async () => (await mockState(page)).result, { timeout: 15000 }).toBe("P006 降噪耳机 5；P004 USB-C 扩展坞 3");
    const messages = [];
    page.on("console", (message) => { if (message.type() === "log") messages.push(message.text()); });
    await page.evaluate(readFileSync(new URL("./read-console.js", import.meta.url), "utf8"));
    await expect.poll(() => messages).toContain("P002 0");
    await page.evaluate(readFileSync(new URL("./cache-console.js", import.meta.url), "utf8"));
    await expect.poll(() => messages).toContain("0");
    await expect.poll(() => messages).toContain("undefined");
  });
});
