import { afterAll, beforeAll, expect, test } from "../inventory/04-react/node_modules/vitest/dist/index.js";
import { chromium } from "../inventory/04-react/node_modules/@playwright/test/index.mjs";
import { readFileSync } from "node:fs";

const base = process.env.C43_BASE_URL ?? "http://127.0.0.1:8043/";
let browser;
beforeAll(async () => { browser = await chromium.launch({ channel: "chrome" }); });
afterAll(async () => { await browser?.close(); });
async function open(path, action, setup = async () => {}) {
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  page.on("response", (response) => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
  page.on("requestfailed", (request) => errors.push(`failed ${request.url()}`));
  try {
    await setup(page);
    if (process.env.C43_BROKEN_EVENT) await page.route("**/main.js", async (route) => {
      const response = await route.fetch();
      await route.fulfill({ response, body: (await response.text()).replace('addEventListener("ui5-input",', 'addEventListener("ui5Input",') });
    });
    await page.goto(new URL(path, base).href);
    await page.getByRole("textbox", { name: /补货数量/ }).waitFor();
    await action(page);
    expect(errors).toEqual([]);
  } finally { await page.close(); }
}
const text = async (page, selector) => page.locator(selector).textContent();
async function consoleFile(page, file) {
  const source = readFileSync(new URL(file, import.meta.url), "utf8");
  return page.evaluate(async (code) => {
    const logs = [];
    await new Function("console", `return (async () => { ${code} })()` )({ log: (...args) => logs.push(args) });
    return logs;
  }, source);
}

test("注册、固定数据和真实输入事件；P002 补货按数字更新汇总", async () => {
  await open("index.html", async (page) => {
    await page.waitForFunction(() => document.body.dataset.ready === "true");
    expect(await text(page, "#summary")).toBe("6 件商品 · 总库存 52 · 库存价值 26348.00 元");
    expect(await consoleFile(page, "registered-console.js")).toEqual([[true], [true]]);
    await page.selectOption("#product", "P002");
    const input = page.getByRole("textbox", { name: /补货数量/ });
    const logs = [];
    page.on("console", (message) => { if (message.type() === "log") logs.push(message.text()); });
    await input.fill("4");
    await expect.poll(() => text(page, "#draft")).toBe("输入 4（string）· 补货后 4 件");
    expect(logs).toContain("ui5-input true string");
    await input.fill("3");
    await page.getByRole("button", { name: "补货", exact: true }).click();
    await expect.poll(() => text(page, "#feedback")).toBe("P002 已补货 3 件；当前 3 件。");
    expect(await text(page, "#summary")).toBe("6 件商品 · 总库存 55 · 库存价值 26735.00 元");
    await page.reload();
    await page.waitForFunction(() => document.body.dataset.ready === "true");
    expect(await text(page, "#summary")).toContain("总库存 52");
  });
});

test("空白、非法文本和超上限禁止提交，恢复合法输入并用键盘补货", async () => {
  await open("index.html", async (page) => {
    const input = page.getByRole("textbox", { name: /补货数量/ });
    const button = page.getByRole("button", { name: "补货", exact: true });
    for (const value of ["", " ", "3.8", "3件", "-1", "0", "99999"]) {
      await input.fill(value);
      await expect.poll(() => button.isDisabled()).toBe(true);
      expect(await text(page, "#stock")).toContain("库存 12 件");
    }
    await input.fill("3");
    await expect.poll(() => button.isEnabled()).toBe(true);
    await input.press("Tab");
    await page.keyboard.press("Enter");
    await expect.poll(() => text(page, "#feedback")).toContain("当前 15 件");
  });
});

test("布尔属性存在即为真；Shadow DOM 与 slot 的所有权、样式边界", async () => {
  await open("index.html", async (page) => {
    expect(await consoleFile(page, "attributes-console.js")).toEqual([[true, true], [false], ["boolean"]]);
    expect(await consoleFile(page, "shadow-console.js")).toEqual([["heading"], [null], [true]]);
    const slots = await page.evaluate(() => {
      const card = document.querySelector("#card");
      const header = document.querySelector("#heading");
      return [header.parentElement === card, header.assignedSlot?.name];
    });
    expect(slots).toEqual([true, "header"]);
    await page.addStyleTag({ content: readFileSync(new URL("./parts.css", import.meta.url), "utf8") });
    const styles = await page.locator("#amount").evaluate((element) => {
      const input = element.shadowRoot.querySelector("input");
      return { color: getComputedStyle(input).color, spacing: getComputedStyle(input).letterSpacing };
    });
    expect(styles.color).not.toBe("rgb(255, 0, 0)");
    expect(styles.spacing).toBe("2px");
    await page.locator("#heading").evaluate((element) => { element.slot = "wrong"; });
    await expect.poll(() => page.locator("#heading").evaluate((element) => element.assignedSlot?.name ?? null)).toBeNull();
    await page.locator("#heading").evaluate((element) => { element.slot = "header"; });
    await page.reload();
    await page.getByRole("heading", { name: "机械键盘", exact: true }).waitFor();
  });
});

test("主题和组件语言动态加载；业务文案保持显式控制", async () => {
  const responses = [];
  await open("index.html", async (page) => {
    const clear = page.locator("#amount").locator('[part="clear-icon"]');
    const before = await clear.getAttribute("accessible-name");
    expect(before).toBe("清除");
    const initialColor = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--sapBackgroundColor").trim());
    await page.selectOption("#theme", "sap_horizon_dark");
    await expect.poll(() => text(page, "#settings")).toContain("sap_horizon_dark");
    const color = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--sapBackgroundColor").trim());
    expect(color).toBe("#12171c");
    expect(color).not.toBe(initialColor);
    await page.selectOption("#language", "en");
    await expect.poll(() => text(page, "#settings")).toContain("组件语言 en");
    await expect.poll(() => clear.getAttribute("accessible-name")).toBe("Clear");
    expect(await text(page, "h1")).toBe("原生组件 · 库存补货");
    expect(responses.some((url) => /messagebundle_zh_CN|zh_CN/.test(url))).toBe(true);
    expect(responses.some((url) => /parameters-bundle/.test(url))).toBe(true);
  }, async (page) => { page.on("response", (response) => responses.push(response.url())); });
});

test("React 19 直接传 value/disabled 与监听带连字符的 UI5 事件", async () => {
  await open("react.html", async (page) => {
    const input = page.getByRole("textbox", { name: "补货数量", exact: true });
    await input.fill("7");
    await expect.poll(() => text(page, '[role="status"]')).toBe("当前输入：7");
    await input.fill("");
    await expect.poll(() => page.getByRole("button", { name: "补货", exact: true }).isDisabled()).toBe(true);
    await input.fill("3");
    await expect.poll(() => page.getByRole("button", { name: "补货", exact: true }).isEnabled()).toBe(true);
  });
});
