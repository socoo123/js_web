import assert from 'node:assert/strict';
import { cp, mkdir, mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { repo, materialize } from '../labs/snapshots.mjs';
import { BUGS } from '../labs/capstone/bugs.mjs';
import { QUESTIONS } from '../labs/capstone/quiz.mjs';

// L6 中需要 React、浏览器或构建才能确认的题目：在 C48 工作区副本里实际运行。
// 用法：node scripts/verify-capstone-workspace.mjs（LAB_DEPENDENCIES 指向已安装依赖的 labs/inventory/node_modules）。
const parent = await mkdtemp(path.join(process.env.LAB_TEMP_ROOT ?? os.tmpdir(), 'capstone-verify-'));
const root = path.join(parent, 'inventory');
const dependencies = process.env.LAB_DEPENDENCIES ?? path.join(repo, 'labs/inventory/node_modules');
const port = process.env.LAB_DELIVERY_PORT ?? '8068';
const bug = (id) => BUGS.find((item) => item.id === id);
const question = (id) => QUESTIONS.find((item) => item.id === id);
const indent = (text, pad) => text.split('\n').map((line) => (line ? pad + line : line)).join('\n');
function replaceLines(code, from, to, insert) {
  const lines = code.split('\n');
  lines.splice(from - 1, to - from + 1, insert);
  return lines.join('\n');
}
function node(args, extra = {}) {
  const result = spawnSync(process.execPath, args, { cwd: root, env: { ...process.env, ...extra }, encoding: 'utf8', timeout: 180000, maxBuffer: 16 * 1024 * 1024 });
  const output = (result.stdout ?? '') + (result.stderr ?? '');
  if (result.status !== 0) console.error(output);
  assert.equal(result.status, 0, `命令失败：node ${args.join(' ')}`);
  return output;
}

async function generateReact() {
  const out = path.join(root, 'tests/capstone-gen');
  await mkdir(out, { recursive: true });
  const write = (name, text) => writeFile(path.join(out, name), text);

  const stale = bug('bug-stale-timeout');
  const staleFixed = replaceLines(stale.code, 5, 9, indent(stale.fix, '  '));
  assert(staleFixed.includes('setStock((previous) => previous + 3);'));
  await write('stale-buggy.jsx', stale.code);
  await write('stale-fixed.jsx', staleFixed);

  const key = bug('bug-index-key');
  const keyHead = 'import { useState } from "react";\n';
  await write('key-buggy.jsx', keyHead + key.code);
  await write('key-fixed.jsx', keyHead + replaceLines(key.code, 3, 3, indent(key.fix, '    ')));

  const race = bug('bug-effect-race');
  const raceHead = 'import { useState, useEffect } from "react";\nimport { loadProduct } from "./load.js";\nexport ';
  await write('race-buggy.jsx', raceHead + race.code);
  await write('race-fixed.jsx', raceHead + replaceLines(race.code, 3, 10, indent(race.fix, '  ')));
  await write('load.js', `const delays = { P001: 300, P002: 50 };
const names = { P001: "机械键盘", P002: "无线鼠标" };
export function loadProduct(id) {
  return new Promise((resolve) => setTimeout(() => resolve({ id, name: names[id] }), delays[id]));
}
`);

  await write('queue.jsx', `import { useState } from "react";
export function Queue() {
  const [stock, setStock] = useState(12);
  function click() {
${indent(question('react-queue').code, '    ')}
  }
  return <button onClick={click}>{stock}</button>;
}
`);
  await write('and-zero.jsx', `const products = [{ id: "P001", tags: ["外设"] }, { id: "P002", tags: [] }];
export const element = ${question('react-and-zero').code};
`);
  await write('lowercase.jsx', `let calls = 0;
function ProductCard({ product }) { calls += 1; return <article>{product.name}</article>; }
const products = ["P001", "P002", "P003", "P004", "P005", "P006"].map((id) => ({ id, name: id }));
export function List() {
  return <section id="list">{products.map((product) => <productCard key={product.id} product={product} />)}</section>;
}
export function Correct() {
  return <section id="list">{products.map((product) => <ProductCard key={product.id} product={product} />)}</section>;
}
export const getCalls = () => calls;
`);
  await cp(path.join(repo, 'labs/capstone/verify/react.test.jsx'), path.join(root, 'tests/capstone-verify.test.jsx'));
}

async function probeStatic() {
  const html = await readFile(path.join(root, 'dist/src-react/index.html'), 'utf8');
  const entry = html.match(/src="([^"]+\.js)"/)?.[1];
  assert(entry, '产物缺入口 JS');
  const child = spawn(process.execPath, ['tools/static-react-server.mjs'], {
    cwd: root, env: { ...process.env, LAB_STATIC_ROOT: 'dist/src-react', LAB_E2E_PORT: port }, stdio: ['ignore', 'pipe', 'pipe'],
  });
  try {
    await new Promise((resolve, reject) => {
      let output = '';
      const timer = setTimeout(() => reject(new Error(`静态预览未就绪：${output}`)), 30000);
      child.once('exit', (code) => { clearTimeout(timer); reject(new Error(`静态预览提前退出 ${code}：${output}`)); });
      child.stderr.on('data', (chunk) => { output += chunk; });
      child.stdout.on('data', (chunk) => {
        output += chunk;
        if (output.includes('严格静态预览：')) { clearTimeout(timer); resolve(); }
      });
    });
    const origin = `http://127.0.0.1:${port}`;
    const page = await fetch(`${origin}/js_web/demos/inventory/`);
    const asset = await fetch(new URL(entry, `${origin}/js_web/demos/inventory/`));
    return { entry, page: page.status, asset: asset.status };
  } finally {
    child.kill();
  }
}

try {
  await materialize('C48', root);
  await symlink(dependencies, path.join(root, 'node_modules'), 'dir');
  console.log(`C48 工作区副本：${root}`);

  await generateReact();
  const vitest = node(['node_modules/vitest/vitest.mjs', 'run', '--config', 'vite.config.js', 'tests/capstone-verify.test.jsx', '--silent=false']);
  console.log(vitest.split('\n').filter((line) => line.startsWith('[capstone]') || /Tests\s+\d/.test(line)).join('\n'));

  await cp(path.join(repo, 'labs/capstone/verify/browser.mjs'), path.join(root, 'capstone-browser.mjs'));
  const browser = JSON.parse(node(['capstone-browser.mjs'], {
    CAPSTONE_UI5_CODE: question('ui5-boolean-attr').code,
    CAPSTONE_BOX_CSS: question('web-box').code,
  }).trim().split('\n').at(-1));
  console.log(`[capstone] ui5-boolean-attr Chromium ${browser.chromium}：Console ${JSON.stringify(browser.console)}；渲染后 getAttribute ${JSON.stringify(browser.attribute)}；内部 button.disabled ${browser.innerDisabled}`);
  const expected = question('ui5-boolean-attr').options[question('ui5-boolean-attr').answer[0]];
  assert.deepEqual(browser.console, [expected]);
  assert.equal(browser.innerDisabled, true, 'attribute 写 "false" 后内部按钮应仍被禁用');
  console.log(`[capstone] web-box content-box 外框 ${browser.contentBox}px；border-box 外框 ${browser.borderBox}px、内容区 ${browser.borderBoxContent}px`);
  assert.deepEqual([browser.contentBox, browser.borderBox, browser.borderBoxContent], [228, 200, 172]);

  const ui5Bug = bug('bug-ui5-path');
  const controller = path.join(root, 'adapters/openui5/webapp/controller/Inventory.controller.js');
  const controllerSource = await readFile(controller, 'utf8');
  const correctEdit = '      const context = event.getSource().getBindingContext("inventory");\n      this._editPath = context.getPath();';
  const buggyEdit = indent(ui5Bug.code.split('\n').slice(1, 6).map((line) => line.slice(2)).join('\n'), '      ');
  assert(controllerSource.includes(correctEdit), 'C48 控制器与预期不一致，无法注入故障');
  assert(controllerSource.includes(indent(ui5Bug.fix.split('\n').slice(1, 3).map((line) => line.slice(2)).join('\n'), '      ')), '页面上的修复片段与工作区控制器不一致');
  await writeFile(controller, controllerSource.replace(correctEdit, buggyEdit));
  const red = spawnSync(process.execPath, ['tools/check.mjs', 'C41'], { cwd: root, encoding: 'utf8', timeout: 300000, maxBuffer: 16 * 1024 * 1024 });
  await writeFile(controller, controllerSource);
  const redOutput = (red.stdout ?? '') + (red.stderr ?? '');
  assert.notEqual(red.status, 0, '注入页面上的有问题写法后 C41 检查意外通过');
  assert(/P001 不变/.test(redOutput) && /\+\s+id: 'P004'/.test(redOutput), `C41 失败原因不是覆盖了 P001：\n${redOutput}`);
  const green = node(['tools/check.mjs', 'C41']);
  console.log(`[capstone] bug-ui5-path 有问题写法：C41 浏览器检查失败「P004 保存8/P001 不变」，原 P001 位置变成 id P004；修复后：${green.split('\n').find((line) => line.includes('context')) ?? '通过'}`);

  node(['tools/lab.mjs', 'start', 'C48']);
  const config = path.join(root, 'vite.config.js');
  const original = await readFile(config, 'utf8');
  const wrong = original.replace(/base: "[^"]*"/, 'base: "/"');
  assert.notEqual(wrong, original, 'vite.config.js 里没有 base 可替换');
  assert(wrong.includes(bug('bug-vite-base').code.split('\n')[2].trim()), '页面上的有问题写法与工作区配置不一致');
  await writeFile(config, wrong);
  node(['tools/lab.mjs', 'build']);
  const broken = await probeStatic();
  await writeFile(config, original);
  node(['tools/lab.mjs', 'build']);
  const fixed = await probeStatic();
  console.log(`[capstone] bug-vite-base base "/"：入口 ${broken.entry}，页面 ${broken.page}，入口 JS ${broken.asset}；改回子路径：入口 ${fixed.entry}，入口 JS ${fixed.asset}`);
  assert.equal(broken.page, 200);
  assert(broken.entry.startsWith('/assets/'));
  assert.equal(broken.asset, 404);
  assert(fixed.entry.startsWith('/js_web/demos/inventory/assets/'));
  assert.equal(fixed.asset, 200);

  console.log('\nL6 工作区实测通过');
} finally {
  if (!process.env.KEEP_CAPSTONE_VERIFY) await rm(parent, { recursive: true, force: true });
}
