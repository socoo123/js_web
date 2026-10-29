// 作者门禁：仅在 C00 快照中运行，确保预置外壳不会启动未来课程或夹带核心答案。
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium, expect } from '@playwright/test';
import { createServer } from 'vite';
import { workspace, entryFor, viteConfig } from './lab.mjs';

const read = (file) => readFile(path.join(workspace, file), 'utf8');
assert.equal(JSON.parse(await read('checkpoint.json')).checkpoint, 'C00', '此门禁只接受 C00，不检查已经完成的课程');
for (const name of ['index.html', 'main.jsx', 'styles.css', 'cycle-dialog-focus.js', 'App.jsx', 'ProductTable.jsx', 'ProductEditor.jsx', 'select-product.js']) {
  assert((await read(`adapters/antd/${name}`)).trim(), `C00 外壳缺少 ${name}`);
}
assert.equal(entryFor('C01'), 'src/vanilla');
const core = await read('src/core/inventory.js');
assert(!core.includes('parseStock'), 'C00 不能包含未来核心校验答案');
const { selectProduct } = await import(pathToFileURL(path.join(workspace, 'adapters/antd/select-product.js')));
assert.throws(() => selectProduct([], { id: 'P002', index: 0 }), /请先完成 C37/);
for (const name of ['ProductTable', 'ProductEditor']) {
  const text = await read(`adapters/antd/${name}.jsx`);
  assert(text.includes('C38：在这里连接'), `${name} 必须为占位`);
  assert(!/<(?:Table|Form|Modal)\b/.test(text), `${name} 不能预装待教答案`);
}
const app = await read('adapters/antd/App.jsx');
assert(app.includes('请完成 C38 的 openEditor') && app.includes('请完成 C38 的 save'));
assert(!app.includes('await saveMutation.mutateAsync(product)') && !app.includes('structuredClone(product)'));

const config = await viteConfig('C01'); config.server.port = 0; config.server.hmr = false;
const server = await createServer(config); let browser;
try {
  await server.listen(); browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 360, height: 900 } });
  const requests = []; const errors = [];
  page.on('request', (request) => requests.push(request.url()));
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('response', (response) => { if (response.status() >= 400) errors.push(`HTTP ${response.status()}`); });
  await page.goto(`http://127.0.0.1:${server.httpServer.address().port}/`);
  await expect(page.getByRole('heading', { name: '库存工作台', exact: true })).toBeVisible();
  await expect(page.locator('#product')).toHaveText('P001 机械键盘 · 库存 12 件');
  await expect(page.locator('article')).toHaveCount(1);
  await expect(page.getByRole('button', { name: '补货（从 C03 接通）', exact: true })).toBeDisabled();
  assert.equal(await page.evaluate(() => typeof window.inventory.parseStock), 'undefined');
  assert(!requests.some((url) => /\/adapters\/|\/deps\/(?:react|antd|@tanstack)/.test(url)), '默认页不应加载未来 adapter/React');
  assert.deepEqual(errors, []);
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  console.log('C00：单商品默认页、未接通按钮、未加载未来 adapter、8文件外壳与核心留空检查通过。');
} finally { await browser?.close(); await server.close(); }
