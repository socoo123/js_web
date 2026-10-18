import { afterAll, beforeAll, expect, test } from "../inventory/04-react/node_modules/vitest/dist/index.js";
import { chromium } from "../inventory/04-react/node_modules/@playwright/test/index.mjs";

// 先启动 README 中的本地 HTTP 服务；用真实 UI5 验证绑定，而非模拟 JSONModel。
const base = process.env.C39_BASE_URL ?? "http://127.0.0.1:8039/c39/";
let browser;
beforeAll(async () => { browser = await chromium.launch({ channel: "chrome" }); });
afterAll(async () => { await browser?.close(); });

async function withPage(query, action) {
  const page = await browser.newPage();
  try {
    await page.goto(new URL(query, base).href);
    await page.getByRole("button", { name: "补货 3 件", exact: true }).waitFor();
    await action(page);
  } finally { await page.close(); }
}

async function readStock(page) {
  return page.evaluate(() => new Promise((resolve) => {
    sap.ui.require(["sap/ui/core/Element"], (Element) => {
      const view = Element.getElementById("inventory-view");
      resolve({
        model: view.getModel("inventory").getProperty("/product/stock"),
        text: view.byId("stock").getText(),
      });
    });
  }));
}

test("补货通知绑定，保留数值类型，刷新恢复初始数据", async () => {
  await withPage(process.env.C39_BROKEN ? "?case=broken" : "", async (page) => {
    expect(await readStock(page)).toEqual({ model: 0, text: "0" });
    await page.getByRole("button", { name: "补货 3 件", exact: true }).click();
    await expect.poll(() => readStock(page)).toEqual({ model: 3, text: "3" });
    await page.getByRole("button", { name: "补货 3 件", exact: true }).click();
    await expect.poll(() => readStock(page)).toEqual({ model: 6, text: "6" });
    await page.reload();
    await page.getByRole("button", { name: "补货 3 件", exact: true }).waitFor();
    expect(await readStock(page)).toEqual({ model: 0, text: "0" });
  });
});

test("错误起点可复现模型为 3 而控件仍显示 0", async () => {
  await withPage("?case=broken", async (page) => {
    await page.getByRole("button", { name: "补货 3 件", exact: true }).click();
    expect(await readStock(page)).toEqual({ model: 3, text: "0" });
  });
});

test("经典控件有 UI5 元数据，未注册同名 Web Component", async () => {
  await withPage("", async (page) => {
    const result = await page.evaluate(() => new Promise((resolve) => {
      sap.ui.require(["sap/m/Button"], (Button) => resolve({
        name: Button.getMetadata().getName(), registered: !!customElements.get("ui5-button"),
      }));
    }));
    expect(result).toEqual({ name: "sap.m.Button", registered: false });
  });
});
