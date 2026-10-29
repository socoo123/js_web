import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import { workspace, run } from './lab.mjs';

const id = process.argv[2];
const n = Number(id?.slice(1));
const data = JSON.parse(await readFile(path.join(workspace, 'data/products.json')));
const core = await import(pathToFileURL(path.join(workspace, 'src/core/inventory.js')));
let count = 0;
function equal(input, actual, expected) {
  try { assert.deepEqual(actual, expected); count++; }
  catch { throw new Error(`${id} 检查失败\n输入：${JSON.stringify(input)}\n期望：${JSON.stringify(expected)}\n实际：${JSON.stringify(actual)}`); }
}
function rejects(input, callback) {
  let error; try { callback(); } catch (caught) { error = caught; }
  equal(input, Boolean(error?.message), true);
}
function result(input, callback, expected) {
  let actual; try { actual = callback(); } catch (error) { actual = { error: error?.name ?? 'ThrownValue', message: error?.message ?? String(error), location: error?.stack?.split('\n')[1]?.trim() }; }
  equal(input, actual, expected);
}
try {
  equal('固定数据 P001', data[0], { id: 'P001', name: '机械键盘', category: '外设', stock: 12, priceCents: 39900, tags: ['热销'] });
  if (n >= 1) {
    equal('入口 stockValue', typeof core.stockValue, 'function');
    result('P001 价值（分）', () => core.stockValue(data[0]), 478800);
    if (n === 1) equal('notes/runtime.md 已记录运行职责', existsSync(path.join(workspace, 'notes/runtime.md')), true);
  }
  if (n >= 2 && n <= 10) {
    const html = await readFile(path.join(workspace, 'src/vanilla/index.html'), 'utf8');
    equal('C02 label / input / module', ['for="amount"', 'id="amount"', 'type="module"', './app.js'].every((text) => html.includes(text)), true);
  }
  if (n >= 3) {
    equal('入口 parseStock', typeof core.parseStock, 'function');
    for (const [text, value] of [['3', 3], [' 3 ', 3], ['0', 0], ['99999', 99999]]) equal({ parseStock: text }, core.parseStock(text), value);
    for (const text of ['', '  ', '3件', '-1', '3.5', 'Infinity', '100000']) rejects({ parseStock: text, expected: '明确错误' }, () => core.parseStock(text));
    equal('初始库存 0', core.initialStock(0), 0);
    equal('初始库存 undefined', core.initialStock(undefined), 12);
    const before = structuredClone(data[0]);
    equal('P001 12 + 输入 3', core.restockProduct(before, '3').stock, 15);
    equal('补货不改原对象', before, data[0]);
    rejects('补货后超过 99999', () => core.restockProduct({ ...data[0], stock: 99999 }, '1'));
  }
  if (n >= 4) {
    result('六商品总库存', () => core.totalStock(data), 52);
    result('空集合总库存', () => core.totalStock([]), 0);
  }
  if (n >= 5) {
    const before = structuredClone(data[0]);
    const draft = core.createDraft(before); draft.tags.push('仅草稿');
    equal('取消草稿不得污染原 tags', before, data[0]);
    result('JSON 导入固定数据', () => core.importProducts(JSON.stringify(data)), data);
    result('JSON 空数组', () => core.importProducts('[]'), []);
    const cleaned = core.importProducts(JSON.stringify([{ ...data[0], name: ' 机械键盘 ', debug: true }]))[0];
    equal('清洗名称并只保留约定字段', [cleaned.name, Object.hasOwn(cleaned, 'debug')], ['机械键盘', false]);
    for (const text of ['{', 'null', '{}', JSON.stringify([{ ...data[0], stock: '3' }]), JSON.stringify([data[0], data[0]])]) rejects({ importProducts: text }, () => core.importProducts(text));
  }
  if (n >= 6) {
    result('外设筛选工厂', () => data.filter(core.createCategoryFilter('外设')).map((product) => product.id), ['P001', 'P002']);
    result('音频筛选工厂', () => data.filter(core.createCategoryFilter('音频')).map((product) => product.id), ['P006']);
    const first = core.createCounter(); const second = core.createCounter();
    equal('两个闭包计数器独立', [first(), first(), second()], [1, 2, 1]);
    result('迭代捕获各自商品', () => core.createProductSelectors(data).map((select) => select()), data.map((product) => product.id));
  }
  if (n >= 7) {
    const inventory = new core.Inventory(data);
    result('直接查询 P004', () => inventory.getById('P004').stock, 3);
    result('回调查询保持接收者', () => core.queryWithCallback(inventory, 'P004').stock, 3);
    equal('方法位于原型', Object.hasOwn(inventory, 'getById'), false);
    equal('实例字段位于实例', Object.hasOwn(inventory, 'products'), true);
    const copy = inventory.toProducts(); copy[0].tags.push('仅副本'); equal('普通数据导出不污染实例', inventory.toProducts(), data);
  }
  if (n >= 8) {
    result('统计固定输入', () => core.summarize(data), { count: 6, stock: 52, valueCents: 2634800, soldOut: 1, lowStock: 2 });
    result('统计空输入', () => core.summarize([]), { count: 0, stock: 0, valueCents: 0, soldOut: 0, lowStock: 0 });
    const before = structuredClone(data);
    result('数值库存升序', () => core.sortByStock(before).map((product) => product.id), ['P002', 'P004', 'P006', 'P003', 'P001', 'P005']);
    equal('排序不修改源数组', before, data);
    result('筛选 P004', () => core.selectProducts(data, { query: 'P004' }).map((product) => product.id), ['P004']);
    const next = core.updateStock(before, 'P004', 8);
    equal('不可变更新目标', [next[3].stock, before[3].stock, next !== before, next[3] !== before[3]], [8, 3, true, true]);
  }
  if (n >= 9) {
    result('ID Map 查询 P004', () => core.indexProducts(data).get('P004').stock, 3);
    result('ID Map size', () => core.indexProducts(data).size, 6);
    rejects('索引拒绝重复 ID', () => core.indexProducts([data[0], data[0]]));
    result('分类数量', () => Object.fromEntries([...core.groupByCategory(data)].map(([key, items]) => [key, items.length])), { 外设: 2, 显示器: 1, 配件: 2, 音频: 1 });
    result('标签去重', () => core.uniqueTags(data), ['热销', '新品']);
  }
  if (n >= 10) {
    const history = core.createHistory(data);
    history.restock('P001', '3'); equal('补货三件', history.getProducts()[0].stock, 15);
    history.restock('P001', '2'); history.undo(); equal('撤销最后两件', history.getProducts()[0].stock, 15);
    history.undo(); equal('撤销前三件', history.getProducts()[0].stock, 12); equal('空历史', history.undo(), false);
    equal('初始数据未被历史污染', data[0].stock, 12);
    const queue = core.createTaskQueue(); queue.enqueue('P001'); queue.enqueue('P004');
    equal('FIFO 与空队列', [queue.dequeue(), queue.dequeue(), queue.dequeue()], ['P001', 'P004', null]);
    const tree = core.buildCategoryTree(data); const dfs = []; const bfs = [];
    core.walkDepthFirst(tree, (node) => dfs.push(node.name)); core.walkBreadthFirst(tree, (node) => bfs.push(node.name));
    equal('DFS 每节点一次', dfs, ['全部商品', '外设', 'P001', 'P002', '显示器', 'P003', '配件', 'P004', 'P005', '音频', 'P006']);
    equal('BFS 每节点一次', bfs, ['全部商品', '外设', '显示器', '配件', '音频', 'P001', 'P002', 'P003', 'P004', 'P005', 'P006']);
    const empty = []; core.walkDepthFirst(null, (node) => empty.push(node)); core.walkBreadthFirst(null, (node) => empty.push(node)); equal('空树', empty, []);
  }
  if (n >= 12 && n <= 20) {
    const { loadProducts } = await import(pathToFileURL(path.join(workspace, 'src/services/load-products.js')));
    if (n === 12) {
      equal('Promise 加载真实结果', await loadProducts({ delay: 0 }), data);
      let failed = false; try { await loadProducts({ fail: true, delay: 0 }); } catch { failed = true; }
      equal('Promise 失败向调用者传播', failed, true);
    } else {
      const original = globalThis.fetch;
      try {
        globalThis.fetch = async () => new Response(JSON.stringify(data));
        equal('静态 JSON 加载', await loadProducts(), data);
        globalThis.fetch = async () => new Response('<html>404</html>', { status: 404 });
        let message = ''; try { await loadProducts(); } catch (error) { message = error.message; }
        equal('先检查 HTTP 状态', message, 'HTTP 404');
        globalThis.fetch = async () => new Response('[]'); equal('空结果', await loadProducts(), []);
      } finally { globalThis.fetch = original; }
    }
  }
  if (n >= 14 && n <= 20) {
    const storage = await import(pathToFileURL(path.join(workspace, 'src/services/storage.js')));
    const map = new Map(); const memory = { getItem: (key) => map.get(key) ?? null, setItem: (key, value) => map.set(key, value) };
    storage.saveProducts(memory, data);
    const raw = memory.getItem(storage.storageKey);
    rejects('坏字段不能覆盖有效存储', () => storage.saveProducts(memory, [{ ...data[0], stock: '' }]));
    equal('有效原文保留', memory.getItem(storage.storageKey), raw);
    storage.saveProducts(memory, core.updateStock(data, 'P004', 8));
    memory.setItem(storage.storageKey, '{bad');
    equal('损坏后恢复有效备份', storage.recoverProducts(memory), data);
    equal('损坏原文可追溯', memory.getItem(storage.storageKey + ':damaged'), '{bad');
    equal('未使用站点 F1 键', [...map.keys()].some((key) => key.startsWith('js_web:progress')), false);
  }
  if (n >= 17 && n <= 20) {
    const { spawnSync } = await import('node:child_process');
    const report = spawnSync(process.execPath, [path.join(workspace, 'src/cli/report.js')], { cwd: path.dirname(workspace), encoding: 'utf8' });
    equal('不同 cwd 的当前报表', report.stdout.trim(), '商品数 6\n总库存 52\n总价值 2634800 分');
    equal('报表无宿主错误', report.status, 0);
  }
  if (n >= 18 && n <= 20) {
    const pkg = JSON.parse(await readFile(path.join(workspace, 'package.json')));
    equal('package report/test scripts', [typeof pkg.scripts.report, typeof pkg.scripts.test], ['string', 'string']);
  }
  if (n >= 11 && n <= 20) await run(process.execPath, ['tools/native-check.mjs', id]);
  if (n === 20) await run(process.execPath, ['node_modules/vitest/vitest.mjs', 'run', '--config', 'vite.config.js']);
  if (n >= 20) {
    for (const [text, value] of [['0', 0], ['0.29', 29], ['399.00', 39900], ['90071992547409.91', Number.MAX_SAFE_INTEGER]]) equal({ parsePriceCents: text }, core.parsePriceCents(text), value);
    for (const text of ['', ' ', '-1', '1.001', '3元', '90071992547409.92']) rejects({ parsePriceCents: text }, () => core.parsePriceCents(text));
    rejects('汇总超过安全整数', () => core.summarize([{ ...data[0], stock: 2, priceCents: Number.MAX_SAFE_INTEGER }]));
    rejects('重复 id', () => core.validateProducts([data[0], data[0]]));
    for (const changes of [{ stock: -1 }, { stock: '' }, { name: ' ' }, { category: '未知' }, { priceCents: 1.5 }, { tags: [1] }]) equal({ invalidProduct: changes }, Object.keys(core.validateProduct({ ...data[0], ...changes })).length > 0, true);
    const original = structuredClone(data); const next = core.updateStock(original, 'P004', 8);
    equal('按 id 更新 P004', next[3].stock, 8); equal('不改 P001', next[0].stock, 12); equal('原对象不改', original, data);
    equal('新数组与目标新对象', next !== original && next[3] !== original[3], true);
    const draft = core.toDraft(original[3]); draft.tags.push('仅草稿');
    equal('取消草稿 tags 不污染', original[3].tags, data[3].tags);
    equal('空白库存校验', core.parseDraft({ ...draft, stock: '' }).hasErrors, true);
    equal('合法零库存', core.parseDraft({ ...draft, stock: '0' }).value.stock, 0);
  }
  if (n >= 21 && n <= 24) {
    const files = ['tools/c21.test.jsx'];
    if (n >= 22) files.push('tools/c22.test.jsx');
    if (n === 24) files.push('tools/c24.test.jsx');
    await run(process.execPath, ['node_modules/vitest/vitest.mjs', 'run', '--config', 'tools/foundations.config.mjs', ...files]);
  }
  if (n === 23) {
    equal('src/react/StockActions.jsx 已创建', existsSync(path.join(workspace, 'src/react/StockActions.jsx')), true);
    await run(process.execPath, ['node_modules/vitest/vitest.mjs', 'run', '--config', 'tools/vitest.config.mjs']);
  }
  if (n >= 25 && n <= 28) {
    await run(process.execPath, ['tools/forms-state-check.mjs', id]);
    await run(process.execPath, ['tools/forms-state.browser.mjs', id]);
  }
  if (n >= 29 && n <= 36) {
    const args = ['node_modules/vitest/vitest.mjs', 'run', '--config', 'tools/effect.config.mjs'];
    if (n >= 30 && n <= 32) args.push('--exclude', 'tools/contract-a3.test.jsx');
    // C30–32 request tests run this contract once. C33+ keeps its timer test,
    // but the synchronous C28 form assertion is replaced by Action/RTL coverage.
    if (n >= 33) args.push('-t', '^(?!真实C28表单契约)');
    await run(process.execPath, args);
  }
  if (n >= 30 && n <= 36) {
    const args = ['node_modules/vitest/vitest.mjs', 'run', '--config', 'tools/request.config.mjs'];
    if (n >= 33) args.push('tools/query-a3.test.jsx');
    await run(process.execPath, args);
  }
  if (n >= 29 && n <= 31) await run(process.execPath, ['node_modules/vitest/vitest.mjs', 'run', '--config', 'tools/save-overflow-a3.config.mjs']);
  if (n >= 29 && n <= 32) await run(process.execPath, ['tools/browser-a3.mjs', id]);
  if (n >= 21 && n <= 36) await run(process.execPath, ["tools/react-ui-check.mjs", id]);
  if (n >= 33 && n <= 36) await run(process.execPath, ['node_modules/vitest/vitest.mjs', 'run', '--config', 'tools/action.config.mjs']);
  if (n >= 34 && n <= 36) await run(process.execPath, ['node_modules/vitest/vitest.mjs', 'run', '--config', 'tools/performance.config.mjs']);
  if (n >= 35 && n <= 36) {
    await run(process.execPath, ['node_modules/vitest/vitest.mjs', 'run', '--config', 'tools/behavior.config.mjs']);
    await run(process.execPath, ['node_modules/@playwright/test/cli.js', 'test', '--config', 'tools/playwright.config.mjs']);
  }
  if (n >= 29 && n <= 36) await run(process.execPath, ["node_modules/eslint/bin/eslint.js", "--config", "tools/eslint.config.mjs", "src/react"]);
  if (n >= 41 && n <= 42) {
    equal('view/EditDialog.fragment.xml 已创建', existsSync(path.join(workspace, 'adapters/openui5/webapp/view/EditDialog.fragment.xml')), true);
    await run(process.execPath, ['tools/ui5-check.mjs']);
  }
  console.log(`${id}：${count} 条当前工作文件检查通过；没有修改商品数据或源码。`);
} catch (error) { console.error(error.stack); process.exitCode = 1; }
