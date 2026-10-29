import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from '@playwright/test';
import { workspace, run } from './lab.mjs';
import { checkBridge } from './openui5-support.mjs';
import { checkInventory } from './ui5-check.mjs';
import { checkRouting, checkOData } from './openui5-routing-check.mjs';

// No history fallback: a missing file must stay 404, never index.html with 200.
const base = process.env.LAB_UI5_STATIC_BASE ?? '/js_web/demos/inventory-openui5/';
assert.ok(base.startsWith('/') && base.endsWith('/') && !base.includes('..'));
const output = path.join(workspace, 'adapters/openui5/dist');
const lesson = process.argv[2] ?? 'C42';
process.env.UI5_DATA_DIR ??= path.join(workspace, '.lab/ui5-cache');
await checkBridge();
await run(process.execPath, [path.join(workspace, 'node_modules/@ui5/cli/bin/ui5.cjs'),
  'build', '--all', '--clean-dest', '--include-task', 'generateVersionInfo'], path.join(workspace, 'adapters/openui5'));
const types = { '.html': 'text/html', '.js': 'application/javascript', '.json': 'application/json', '.css': 'text/css', '.xml': 'application/xml', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
const server = createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    if (!pathname.startsWith(base)) throw new Error('outside base');
    const file = path.resolve(output, pathname.slice(base.length) || 'index.html');
    if (!file.startsWith(output + path.sep) || !(await stat(file)).isFile()) throw new Error('not a file');
    response.writeHead(200, { 'content-type': types[path.extname(file)] ?? 'application/octet-stream' });
    response.end(await readFile(file));
  } catch { response.writeHead(404, { 'content-type': 'text/plain' }); response.end('Not found'); }
});
await new Promise((resolve) => server.listen(Number(process.env.LAB_UI5_STATIC_PORT ?? 18122), '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
const url = `${origin}${base}index.html`;
let browser;
try {
  const resources = ['index.html', 'Component-preload.js', 'resources/sap-ui-core.js', 'resources/sap-ui-version.json',
    'resources/sap/m/themes/sap_horizon/library.css', 'resources/sap/ui/core/themes/sap_horizon/library.css',
    'i18n/i18n.properties', 'i18n/i18n_en.properties'];
  if (lesson === 'C42') resources.push('localService/metadata.xml', 'localService/mockdata/Products.json', 'probe/odata.html');
  for (const file of resources) {
    const response = await fetch(new URL(file, url));
    assert.equal(response.status, 200, `${base}${file}`);
  }
  assert.equal((await fetch(`${origin}/resources/sap-ui-core.js`)).status, 404, '域名根不伪装资源');
  assert.equal((await fetch(`${origin}${base}products/P004`)).status, 404, '无 SPA fallback');
  browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage(); const errors = []; const assets = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('response', (response) => {
    if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`);
    if (/\.(?:woff2?|css|properties)(?:\?|$)/.test(response.url())) assets.push(response.url());
  });
  // A built adapter must be self-contained: accidental CDN use cannot pass on a warm cache.
  await context.route('**/*', (route) => new URL(route.request().url()).origin === origin ? route.continue() : route.abort());
  await checkInventory(page, url, { lesson });
  if (lesson === 'C42') { await checkRouting(page, url); await checkOData(page, url); }
  assert.ok(assets.some((url) => /\.woff2?(?:\?|$)/.test(url)), '实际字体请求');
  if (lesson !== 'C40') {
    const preload = await readFile(path.join(output, 'Component-preload.js'), 'utf8');
    assert.ok(assets.some((url) => url.includes('i18n_en.properties')) || preload.includes('course/inventory/i18n/i18n_en.properties'),
      '英文资源由独立请求或已加载的 Component-preload 提供');
  }
  assert.deepEqual(errors, [], '静态浏览器真实资源请求');
  console.log(`严格静态 ${lesson} ${base}：无 fallback；同源主题/字体/i18n；${lesson === 'C42' ? '共同向量、详情、metadata/JSON与有限V2' : '本课库存行为'}通过。`);
} finally {
  await browser?.close();
  await new Promise((resolve) => server.close(resolve));
}
