import { mkdtemp, writeFile, readFile, mkdir, rm, symlink } from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { repo, materialize } from '../labs/snapshots.mjs';
import { snippet, comparison } from '../labs/sources.mjs';
import { pathToFileURL } from 'node:url';
import { createServer } from '../labs/inventory/node_modules/vite/dist/node/index.js';
import { chromium, expect } from '../labs/inventory/node_modules/@playwright/test/index.mjs';

// Instructor-only rehearsal: start from each published starting point and assemble
// only the regions the lesson tells the learner to edit. Never patches a learner.
await mkdir(path.join(repo, '.cache'), { recursive: true });
const parent = await mkdtemp(path.join(repo, '.cache/lab-walkthrough-'));
async function write(root, file, text) { const target = path.join(root, file); await mkdir(path.dirname(target), { recursive: true }); await writeFile(target, text); }
function check(root, id, success = true, failureEvidence) {
  const result = spawnSync(process.execPath, ['tools/check.mjs', id], { cwd: root, encoding: 'utf8', timeout: 300000 });
  if ((result.status === 0) !== success) throw new Error(`${id} ${success ? '应通过' : '错误版应失败'}\n${result.stdout}\n${result.stderr}`);
  if (!success && (result.signal || (failureEvidence && !failureEvidence.test(result.stdout + result.stderr)))) throw new Error(`${id} 错误版没有产生目标业务证据\n${result.stdout}\n${result.stderr}`);
  console.log(`${id} ${success ? '公开片段自动组装通过' : '实际错误文件检查失败（符合预期）'}：${(result.stdout + result.stderr).split('\n').filter((line) => /检查失败|初始库存|C41 浏览器|passed|期望：|实际：|toBe|P004|P001|!==/.test(line)).slice(0, 7).join(' | ')}`);
  return result;
}
async function browserScene(root, id, mode = 'fixed') {
  const { viteConfig } = await import(pathToFileURL(path.join(root, 'tools/lab.mjs')));
  const config = await viteConfig(id); config.server.port = 8062;
  const server = await createServer(config); let browser;
  try {
    await server.listen(); browser = await chromium.launch(); const page = await browser.newPage();
    await page.goto('http://127.0.0.1:8062/');
    if (id === 'C03') {
      await page.getByRole('button', { name: '补货', exact: true }).click();
      await expect(page.locator('#product')).toContainText(mode === 'broken' ? '123 件' : '15 件');
      if (mode === 'fixed') for (const text of ['', '  ', '3件', '-1', '3.5']) {
        await page.locator('#amount').fill(text); await page.getByRole('button', { name: '补货', exact: true }).click();
        await expect(page.locator('#product')).toContainText('15 件'); await expect(page.getByRole('status')).not.toBeEmpty();
      }
    } else {
      await page.getByRole('button', { name: '连续补三件', exact: true }).click();
      await expect(page.getByRole('status')).toContainText(mode === 'queue-broken' ? '13 件' : '15 件');
      await page.reload(); await page.getByRole('button', { name: '延迟补三件', exact: true }).click();
      await page.getByRole('button', { name: '立即补一件', exact: true }).click();
      await expect(page.getByRole('status')).toContainText(mode === 'delay-broken' ? '15 件' : '16 件');
    }
    console.log(`${id} 实际起点浏览器 ${mode}：界面行为符合预期。`);
  } finally { if (browser) await browser.close(); await server.close(); }
}
try {
  const language = path.join(parent, 'C03'); await materialize('C02', language);
  await symlink(path.join(repo, 'labs/inventory/node_modules'), path.join(language, 'node_modules'));
  await browserScene(language, 'C03', 'broken');
  check(language, 'C03', false, /入口 parseStock/);
  let source = await readFile(path.join(language, 'src/core/inventory.js'), 'utf8');
  const faulty = /\/\/ 有问题的写法[^\n]*\nexport function restockProduct\([\s\S]*?\n}\n/;
  if (!faulty.test(source)) throw new Error('C03 起点缺少可定位的原始输入接口');
  source = source.replace(faulty, '') + snippet('c03-parser').code + '\n\n' + snippet('c03-restock').code + '\n';
  await write(language, 'src/core/inventory.js', source); check(language, 'C03'); await browserScene(language, 'C03');
  await write(language, 'src/core/inventory.js', source.replace('stock ?? 12', 'stock || 12')); check(language, 'C03', false, /初始库存 0/);
  await write(language, 'src/core/inventory.js', source); check(language, 'C03');

  const react = path.join(parent, 'C23'); await materialize('C22', react);
  await symlink(path.join(repo, 'labs/inventory/node_modules'), path.join(react, 'node_modules'));
  check(react, 'C23', false, /StockActions.jsx 已创建/);
  const stock = ['c23-setup', null, 'c23-delay', 'c23-controls'].map((id) => id ? snippet(id).code : comparison('c23-state-queue').right.code).join('\n');
  await write(react, 'src/react/StockActions.jsx', stock); await write(react, 'src/react/App.jsx', snippet('c23-app').code); check(react, 'C23');
  await write(react, 'src/react/StockActions.jsx', stock.replaceAll('setStock((previous) => add(previous, 1));', 'setStock(stock + 1);')); check(react, 'C23', false, /15 件/); await browserScene(react, 'C23', 'queue-broken');
  await write(react, 'src/react/StockActions.jsx', stock.replace('setStock((previous) => add(previous, 3));', 'setStock(stock + 3);')); check(react, 'C23', false, /16 件/); await browserScene(react, 'C23', 'delay-broken');
  await write(react, 'src/react/StockActions.jsx', stock); check(react, 'C23'); await browserScene(react, 'C23');

  const ui5 = path.join(parent, 'C41'); await materialize('P40', ui5);
  await symlink(path.join(repo, 'labs/inventory/node_modules'), path.join(ui5, 'node_modules'));
  check(ui5, 'C41', false, /EditDialog.fragment.xml 已创建/);
  const prefix = 'adapters/openui5/webapp/';
  await write(ui5, prefix + 'view/Inventory.view.xml', `<mvc:View controllerName="course.inventory.controller.Inventory" xmlns:mvc="sap.ui.core.mvc" xmlns:core="sap.ui.core" xmlns="sap.m" displayBlock="true" height="100%">\n<Page title="{i18n>appTitle}"><content><VBox class="sapUiSmallMargin">\n${snippet('c41-toolbar').code}\n${snippet('c41-table').code}\n</VBox></content></Page></mvc:View>\n`);
  const controller = ['c41-header', 'c41-filter', 'c41-summary', 'c41-edit', null, 'c41-tail'].map((id) => id ? snippet(id).code : comparison('c41-model-notification').right.code).join('\n');
  await write(ui5, prefix + 'controller/Inventory.controller.js', controller);
  await write(ui5, prefix + 'view/EditDialog.fragment.xml', snippet('c41-dialog').code); check(ui5, 'C41');
  await write(ui5, prefix + 'controller/Inventory.controller.js', controller.replace('this._editPath = context.getPath()', 'this._editPath = "/products/0"')); check(ui5, 'C41', false, /P001 不变/);
  await write(ui5, prefix + 'controller/Inventory.controller.js', controller); check(ui5, 'C41');
  console.log('C03/C23/C41：起点→公开片段自动组装→实际错误失败→修复后通过。C23 已接正式 C22；C41 仍为试做。此检查不替代主 agent 的独立读者验收。');
} finally { await rm(parent, { recursive: true, force: true }); }
