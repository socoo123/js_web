import assert from 'node:assert/strict';
import { cp, mkdtemp, readFile, rm, symlink, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { spawn, spawnSync } from 'node:child_process';
import { repo, materialize, filesIn, hash, safePath } from '../labs/snapshots.mjs';

// Teacher assembly + actual-source mutation regression. Not an independent reader walkthrough.
// No learner directory, browser profile, frozen archive or shared Astro cache is modified.
const parent = await mkdtemp(path.join(process.env.LAB_TEMP_ROOT ?? os.tmpdir(), 'inventory-delivery-regression-'));
const root = path.join(parent, 'inventory');
const dependencies = process.env.LAB_DEPENDENCIES ?? path.join(repo, 'labs/inventory/node_modules');
const env = { ...process.env, LAB_DELIVERY_PORT: process.env.LAB_DELIVERY_PORT ?? '8068' };
const results = [];
function execute(args, { red, includes, extra = {}, cwd = root } = {}) {
  console.log(`\n[${red ? '期望红' : '期望绿'}] node ${args.join(' ')}`);
  const result = spawnSync(process.execPath, args, { cwd, env: { ...env, ...extra }, encoding: 'utf8', timeout: 180000, maxBuffer: 16 * 1024 * 1024 });
  const output = (result.stdout ?? '') + (result.stderr ?? '');
  if (red) {
    assert.equal(result.error, undefined, `红测执行器失败：${result.error?.message}`);
    assert.notEqual(result.status, 0, '故障版本意外通过，回归没有捕获风险');
    assert(includes.test(output), `红测不是预期的行为失败：\n${output}`);
    console.log(output.split('\n').filter((line) => /Expected|Received|库存 13|库存 12|前缀错误|AssertionError|expected|received|P004|P002|1 failed|tests failed|Timeout|"before"|"after"|Closures|keydown|mian\.jsx|404/.test(line)).slice(0, 18).join('\n'));
  } else {
    if (result.status !== 0) console.error(output);
    assert.equal(result.status, 0, `绿测失败：${result.error?.message ?? result.signal ?? result.status}`);
    console.log(output.split('\n').filter((line) => /通过|passed|Test Files|Tests |"before"|"after"|Closures|ModuleRequests|Seconds/.test(line)).join('\n'));
  }
  results.push({ command: args.join(' '), expected: red ? 'red' : 'green', actualExit: result.status });
}
async function mutate(file, transform, callback) {
  const target = safePath(root, file);
  const original = await readFile(target, 'utf8');
  const changed = transform(original);
  assert.notEqual(changed, original, `故障未注入实际工作文件：${file}`);
  await writeFile(target, changed);
  try { await callback(); }
  finally { await writeFile(target, original); }
}
async function step(id) {
  const dir = path.join(repo, 'labs/reference/steps', id);
  const change = JSON.parse(await readFile(path.join(dir, 'change.json')));
  assert.equal(change.previous, `C${Number(id.slice(1)) - 1}`);
  for (const file of change.files) {
    const target = safePath(root, file); await mkdir(path.dirname(target), { recursive: true });
    await cp(safePath(path.join(dir, 'files'), file), target);
  }
}
async function digestFiles(prefix) {
  const result = {};
  for (const file of await filesIn(path.join(root, prefix))) result[file] = hash(await readFile(path.join(root, prefix, file)));
  return result;
}
async function probeStaticCLI(wrongBase) {
  const before = await digestFiles('dist/src-react');
  const html = await readFile(path.join(root, 'dist/src-react/index.html'), 'utf8');
  const child = spawn(process.execPath, ['tools/static-react-server.mjs'], {
    cwd: root, env: { ...env, LAB_STATIC_ROOT: 'dist/src-react', LAB_E2E_PORT: env.LAB_DELIVERY_PORT },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let output = '';
  try {
    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error(`已有产物CLI未就绪：${output}`)), 30000);
      const stop = () => clearTimeout(timer);
      child.on('error', (error) => { stop(); reject(error); });
      child.once('exit', (code) => { stop(); reject(new Error(`已有产物CLI提前退出${code}：${output}`)); });
      child.stderr.on('data', (chunk) => { output += chunk; });
      child.stdout.on('data', (chunk) => {
        output += chunk;
        if (output.includes('严格静态预览：')) { stop(); resolve(); }
      });
    });
    const origin = `http://127.0.0.1:${env.LAB_DELIVERY_PORT}`;
    const base = `${origin}/js_web/demos/inventory/`;
    const page = await fetch(base);
    assert.equal(page.status, 200);
    assert.equal(await page.text(), html, 'CLI服务的不是学员已有index.html');
    const entry = html.match(/src="([^"]+\.js)"/)?.[1];
    assert(entry, '产物缺JS');
    const response = await fetch(new URL(entry, base));
    assert.equal(response.status, wrongBase ? 404 : 200, '已有产物模式掩盖了实际入口URL');
    assert.equal((await fetch(base + 'assets/missing.js', { headers: { Accept: 'text/html' } })).status, 404);
    assert.deepEqual(await digestFiles('dist/src-react'), before, '已有产物模式重新构建或更改了产物字节');
    console.log(`已有产物CLI：${Object.keys(before).length}文件SHA未变；${wrongBase ? '错误base的/assets入口真实404' : '正确嵌套入口真实200'}，缺失JS真404；未build或修复base。`);
  } finally {
    if (child.exitCode === null && child.signalCode === null) {
      const ended = new Promise((resolve) => child.once('exit', resolve));
      child.kill('SIGTERM'); await ended;
    }
  }
}
try {
  await materialize('C44', root);
  await symlink(dependencies, path.join(root, 'node_modules'), 'dir');
  const originalReact = await digestFiles('src/react');
  const adapters = await digestFiles('adapters');
  const originalCore = await digestFiles('src/core');
  const startFiles = await filesIn(root);
  for (const file of ['notes/debug.md', 'notes/delivery.md', 'notes/test-plan.md', 'notes/final-review.md', 'tests/react/regression.test.jsx', 'tests/react/final-filter.test.jsx']) assert(!startFiles.includes(file), `答案倒灌C44：${file}`);
  assert(!(await readFile(path.join(root, 'vite.config.js'), 'utf8')).includes('/js_web/demos/inventory/'), 'C46 base 已倒灌 C44');
  assert(!(await readFile(path.join(root, 'src/react/App.jsx'), 'utf8')).includes('仅低库存'), 'C48 筛选已倒灌 C44');
  console.log(`C44真实起点：React ${Object.keys(originalReact).length}文件、四个adapter保留；无C45–C48答案。`);

  await step('C45');
  assert.deepEqual(await digestFiles('src/react'), originalReact, 'C45 排错记录不应改最终业务实现');
  execute(['tools/lab.mjs', 'start', 'C45']);
  execute(['tools/lab.mjs', 'check', 'C45']);
  await mutate('src/react/App.jsx', (text) => text.replace('await dispatch({ type: "restocked", id, amount });', 'products.find((product) => product.id === id).stock += amount;'), async () => {
    execute(['tools/delivery-browser.mjs', 'C45'], { red: true, includes: /库存 13 件/, extra: { LAB_DELIVERY_CASE: 'state' } });
  });
  execute(['tools/delivery-browser.mjs', 'C45'], { extra: { LAB_DELIVERY_CASE: 'state' } });
  await mutate('src/react/index.html', (text) => text.replace('./main.jsx', './mian.jsx'), async () => {
    execute(['tools/delivery-browser.mjs', 'C45'], { red: true, includes: /404.*mian\.jsx|mian\.jsx.*404/s, extra: { LAB_DELIVERY_CASE: 'state' } });
  });
  execute(['tools/delivery-browser.mjs', 'C45'], { extra: { LAB_DELIVERY_CASE: 'state' } });
  await mutate('src/vanilla/styles.css', (text) => `${text}\nmain { min-width: 44rem; }\n`, async () => {
    execute(['tools/delivery-browser.mjs', 'C45'], { red: true, includes: /360px 整页横向溢出/, extra: { LAB_DELIVERY_CASE: 'state' } });
  });
  execute(['tools/delivery-browser.mjs', 'C45'], { extra: { LAB_DELIVERY_CASE: 'state' } });
  execute(['tools/delivery-diagnostics.mjs']);
  await mutate('src/react/useInventoryShortcuts.js', (text) => text.replace('return () => window.removeEventListener("keydown", onKey);', '// 故障：没有移除旧订阅'), async () => {
    execute(['tools/delivery-diagnostics.mjs'], { red: true, includes: /keydown监听器未按生命周期释放/ });
  });
  execute(['tools/delivery-diagnostics.mjs']);

  await step('C46');
  execute(['tools/lab.mjs', 'start', 'C46']);
  execute(['tools/lab.mjs', 'check', 'C46']);
  await mutate('vite.config.js', (text) => text.replace('base: "/js_web/demos/inventory/"', 'base: "/"'), async () => {
    execute(['tools/delivery-browser.mjs', 'C46'], { red: true, includes: /生产入口前缀错误/, extra: { LAB_DELIVERY_CASE: 'static' } });
    await probeStaticCLI(true);
  });
  execute(['tools/delivery-browser.mjs', 'C46'], { extra: { LAB_DELIVERY_CASE: 'static' } });
  await probeStaticCLI(false);

  await step('C47');
  execute(['tools/lab.mjs', 'start', 'C47']);
  execute(['tools/lab.mjs', 'check', 'C47']);
  const vitest = ['node_modules/vitest/vitest.mjs', 'run', '--config', 'tools/delivery.config.mjs'];
  await mutate('src/services/storage.js', (text) => text.replace('  const text = encodeSnapshot(products);', '  storage.setItem(key, JSON.stringify({ version: 1, products }));\n  const text = encodeSnapshot(products);'), async () => {
    execute([...vitest, 'tests/react/regression.test.jsx', '-t', '非法保存'], { red: true, includes: /expected.*to be|AssertionError/i });
  });
  execute([...vitest, 'tests/react/regression.test.jsx']);
  await mutate('src/react/App.jsx', (text) => text.replace('<HashRouter useTransitions={false}>', '<HashRouter>'), async () => {
    execute(['tools/delivery-browser.mjs', 'C47'], { red: true, includes: /P004/, extra: { LAB_DELIVERY_CASE: 'search' } });
  });
  execute(['tools/delivery-browser.mjs', 'C47'], { extra: { LAB_DELIVERY_CASE: 'search' } });
  await mutate('src/react/ProductDetail.jsx', (text) => text.replace('onClick={() => detail.refetch()}', 'onClick={() => {}}'), async () => {
    execute([...vitest, 'tests/react/inventory.test.jsx', '-t', '详情失败后点击重试恢复'], { red: true, includes: /Unable to find|模拟断网/ });
  });
  execute([...vitest, 'tests/react/inventory.test.jsx', '-t', '详情失败后点击重试恢复']);

  await step('C48');
  execute(['tools/lab.mjs', 'start', 'C48']);
  execute(['tools/lab.mjs', 'check', 'C48']);
  await mutate('src/core/stock.js', (text) => text.replace('return products.map((product) => product.id === id ? { ...product, stock } : product);', 'const next = [...products];\n  next.find((product) => product.id === id).stock = stock;\n  return next;'), async () => {
    execute([...vitest, 'tests/react/final-filter.test.jsx', '-t', '浅复制故障'], { red: true, includes: /expected 1 to be \+?0|expected 1 to be 0|AssertionError/ });
  });
  execute([...vitest, 'tests/react/final-filter.test.jsx']);
  await mutate('src/react/App.jsx', (text) => text.replace('product.stock >= 1 && product.stock <= 5', 'product.stock >= 0 && product.stock <= 5'), async () => {
    execute(['tools/delivery-browser.mjs', 'C48'], { red: true, includes: /Expected.*2|Received.*3|resolved to 3 elements/, extra: { LAB_DELIVERY_CASE: 'stock-filter' } });
  });
  execute(['tools/delivery-browser.mjs', 'C48'], { extra: { LAB_DELIVERY_CASE: 'stock-filter' } });
  assert.deepEqual(await digestFiles('adapters'), adapters, 'L5 意外改写既有adapter');
  assert.deepEqual(await digestFiles('src/core'), originalCore, '故障实验没有恢复core');
  const compatibility = path.join(parent, 'c35-compatibility');
  await materialize('C35', compatibility);
  await symlink(dependencies, path.join(compatibility, 'node_modules'), 'dir');
  execute(['node_modules/@playwright/test/cli.js', 'test', '--config', 'tools/playwright.config.mjs'], {
    cwd: compatibility, extra: { LAB_E2E_PORT: env.LAB_DELIVERY_PORT, LAB_STATIC_ROOT: '' },
  });
  console.log(`\n交付链 C44→C48：4课当前文件门禁、10组真实源码红→绿通过，四个adapter原字节保留。仅自动组装/行为回归，不等同主agent的独立正文跟做。\n${JSON.stringify(results, null, 2)}`);
} finally {
  if (process.env.LAB_KEEP_DELIVERY === '1') console.log(`保留本次隔离证据：${parent}`);
  else await rm(parent, { recursive: true, force: true });
}
