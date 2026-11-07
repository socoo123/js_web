// 由 scripts/verify-capstone-workspace.mjs 复制进 C48 工作区副本运行：
// 在 Chromium 里对真实 ui5-button 执行题目代码，并测量盒模型题的卡片宽度。
import { mkdirSync, writeFileSync } from "node:fs";
import { createServer } from "vite";
import { chromium } from "@playwright/test";

const code = process.env.CAPSTONE_UI5_CODE;
const css = process.env.CAPSTONE_BOX_CSS;
const port = Number(process.env.CAPSTONE_BROWSER_PORT ?? 5199);
const root = new URL("./.capstone-browser/", import.meta.url).pathname;
mkdirSync(root, { recursive: true });
writeFileSync(`${root}index.html`, `<!doctype html><meta charset="utf-8">
<style>${css}
.card.border-box { box-sizing: border-box; }</style>
<div class="card" id="content-box"></div><div class="card border-box" id="border-box"></div>
<ui5-button id="save">保存库存</ui5-button>
<script type="module">import "@ui5/webcomponents/dist/Button.js"; window.ready = customElements.whenDefined("ui5-button");</script>`);

const server = await createServer({ root, configFile: false, logLevel: "error", server: { port, strictPort: true } });
await server.listen();
const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  const logs = [];
  page.on("console", (message) => { if (!message.text().startsWith("[vite]")) logs.push(message.text()); });
  await page.goto(`http://localhost:${port}/`);
  await page.evaluate(() => window.ready);
  await page.evaluate(code);
  const result = await page.evaluate(async () => {
    const save = document.querySelector("#save");
    await new Promise((resolve) => requestAnimationFrame(() => setTimeout(resolve, 50)));
    return {
      attribute: save.getAttribute("disabled"),
      innerDisabled: save.shadowRoot?.querySelector("button")?.disabled ?? null,
      contentBox: document.getElementById("content-box").getBoundingClientRect().width,
      borderBox: document.getElementById("border-box").getBoundingClientRect().width,
      borderBoxContent: document.getElementById("border-box").clientWidth - 24,
    };
  });
  console.log(JSON.stringify({ chromium: browser.version(), console: logs, ...result }));
} finally {
  await browser.close();
  await server.close();
}
