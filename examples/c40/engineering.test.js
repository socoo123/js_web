import { readFileSync } from "node:fs";
import { afterAll, beforeAll, expect, test } from "../inventory/04-react/node_modules/vitest/dist/index.js";
import { chromium } from "../inventory/04-react/node_modules/@playwright/test/index.mjs";

const base = process.env.C40_BASE_URL ?? "http://127.0.0.1:8040/index.html";
let browser;
beforeAll(async () => { browser = await chromium.launch({ channel: "chrome" }); });
afterAll(async () => { await browser?.close(); });

async function open(action, setup = async () => {}) {
  const page = await browser.newPage();
  try {
    await setup(page);
    await page.goto(base);
    await action(page);
  } finally { await page.close(); }
}

async function snapshot(page) {
  return page.evaluate(() => new Promise((resolve) => {
    sap.ui.require(["sap/ui/core/Component"], (Component) => {
      const component = Component.getComponentById("container-inventory");
      if (!component?.getRootControl()) return resolve({ rows: [] });
      const view = component.getRootControl();
      resolve({
        rows: view.byId("products").getItems().map((item) => ({
          title: item.getTitle(), info: item.getInfo(),
        })),
        products: component.getModel("inventory").getProperty("/products"),
        message: view.byId("message").getText(),
      });
    });
  }));
}

test("Component 与 manifest 加载六件固定商品，绑定保留库存 0", async () => {
  const failures = [];
  await open(async (page) => {
    await expect.poll(async () => (await snapshot(page)).rows.length, { timeout: 15000 }).toBe(6);
    const state = await snapshot(page);
    const fixed = JSON.parse(readFileSync(new URL("../shared/products.json", import.meta.url)));
    expect(state.products).toEqual(fixed);
    expect(state.products.reduce((sum, product) => sum + product.stock, 0)).toBe(52);
    expect(state.rows[1]).toEqual({ title: "无线鼠标", info: "0" });
    expect(failures).toEqual([]);
  }, async (page) => {
    page.on("pageerror", (error) => failures.push(error.message));
    page.on("response", (response) => {
      if (response.status() >= 400) failures.push(`${response.status()} ${response.url()}`);
    });
    if (process.env.C40_BROKEN_BINDING) await page.route("**/view/Inventory.view.xml", async (route) => {
      const response = await route.fetch();
      await route.fulfill({ response, body: (await response.text()).replace("inventory>stock", "inventory>Stock") });
    });
  });
});

test("Input 与 Controller 模块连接，空编号和不存在的编号有反馈", async () => {
  await open(async (page) => {
    await expect.poll(async () => (await snapshot(page)).rows.length, { timeout: 15000 }).toBe(6);
    const button = page.getByRole("button", { name: "查看商品", exact: true });
    const input = page.getByRole("textbox", { name: "商品编号", exact: true });
    await button.click();
    await expect.poll(async () => (await snapshot(page)).message).toBe("P002 无线鼠标 · 库存 0 件");
    await input.fill("  P001  ");
    await button.click();
    await expect.poll(async () => (await snapshot(page)).message).toBe("P001 机械键盘 · 库存 12 件");
    await input.fill(""); await button.click();
    expect((await snapshot(page)).message).toBe("请输入商品编号。");
    await input.fill("P999"); await button.click();
    expect((await snapshot(page)).message).toBe("未找到商品。");
    await page.reload();
    await expect.poll(async () => (await snapshot(page)).rows.length, { timeout: 15000 }).toBe(6);
    expect((await snapshot(page)).message).toBe("输入编号后查看商品。");
  });
});

test("错误模块路径产生可定位的 404，恢复路径后可启动", async () => {
  let missing;
  await open(async (page) => {
    const response = await missing;
    expect(response.status()).toBe(404);
  }, async (page) => {
    missing = page.waitForResponse((response) => response.url().endsWith("/model/findProducts.js"), { timeout: 15000 });
    // 只对开发源码注入故障；生产预加载文件的验证使用前两条测试。
    await page.route("**/controller/Inventory.controller.js", async (route) => {
      const response = await route.fetch();
      await route.fulfill({ response, body: (await response.text()).replace("model/findProduct", "model/findProducts") });
    });
  });
  await open(async (page) => {
    await expect.poll(async () => (await snapshot(page)).rows.length, { timeout: 15000 }).toBe(6);
  });
});
