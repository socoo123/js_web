import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rm, symlink, rename } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';
import { materialize, repo, hash } from '../labs/snapshots.mjs';
import { comparison, snippet } from '../labs/sources.mjs';
import { createServer } from '../labs/inventory/node_modules/vite/dist/node/index.js';
import { chromium, expect } from '../labs/inventory/node_modules/@playwright/test/index.mjs';

await mkdir(path.join(repo, '.cache'), { recursive: true });
const work = await mkdtemp(path.join(repo, '.cache/l1-follow-'));
let source, server, browser;
const trace = [];
async function put(file, text) {
  const target = path.join(work, file); await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target + '.follow-tmp', text); await rename(target + '.follow-tmp', target);
}
async function core(text) { source = text; await put('src/core/inventory.js', source); }
async function append(...parts) { await core(source + '\n' + parts.join('\n\n') + '\n'); }
function check(id, expected = true, evidence) {
  const result = spawnSync(process.execPath, ['tools/check.mjs', id], { cwd: work, encoding: 'utf8', timeout: 30000 });
  const output = result.stdout + result.stderr;
  assert.equal(result.status === 0, expected, output);
  if (!expected && evidence) assert.match(output, evidence);
  trace.push(`${id} ${expected ? '完成态通过' : '实际错误版失败'} ${expected ? '' : output.split('\n').filter((line) => /输入：|期望：|实际：/.test(line)).join(' ')}`);
}
try {
  await materialize('C00', work); await symlink(path.join(repo, 'labs/inventory/node_modules'), path.join(work, 'node_modules'));
  await put('notes/my-work.txt', '学员自己的记录');
  source = await readFile(path.join(work, 'src/core/inventory.js'), 'utf8');
  const dataHash = hash(await readFile(path.join(work, 'data/products.json')));
  const { viteConfig } = await import(pathToFileURL(path.join(work, 'tools/lab.mjs')));
  const config = await viteConfig('C01'); config.server.port = 8063;
  // The rehearsal explicitly reloads after each deliberate fault; prevent HMR
  // from racing those navigations. Learner dev servers keep normal HMR.
  config.server.hmr = false;
  server = await createServer(config); await server.listen(); browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 360, height: 900 } });
  async function reload() { server.moduleGraph.invalidateAll(); await page.goto('http://127.0.0.1:8063/', { waitUntil: 'networkidle' }); }
  check('C01', false, /stockValue/);
  await append(comparison('c01-host-value').right.code);
  await put('notes/runtime.md', 'JavaScript 是语言；浏览器与 Node/Bun 是宿主；npm 是包管理与脚本入口。\n'); check('C01');
  await reload(); assert.equal(await page.evaluate(() => window.inventory.stockValue(window.products[0])), 478800);
  let good = source; await core(good.replace('return product.stock * product.priceCents;', 'console.log(document.title);\n  return product.stock * product.priceCents;'));
  check('C01', false, /document is not defined/); await core(good); check('C01');

  await put('src/vanilla/index.html', snippet('c02-html').code);
  await put('src/vanilla/styles.css', snippet('c02-css').code);
  await put('src/vanilla/app.js', [snippet('c02-setup').code, comparison('c02-output-dom').right.code, snippet('c02-events').code].join('\n'));
  check('C02'); await reload();
  await expect(page.locator('#value')).toHaveText('库存价值 478800 分');
  await page.getByText('补货数量', { exact: true }).click(); await expect(page.locator('#amount')).toBeFocused();
  assert.equal(await page.locator('#amount').evaluate((element) => getComputedStyle(element).boxSizing), 'border-box');
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  const html = await readFile(path.join(work, 'src/vanilla/index.html'), 'utf8');
  await put('src/vanilla/index.html', html.replace('./app.js', './ap.js'));
  const failedScript = page.waitForResponse((response) => response.url().endsWith('/ap.js'));
  await reload(); assert.equal((await failedScript).status(), 404); check('C02', false, /module/);
  trace.push('C02 Network：ap.js 实际返回 404；卡片静态 P001/12 仍存在。');
  await put('src/vanilla/index.html', html); await reload();
  await page.getByRole('button', { name: '补货', exact: true }).click(); await expect(page.locator('#product')).toContainText('123 件');

  check('C03', false, /parseStock/);
  const faulty = /\/\/ 有问题的写法[^\n]*\nexport function restockProduct\([\s\S]*?\n}\n/;
  assert(faulty.test(source));
  await core(source.replace(faulty, '') + snippet('c03-parser').code + '\n' + snippet('c03-restock').code + '\n');
  check('C03'); await reload(); await page.getByRole('button', { name: '补货', exact: true }).click(); await expect(page.locator('#product')).toContainText('15 件');
  for (const text of ['', '  ', '3件', '-1', '3.5']) { await page.locator('#amount').fill(text); await page.getByRole('button', { name: '补货', exact: true }).click(); await expect(page.locator('#product')).toContainText('15 件'); }
  good = source; await core(good.replace('stock ?? 12', 'stock || 12')); check('C03', false, /初始库存 0/); await core(good); check('C03');

  const additions = {
    C04: [comparison('c04-block-total').right.code],
    C05: [comparison('c05-draft-copy').right.code, ...['validate-product', 'validate-list', 'import-products'].map((key) => snippet(`c05-${key}`).code)],
    C06: [comparison('c06-filter-closure').right.code, snippet('c06-counter').code, snippet('c06-selectors').code],
    C07: [snippet('c07-inventory-class').code, comparison('c07-bound-method').right.code],
    C08: [comparison('c08-sort-stream').right.code, ...['summary', 'select-products', 'update-stock'].map((key) => snippet(`c08-${key}`).code)],
    C09: [comparison('c09-id-map').right.code, snippet('c09-groups-tags').code],
    C10: [...['history-start', 'history-end', 'queue', 'category-tree', 'dfs'].map((key) => snippet(`c10-${key}`).code), comparison('c10-queue-tree').right.code],
  };
  const faults = {
    C04: [(text) => text.replace('for (const product of products) {', 'for (let i = 0; i <= products.length; i++) {\n    const product = products[i];'), /六商品总库存/],
    C05: [(text) => text.replace('return { ...product, tags: [...product.tags] };', 'return { ...product };'), /取消草稿不得污染/],
    C06: [(text) => text.replace('for (const product of products) {\n    selectors.push', 'for (var product of products) {\n    selectors.push'), /迭代捕获各自商品/],
    C07: [(text) => text.replace('inventory.getById.bind(inventory)', 'inventory.getById'), /回调查询保持接收者/],
    C08: [(text) => text.replace('.sort((left, right) => left.stock - right.stock)', '.sort()'), /数值库存升序/],
    C09: [(text) => text.replace('byId.set(product.id, product);', 'byId[product.id] = product;'), /ID Map 查询 P004/],
    C10: [(text) => text.replace('history.push({ id, stock: product.stock });', 'history.push(product);'), /撤销最后两件/],
  };
  for (const [id, parts] of Object.entries(additions)) {
    check(id, false); await append(...parts); check(id); good = source;
    const [fault, expected] = faults[id]; const broken = fault(good); assert.notEqual(broken, good, id + ' 故障未命中实际文件');
    await core(broken); check(id, false, expected);
    if (id === 'C05') {
      await reload(); const evidence = await page.evaluate(() => { const product = window.products[0]; const draft = window.inventory.createDraft(product); const same = draft.tags === product.tags; draft.tags.push('仅草稿'); return { same, tags: product.tags }; });
      assert.deepEqual(evidence, { same: true, tags: ['热销', '仅草稿'] }); trace.push('C05 Console：外层不同，tags 身份相同，原标签被追加。');
    }
    if (id === 'C09') {
      await reload(); const evidence = await page.evaluate(() => { const map = window.inventory.indexProducts(window.products); return { own: Object.hasOwn(map, 'P004'), has: map.has('P004'), size: map.size }; });
      assert.deepEqual(evidence, { own: true, has: false, size: 0 }); trace.push('C09 Console：Object.hasOwn=true、Map.has=false、size=0。');
    }
    if (id === 'C10') {
      await reload(); const stock = await page.evaluate(() => { const journal = window.inventory.createHistory(window.products); journal.restock('P001', '3'); journal.undo(); return journal.getProducts()[0].stock; });
      assert.equal(stock, 15); trace.push('C10 单次补货后撤销：错误引用仍为 15。');
    }
    await core(good); check(id);
    const beforeStart = hash(await readFile(path.join(work, 'src/core/inventory.js')));
    const start = spawnSync(process.execPath, ['tools/lab.mjs', 'start', id], { cwd: work, encoding: 'utf8' }); assert.equal(start.status, 0, start.stderr);
    assert.equal(hash(await readFile(path.join(work, 'src/core/inventory.js'))), beforeStart);
  }
  const repl = spawnSync(process.execPath, ['tools/lab.mjs', 'console'], { cwd: work, input: 'inventory.summarize(products).stock\n.exit\n', encoding: 'utf8', timeout: 10000 });
  assert.equal(repl.status, 0, repl.stderr); assert.match(repl.stdout, /库存> 52/);
  assert.equal(hash(await readFile(path.join(work, 'data/products.json'))), dataHash);
  assert.equal(await readFile(path.join(work, 'notes/my-work.txt'), 'utf8'), '学员自己的记录');
  await browser.close(); browser = null; await server.close(); server = null;
  const { followL2 } = await import('./verify-l2-walkthrough.mjs');
  await followL2(work);
  console.log(trace.join('\n'));
  console.log('L1 连续跟做通过：只拿 C00，同一个目录按正文增量到 C10；逐章实际错误先红后绿，Node 控制台、404、原始数据及自有记录保护通过。');
} finally { if (browser) await browser.close(); if (server) await server.close(); await rm(work, { recursive: true, force: true }); }
