import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir, rename } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { comparison, snippet } from '../labs/sources.mjs';
import ts from 'typescript';

export async function followL2(work) {
  const trace = [];
  const get = (file) => readFile(path.join(work, file), 'utf8');
  async function put(file, text) {
    const target = path.join(work, file); await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target + '.follow-tmp', text); await rename(target + '.follow-tmp', target);
  }
  function run(args, cwd = work, expected = true, pattern) {
    const r = spawnSync(process.execPath, args, { cwd, encoding: 'utf8', timeout: 120000 });
    const output = r.stdout + r.stderr;
    assert.equal(r.status === 0, expected, output);
    if (pattern) assert.match(output, pattern);
    return output;
  }
  function check(id, expected = true, pattern) {
    const output = run(['tools/check.mjs', id], work, expected, pattern);
    trace.push(`${id} ${expected ? '实际工作文件完成态通过' : '修改实际文件后失败'} ${expected ? '' : output.slice(-300)}`);
  }
  async function fault(id, file, change, pattern) {
    const good = await get(file); const broken = change(good);
    assert.notEqual(broken, good, `${id} 故障没有命中实际文件`);
    await put(file, broken); check(id, false, pattern); await put(file, good); check(id);
  }
  let app = ['setup', 'render', 'select'].map((key) => snippet(`c11-${key}`).code).join('\n\n') + '\n\n' + comparison('c11-identity-event').right.code + '\n\n' + snippet('c11-finish').code;
  let html = snippet('c11-html').code;
  await put('src/vanilla/app.js', app); await put('src/vanilla/index.html', html); check('C11');
  await fault('C11', 'src/vanilla/app.js', (text) => {
    const listener = text.match(/\$\("#list"\)\.addEventListener\("click",[\s\S]*?\n}\);/)[0];
    return text.replace(listener, '').replace('$("#list").replaceChildren(...cards);', '$("#list").replaceChildren(...cards);\n' + listener).replace('if (!button || !$("#list").contains(button)) return;', 'if (!button) return;');
  }, /库存 (?:9|11|12|13|14|15|17|20)|Expected|Received/);
  const reload12 = snippet('c12-reload').code;
  app = app.replace('import seed from "../../data/products.json";', 'import { loadProducts } from "../services/load-products.js";').replace('let products = structuredClone(seed);', 'let products = [];').replace(/\nrender\(\);\s*$/, '\nreloadProducts();');
  app = app.replace('function restoreFocus()', reload12 + '\n\nfunction restoreFocus()');
  html = html.replace('  <p id="summary"', '  <button type="button" id="reload">重新加载</button><button type="button" id="fail">模拟失败</button>\n  <p id="summary"');
  await put('src/vanilla/app.js', app); await put('src/vanilla/index.html', html); await put('src/services/load-products.js', comparison('c12-future-chain').right.code); check('C12');
  await fault('C12', 'src/services/load-products.js', (text) => text.replace('return new Promise(', 'new Promise('), /Promise 加载真实结果/);
  const reload13 = snippet('c13-reload').code;
  app = app.replace(reload12, reload13).replace('$("#filters").addEventListener("input", render);', '$("#filters").addEventListener("input", () => { render(); reloadProducts(); });');
  await put('src/services/load-products.js', comparison('c13-http-status').right.code); await put('src/vanilla/app.js', app); check('C13');
  await fault('C13', 'src/services/load-products.js', (text) => text.replace('  if (!response.ok) throw new Error(`HTTP ${response.status}`);\n', ''), /先检查 HTTP 状态/);
  const storage = ['snapshot','save','recover'].map((key) => snippet(`c14-${key}`).code).join('\n\n');
  await put('src/services/storage.js', storage);
  app = 'import { saveProducts, readProducts, recoverProducts, decodeSnapshot, encodeSnapshot } from "../services/storage.js";\n' + app;
  app = app.replace('  products = next;', '  saveProducts(localStorage, next);\n  products = next;').replace('$("#filters").addEventListener("input", () => { render(); reloadProducts(); });','$("#filters").addEventListener("input", render);');
  app = app.replace('function restoreFocus()', ['transfer','boot'].map((key) => snippet(`c14-${key}`).code).join('\n\n') + '\n\nfunction restoreFocus()').replace(/\nreloadProducts\(\);\s*$/, '\nboot();');
  html = html.replace('  <p id="summary"', '  <button type="button" id="export">导出快照</button><label>导入快照 <input type="file" id="import" accept="application/json"></label>\n  <button type="button" id="recover" hidden>恢复备份</button>\n  <p id="summary"');
  await put('src/vanilla/app.js', app); await put('src/vanilla/index.html', html); check('C14');
  await fault('C14', 'src/services/storage.js', (text) => text.replace('  const text = encodeSnapshot(products);','  storage.setItem(storageKey, JSON.stringify({ version: 1, products }));\n  const text = encodeSnapshot(products);'), /有效原文保留/);
  await put('src/vanilla/styles.css', snippet('c15-css').code); check('C15');
  await fault('C15','src/vanilla/styles.css',(text)=>text+'\narticle { min-width: 600px; }\n', /false == true|AssertionError/);
  // Move the learner's functions, following the chapter's table; do not load C16 answers.
  const source = await get('src/core/inventory.js');
  const ast = ts.createSourceFile('inventory.js', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
  const declarations = new Map();
  for (const statement of ast.statements) {
    const name = statement.name?.text ?? statement.declarationList?.declarations[0]?.name?.text;
    if (name) declarations.set(name, statement.getText(ast));
  }
  const moves = {
    validation: ['', ['categories','parseStock','validateProduct','validateProducts','createDraft','importProducts']],
    stock: ['import { parseStock } from "./validation.js";', ['initialStock','restockProduct','updateStock']],
    summary: ['import { validateProducts } from "./validation.js";', ['stockValue','totalStock','summarize']],
    filters: ['', ['createCategoryFilter','createCounter','createProductSelectors','selectProducts']],
    collections: ['import { validateProducts, createDraft } from "./validation.js";', ['Inventory','queryWithCallback','sortByStock','indexProducts','groupByCategory','uniqueTags']],
    history: ['import { createDraft } from "./validation.js";\nimport { restockProduct } from "./stock.js";', ['createHistory','createTaskQueue']],
    tree: ['import { groupByCategory } from "./collections.js";', ['buildCategoryTree','walkDepthFirst','walkBreadthFirst']],
  };
  for (const [file,[imports,names]] of Object.entries(moves)) {
    const functions = names.map((name) => { assert(declarations.has(name), name); return declarations.get(name); });
    await put(`src/core/${file}.js`, imports+'\n'+functions.join('\n\n')+'\n');
  }
  await put('src/core/inventory.js', comparison('c16-module-export').right.code); check('C16');
  await fault('C16','src/core/stock.js',(text)=>text.replace('import { parseStock }','import parseStock'),/does not provide an export named 'default'/);
  await put('src/cli/report.js', comparison('c17-file-base').right.code); check('C17');
  await fault('C17','src/cli/report.js',(text)=>text.replace('new URL("../../data/products.json", import.meta.url)','"data/products.json"'),/不同 cwd 的当前报表/);
  const pkg = JSON.parse(await get('package.json'));
  Object.assign(pkg.scripts, JSON.parse(comparison('c18-script-command').right.code).scripts);
  await put('package.json', JSON.stringify(pkg,null,2)+'\n'); check('C18');
  await put('notes/tooling.md', '实际报告 npm/pnpm 同为 6/52/2634800；package-lock 与 pnpm-lock，仅隔离目录；Node 未变。\n'); check('C19');
  await put('src/core/validation.js', await get('src/core/validation.js')+'\n'+snippet('c20-price').code+'\n'+snippet('c20-form-draft').code+'\n');
  await put('tests/core/inventory.test.js', snippet('c20-test-imports').code+'\n'+comparison('c20-boundary-assert').right.code+'\n'+snippet('c20-price-tests').code+'\n');
  await put('vite.config.js', snippet('c20-config').code);
  pkg.scripts.test='vitest run --config vite.config.js'; await put('package.json', JSON.stringify(pkg,null,2)+'\n'); check('C20');
  const good = await get('src/core/validation.js');
  await put('src/core/validation.js', good.replace(/  if \(typeof text !== "string" \|\| text.trim\(\) === ""\) \{[\s\S]*?\n  }\n/,''));
  run(['node_modules/vitest/vitest.mjs','run','--config','vite.config.js'],work,false,/to throw an error|did not throw/);
  await put('src/core/validation.js',good); run(['node_modules/vitest/vitest.mjs','run','--config','vite.config.js']);
  run(['tools/lab.mjs','start','C20']); run(['tools/lab.mjs','build']);
  assert.equal(await get('notes/my-work.txt'),'学员自己的记录');
  console.log(trace.join('\n'));
  console.log('L2 连续跟做通过：接续同一个 C00→C10 工作副本，仅按正文片段、改动和搬移清单推进至 C20；当前源码错误先红后绿、自有记录保留。');
}
