import assert from "node:assert/strict";
import path from "node:path";
import { createServer } from "vite";
import { chromium, expect } from "@playwright/test";
import { viteConfig, workspace } from "./lab.mjs";

const id = process.argv[2];
if (!/^C2[5-8]$/.test(id ?? "")) throw new Error("用法：node tools/forms-state.browser.mjs C25（支持 C25–C28）");
const lesson = Number(id.slice(1));
const config = await viteConfig(id);
config.cacheDir = path.join(workspace, ".lab/forms-browser-cache");
config.server.port = Number(process.env.LAB_UI_PORT ?? 8067);
config.server.hmr = false;
const server = await createServer(config);
let browser;
try {
  await server.listen();
  browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 360, height: 900 } });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(`http://127.0.0.1:${config.server.port}/`);
  const form = page.getByRole("form", { name: "商品编辑" });
  const row = (productId) => page.locator(`article[data-id="${productId}"]`);
  const edit = (productId) => page.getByRole("button", { name: `编辑 ${productId}`, exact: true }).click();
  await expect(page.locator("#list article")).toHaveCount(6);

  // 真实键盘打开、输入、Enter 失败/成功与取消，不靠脚本触发 submit。
  for (let count = 0; count < 100; count++) {
    if (await page.evaluate(() => document.activeElement?.textContent === "编辑 P002")) break;
    await page.keyboard.press("Tab");
  }
  await expect(page.getByRole("button", { name: "编辑 P002", exact: true })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(form.getByLabel("名称", { exact: true })).toBeFocused();
  await page.keyboard.press("ControlOrMeta+A"); await page.keyboard.insertText("   "); await page.keyboard.press("Enter");
  await expect(form.getByLabel("名称", { exact: true })).toBeFocused();
  await expect(form.getByLabel("名称", { exact: true })).toHaveAttribute("aria-invalid", "true");
  await page.keyboard.press("ControlOrMeta+A"); await page.keyboard.insertText("无线鼠标"); await page.keyboard.press("Tab");
  await page.keyboard.press("ControlOrMeta+A"); await page.keyboard.press("Backspace"); await page.keyboard.press("Enter");
  await expect(form.getByLabel("库存", { exact: true })).toBeFocused();
  await expect(form.getByText("请输入库存，空白无效", { exact: true })).toBeVisible();
  assert.equal(await form.getByLabel("库存", { exact: true }).inputValue(), "");
  assert.equal(await page.evaluate(() => Number(document.querySelector('[name="stock"]').value)), 0);
  await page.keyboard.insertText("0"); await page.keyboard.press("Tab");
  await page.keyboard.press("ControlOrMeta+A"); await page.keyboard.insertText("0.29"); await page.keyboard.press("Enter");
  await expect(form).toHaveCount(0); await expect(row("P002")).toContainText("单价 0.29 元");
  await expect(row("P002")).toContainText("库存 0 件");
  await edit("P002"); await form.getByLabel("名称", { exact: true }).fill("不应保存");
  await form.getByLabel("名称", { exact: true }).focus();
  for (let count = 0; count < 5; count++) await page.keyboard.press("Tab");
  await expect(form.getByRole("button", { name: "取消", exact: true })).toBeFocused();
  await page.keyboard.press("Enter"); await expect(row("P002")).toContainText("无线鼠标");
  console.log(`${id} browser: 键盘打开、空名称/空库存拒绝与错误焦点、0/0.29 Enter 保存、键盘取消通过`);

  if (lesson >= 26) {
    await page.reload();
    await edit("P001"); await form.getByLabel("名称", { exact: true }).fill("键盘未保存");
    await form.getByLabel("库存", { exact: true }).fill(""); await form.getByRole("button", { name: "保存", exact: true }).click();
    await edit("P002"); await expect(form.getByLabel("库存", { exact: true })).toHaveValue("0");
    await expect(form.getByLabel("名称", { exact: true })).toHaveValue("无线鼠标");
    await expect(form.getByLabel("库存", { exact: true })).toHaveAttribute("aria-invalid", "false");
    await form.getByRole("button", { name: "取消", exact: true }).click();
    await edit("P001"); await expect(form.getByLabel("名称", { exact: true })).toHaveValue("机械键盘");
    await form.getByLabel("名称", { exact: true }).fill("同一会话"); await edit("P001");
    await expect(form.getByLabel("名称", { exact: true })).toHaveValue("同一会话");
    await page.getByLabel("排序", { exact: true }).selectOption("stock");
    await expect(form.getByLabel("名称", { exact: true })).toHaveValue("同一会话");
    await form.getByRole("button", { name: "取消", exact: true }).click();
    await edit("P001"); await expect(form.getByLabel("名称", { exact: true })).toHaveValue("机械键盘");
    await form.getByRole("button", { name: "取消", exact: true }).click();
    await edit("P002"); await expect(form.getByLabel("库存", { exact: true })).toHaveValue("0");
    await form.getByRole("button", { name: "取消", exact: true }).click();
    console.log(`${id} browser: 直接切换草稿/错误重置、取消后P002=0、同商品保留/关开重置通过`);
  }

  if (lesson >= 27) {
    await page.reload(); await edit("P001"); await form.getByLabel("名称", { exact: true }).fill("局部草稿");
    await row("P002").getByRole("button", { name: "立即补一件", exact: true }).click();
    await expect(form.getByLabel("名称", { exact: true })).toHaveValue("局部草稿");
    await expect(row("P001")).toContainText("机械键盘"); await expect(page.locator("#summary")).toContainText("库存 53");
    await form.getByRole("button", { name: "取消", exact: true }).click();
    console.log(`${id} browser: Provider 商品更新与本地草稿隔离通过`);
  }

  if (lesson >= 28) {
    await page.reload(); await page.clock.install();
    await row("P001").getByRole("button", { name: "延迟补三件", exact: true }).click();
    await row("P001").getByRole("button", { name: "立即补一件", exact: true }).click();
    await row("P001").getByRole("button", { name: "取消盘点", exact: true }).click();
    await page.clock.runFor(2100); await expect(row("P001").getByRole("status")).toContainText("13 件");
    await row("P001").getByRole("button", { name: "延迟补三件", exact: true }).click();
    await page.clock.runFor(1000);
    await row("P001").getByRole("button", { name: "延迟补三件", exact: true }).click();
    await page.clock.runFor(1000); await expect(row("P001").getByRole("status")).toContainText("13 件");
    await page.clock.runFor(1000); await expect(row("P001").getByRole("status")).toContainText("16 件");
    await row("P001").getByRole("button", { name: "延迟补三件", exact: true }).click();
    await page.getByPlaceholder("名称或编号").fill("P002"); await page.clock.runFor(2100);
    await page.getByPlaceholder("名称或编号").fill(""); await expect(row("P001").getByRole("status")).toContainText("16 件");
    await edit("P004"); await form.getByLabel("库存", { exact: true }).fill("8");
    await form.getByRole("button", { name: "保存", exact: true }).click();
    await expect(row("P004").getByRole("button", { name: "编辑 P004", exact: true })).toBeFocused();
    await edit("P004"); await form.getByRole("button", { name: "取消", exact: true }).click();
    await expect(row("P004").getByRole("button", { name: "编辑 P004", exact: true })).toBeFocused();
    await edit("P004"); await page.getByPlaceholder("名称或编号").fill("P002");
    await form.getByRole("button", { name: "取消", exact: true }).click();
    await expect(page.getByRole("heading", { level: 1 })).toBeFocused();
    await page.getByPlaceholder("名称或编号").fill("鼠标"); await edit("P002");
    await form.getByLabel("名称", { exact: true }).fill("办公指针");
    await form.getByRole("button", { name: "保存", exact: true }).click();
    await expect(row("P002")).toHaveCount(0); await expect(page.getByRole("heading", { level: 1 })).toBeFocused();
    console.log(`${id} browser: 取消/替换截止点/卸载撤销、保存/取消返焦点、按钮被筛选移除 fallback 通过`);
  }
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  assert.deepEqual(errors, []);
  console.log(`${id} browser: Chromium ${browser.version()}, 360px 无横向溢出、无 pageerror`);
} finally {
  await browser?.close();
  await server.close();
}
