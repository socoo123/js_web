import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import { spawn } from 'node:child_process';
import { chromium, expect } from '@playwright/test';
import { workspace, run } from './lab.mjs';
import * as core from '../src/core/inventory.js';

await run(process.execPath, ['tools/bridge.mjs']);
let bridge;
vm.runInNewContext(await readFile(path.join(workspace, 'adapters/openui5/webapp/model/rules.js'), 'utf8'), { sap: { ui: { define: (_, factory) => { bridge = factory(); } } } });
const data = JSON.parse(await readFile(path.join(workspace, 'data/products.json')));
for (const text of ['', '0', '3', '3.5', '3件', '-1', '99999', '100000']) {
  const outcome = (rules) => { try { return { value: rules.parseStock(text) }; } catch (error) { return { error: error.message }; } };
  assert.deepEqual(outcome(bridge), outcome(core), `共享规则两端：${JSON.stringify(text)}`);
}
assert.equal(JSON.stringify(bridge.summarize(data)), JSON.stringify(core.summarize(data)));
for (const text of ['0', '0.29', '399.00', '', '3元', '-1', '1.001', '90071992547409.91', '90071992547409.92']) {
  const outcome = (rules) => { try { return { value: rules.parsePriceCents(text) }; } catch (error) { return { error: error.message }; } };
  assert.deepEqual(outcome(bridge), outcome(core), `金额桥接：${JSON.stringify(text)}`);
}
for (const changes of [{}, { stock: '' }, { stock: '0' }, { name: ' ' }, { price: '0.29' }]) {
  const draft = { ...core.toDraft(data[3]), ...changes };
  assert.equal(JSON.stringify(bridge.parseDraft(draft)), JSON.stringify(core.parseDraft(draft)), `草稿桥接 ${JSON.stringify(changes)}`);
}
const server = process.env.LAB_UI5_BASE_URL ? null : spawn(process.execPath, [path.join(workspace, 'node_modules/@ui5/cli/bin/ui5.cjs'), 'serve', '--port', '8061'], { cwd: path.join(workspace, 'adapters/openui5'), stdio: ['ignore', 'pipe', 'pipe'] });
const ready = server ? new Promise((resolve, reject) => {
  let output = '';
  const timer = setTimeout(() => reject(new Error('UI5 8061 启动超时：' + output)), 180000);
  const collect = (chunk) => { output += chunk; if (output.includes('Server started')) { clearTimeout(timer); resolve(); } };
  server.stdout.on('data', collect); server.stderr.on('data', collect);
  server.once('exit', (code) => { clearTimeout(timer); reject(new Error(`UI5 退出 ${code}：${output}`)); });
}) : Promise.resolve();
let browser;
try {
  await ready; browser = await chromium.launch();
  const page = await browser.newPage(); const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('response', (response) => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
  await page.goto(process.env.LAB_UI5_BASE_URL ?? 'http://127.0.0.1:8061/index.html');
  await expect(page.getByRole('button', { name: /编辑$/ })).toHaveCount(6, { timeout: 30000 });
  const field = page.getByRole('searchbox');
  await field.fill('P004'); await field.press('Enter');
  await expect(page.getByRole('button', { name: /编辑$/ })).toHaveCount(1);
  const id = await page.evaluate(() => {
    const view = sap.ui.require('sap/ui/core/Component').getComponentById('container-inventory').getRootControl();
    const context = view.byId('products').getItems()[0].getBindingContext('inventory');
    return { path: context.getPath(), id: context.getProperty('id') };
  });
  assert.deepEqual(id, { path: '/products/3', id: 'P004' });
  await page.getByRole('button', { name: /编辑$/ }).click();
  await page.getByRole('textbox', { name: '库存', exact: true }).fill('8');
  await page.getByRole('button', { name: '取消', exact: true }).click();
  await page.getByRole('button', { name: /编辑$/ }).click();
  await expect(page.getByRole('textbox', { name: '库存', exact: true })).toHaveValue('3');
  await page.getByRole('textbox', { name: '库存', exact: true }).fill('');
  await page.getByRole('button', { name: '保存', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('textbox', { name: '库存', exact: true }).fill('8');
  await page.getByRole('button', { name: '保存', exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  const products = await page.evaluate(() => sap.ui.require('sap/ui/core/Component').getComponentById('container-inventory').getModel('inventory').getProperty('/products'));
  assert.equal(products[0].stock, 12, 'P001 不变'); assert.equal(products[3].stock, 8, 'P004 保存 8');
  await expect(page.locator('[id$="--totalStock"]')).toHaveText('8');
  await expect(page.getByRole('row').filter({ hasText: 'P004' }).getByRole('gridcell').nth(1)).toContainText('8');
  await expect(page.locator('[id$="--totalValue"]')).toHaveText('2392.00');
  await page.getByRole('combobox', { name: '界面语言', exact: true }).press('Space');
  await page.getByRole('option', { name: 'English', exact: true }).click();
  await page.waitForURL(/sap-ui-language=en/);
  await expect(page.getByRole('button', { name: /Edit$/ })).toHaveCount(6, { timeout: 30000 });
  assert.equal(products[3].tags.join(','), '热销,新品'); assert.deepEqual(errors, []);
  console.log(`C41 浏览器：${JSON.stringify(id)}；取消保留 3，空白拒绝，保存后 P004=8/P001=12；共享规则向量一致。`);
} finally { if (browser) await browser.close(); server?.kill('SIGTERM'); }
