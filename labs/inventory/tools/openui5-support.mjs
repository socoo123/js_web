import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import { spawn } from 'node:child_process';
import { chromium } from '@playwright/test';
import { workspace, run } from './lab.mjs';
import * as core from '../src/core/inventory.js';

export const products = JSON.parse(await readFile(path.join(workspace, 'data/products.json')));
export async function checkBridge() {
  await run(process.execPath, ['tools/bridge.mjs']);
  let bridge;
  vm.runInNewContext(await readFile(path.join(workspace, 'adapters/openui5/webapp/model/rules.js'), 'utf8'), {
    sap: { ui: { define: (_, factory) => { bridge = factory(); } } },
  });
  const outcome = (rules, name, input) => {
    try { return JSON.stringify({ value: rules[name](input) }); }
    catch (error) { return JSON.stringify({ error: error.message }); }
  };
  for (const input of ['', ' ', '0', '3', '3.5', '3件', '-1', '99999', '100000']) {
    assert.equal(outcome(bridge, 'parseStock', input), outcome(core, 'parseStock', input), `库存桥接 ${JSON.stringify(input)}`);
  }
  for (const input of ['0', '0.29', '399.00', '', '3元', '-1', '1.001', '90071992547409.91', '90071992547409.92']) {
    assert.equal(outcome(bridge, 'parsePriceCents', input), outcome(core, 'parsePriceCents', input), `价格桥接 ${input}`);
  }
  for (const changes of [{}, { stock: '' }, { stock: '0' }, { name: ' ' }, { price: '0.29' }]) {
    const draft = { ...core.toDraft(products[3]), ...changes };
    assert.equal(outcome(bridge, 'parseDraft', draft), outcome(core, 'parseDraft', draft));
  }
  assert.equal(JSON.stringify(bridge.summarize(products)), JSON.stringify(core.summarize(products)));
}

export async function withUI5(check) {
  await checkBridge();
  const port = process.env.LAB_UI5_PORT ?? '18120';
  process.env.UI5_DATA_DIR ??= path.join(workspace, '.lab/ui5-cache');
  const server = process.env.LAB_UI5_BASE_URL ? null : spawn(process.execPath,
    [path.join(workspace, 'node_modules/@ui5/cli/bin/ui5.cjs'), 'serve', '--port', port],
    { cwd: path.join(workspace, 'adapters/openui5'), stdio: ['ignore', 'pipe', 'pipe'], env: process.env });
  let browser;
  try {
    if (server) await new Promise((resolve, reject) => {
      let output = '';
      const timer = setTimeout(() => reject(new Error(`UI5 ${port} 启动超时：${output}`)), 240000);
      const collect = (chunk) => {
        output += chunk;
        if (output.includes('Server started')) { clearTimeout(timer); resolve(); }
      };
      server.stdout.on('data', collect); server.stderr.on('data', collect);
      server.once('error', (error) => { clearTimeout(timer); reject(error); });
      server.once('exit', (code) => { clearTimeout(timer); reject(new Error(`UI5 退出 ${code}：${output}`)); });
    });
    browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('response', (response) => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
    const url = process.env.LAB_UI5_BASE_URL ?? `http://127.0.0.1:${port}/index.html`;
    await check({ page, context, url, errors });
    assert.deepEqual(errors, [], '页面异常与实际 HTTP 失败');
  } finally {
    await browser?.close();
    if (server && server.exitCode === null) {
      await new Promise((resolve) => { server.once('exit', resolve); server.kill('SIGTERM'); });
    }
  }
}

export async function inventoryData(page) {
  return page.evaluate(() => sap.ui.require('sap/ui/core/Component')
    .getComponentById('container-inventory').getModel('inventory').getProperty('/products'));
}
