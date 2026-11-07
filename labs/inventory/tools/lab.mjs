import { readFile, writeFile, mkdir, realpath, copyFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import { pathToFileURL } from 'node:url';

export const workspace = fileURLToPath(new URL('../', import.meta.url));
export const catalog = JSON.parse(await readFile(new URL('./catalog.json', import.meta.url)));
const stateFile = path.join(workspace, '.lab/state.json');
const readState = async () => {
  try { return JSON.parse(await readFile(stateFile, 'utf8')); }
  catch (error) { if (error.code === 'ENOENT') return { lessonId: 'C01' }; throw new Error(`任务记录无法读取：${error.message}；源码未修改。`); }
};
const saveState = async (state) => {
  await mkdir(path.dirname(stateFile), { recursive: true });
  await writeFile(stateFile, JSON.stringify(state, null, 2) + '\n');
};
export function run(command, args, cwd = workspace) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd, stdio: 'inherit', env: process.env });
    child.on('error', reject);
    child.on('exit', (code, signal) => code === 0 ? resolve() : reject(new Error(`${path.basename(command)} 退出：${signal ?? code}`)));
  });
}
export function entryFor(id) {
  const n = Number(id.slice(1));
  if (n === 38) return 'adapters/antd';
  if (n >= 40 && n <= 42) return 'adapters/openui5';
  if (n === 43) return 'adapters/web-components';
  if (n === 44) return 'adapters/ui5-react';
  return n >= 21 ? 'src/react' : 'src/vanilla';
}
export async function viteConfig(id, production = false) {
  const entry = entryFor(id);
  const publicDir = path.join(workspace, '.lab/public');
  await mkdir(publicDir, { recursive: true });
  await copyFile(path.join(workspace, 'data/products.json'), path.join(publicDir, 'products.json'));
  const plugins = Number(id.slice(1)) >= 21 ? [(await import('@vitejs/plugin-react')).default()] : [];
  const { mergeConfig } = await import("vite");
  const own = path.join(workspace, "vite.config.js");
  const overrides = existsSync(own) ? (await import(pathToFileURL(own))).default : {};
  return mergeConfig({
    configFile: false, publicDir, root: path.join(workspace, entry), appType: 'mpa', plugins,
    cacheDir: path.join(workspace, '.lab/vite-cache', entry.replaceAll('/', '-')),
    // Prebundle the full React entry graph before serving a C31 -> C32 increment.
    // plugin-react already includes react, react-dom and both JSX runtimes.
    optimizeDeps: entry === 'src/react' ? { include: ['react-dom/client', 'react-router', '@tanstack/react-query'] } : undefined,
    base: production ? (process.env.LAB_BASE ?? '/js_web/demos/inventory/') : '/',
    server: { host: '127.0.0.1', port: 8060, strictPort: true, fs: { allow: [workspace] } },
    build: { outDir: path.join(workspace, 'dist', entry.replaceAll('/', '-')), emptyOutDir: true, sourcemap: true },
  }, overrides);
}
const backendMissing = '本地后端从 2026.11-v4.0 的 C44 起提供；按 Lab 总览的升级说明取得新工作区。';
const shown = (file) => { const relative = path.relative(workspace, file); return !relative || relative.startsWith('..') || path.isAbsolute(relative) ? file : relative; };
async function loadBackend() {
  const app = path.join(workspace, 'server/app.mjs');
  if (!existsSync(app)) throw new Error(backendMissing);
  return import(pathToFileURL(app));
}
async function resetApi(backend, options) {
  let response;
  if (options.port !== 0) {
    try { response = await fetch(`http://127.0.0.1:${options.port}/api/_lab/reset`, { method: 'POST', signal: AbortSignal.timeout(3000) }); }
    catch (error) { if (error.cause?.code !== 'ECONNREFUSED') throw new Error(`127.0.0.1:${options.port} 没有正常响应：${error.cause?.message ?? error.message}`); }
  }
  if (response) {
    if (response.status !== 204) throw new Error(`${options.port} 上的服务不像库存后端（POST /api/_lab/reset 返回 ${response.status}）；先停掉它再重试。`);
    console.log(`已通过运行中的后端（127.0.0.1:${options.port}）恢复固定数据，并清空注入的故障。`);
    return;
  }
  const { products, damagedFile } = backend.resetDataFile(options);
  console.log(`后端没有运行，已离线恢复固定数据：${shown(options.dataFile)}（${products.length} 个商品，version 全为 1）。`);
  if (damagedFile) console.log(`原文件已损坏，另存为 ${shown(damagedFile)}，没有删除。`);
}
async function api(subcommand) {
  const backend = await loadBackend();
  const options = backend.optionsFromEnv();
  if (subcommand === 'reset') { await resetApi(backend, options); return; }
  if (subcommand) throw new Error('用法：npm run lab -- api 或 npm run lab -- api reset');
  const { origin, close } = await backend.startApiServer(options);
  console.log(`库存后端：${origin}/api（数据 ${shown(options.dataFile)}；Ctrl+C 停止）`);
  if (options.corsOrigin) console.log(`CORS 只放行来源 ${options.corsOrigin}`);
  const stop = async () => { await close(); console.log('库存后端已停止。'); process.exit(0); };
  process.once('SIGINT', stop); process.once('SIGTERM', stop);
}
async function shell() {
  const root = path.join(workspace, 'shell');
  if (!existsSync(path.join(root, 'index.html'))) throw new Error(backendMissing);
  const target = `http://127.0.0.1:${process.env.LAB_API_PORT || 8070}`;
  const { createServer } = await import('vite');
  const react = (await import('@vitejs/plugin-react')).default;
  const server = await createServer({
    configFile: false, root, publicDir: false, plugins: [react()],
    cacheDir: path.join(workspace, '.lab/vite-cache/shell'),
    server: { host: '127.0.0.1', port: 8061, strictPort: true, proxy: { '/api': target } },
  });
  await server.listen(); server.printUrls();
  console.log(`  /api 代理到 ${target}；后端要在另一个终端用 npm run lab -- api 启动。`);
}
async function main() {
  const [command = 'status', rawId, target] = process.argv.slice(2);
  if (command === 'experiment') {
    const { experiment } = await import('./experiments.mjs'); await experiment(rawId); return;
  }
  // 后端与前端壳不依赖当前任务记录，像 restore 一样在读取任务状态之前处理。
  if (command === 'api') { await api(rawId); return; }
  if (command === 'shell') { await shell(); return; }
  if (command === 'restore') {
    if (!rawId || !target) throw new Error('用法：npm run lab -- restore C02 ../新的空目录');
    const { restore } = await import('./reference.mjs');
    // 恢复不依赖当前任务状态，损坏的暂停记录也不应阻断另存恢复。
    await restore(rawId.toUpperCase(), path.resolve(workspace, target)); return;
  }
  const state = await readState();
  const id = (rawId ?? state.lessonId).toUpperCase();
  const lesson = catalog.lessons.find((lesson) => lesson.lessonId === id);
  if (!lesson) throw new Error(`未知课程：${id}`);
  if (command === 'status' || command === 'start') {
    if (command === 'start') {
      if (!lesson.implemented) throw new Error(`${id} 工作区任务尚未发行；请继续阅读旧版课程。`);
      const entry = entryFor(id) === 'adapters/openui5' ? 'adapters/openui5/webapp/index.html' : `${entryFor(id)}/index.html`;
      if (lesson.trial && !existsSync(path.join(workspace, entry))) throw new Error(`${id} 是前置试做：先将 ${lesson.trial.start} 起点包另存到新目录，再在该目录 start；当前源码未修改。`);
      await saveState({ ...state, lessonId: id });
    }
    console.log(`${catalog.release} · ${id} · ${lesson.title}\n工作目录：${workspace}\n入口：${entryFor(id) === 'adapters/openui5' ? 'adapters/openui5/webapp' : entryFor(id)}/index.html\n改动：${lesson.files.join('、')}\n验收：${lesson.acceptance.join('；')}\n${lesson.commands.check}\n上次检查：${state.lastCheck ? JSON.stringify(state.lastCheck) : '未执行'}\n暂停记录：notes/next.md（自行保存；检查不会标记网站课程完成）`);
    return;
  }
  if (!lesson.implemented) throw new Error(`${id} 工作区检查尚未发行。`);
  if (command === 'console') {
    const { start } = await import('node:repl');
    const core = await import(pathToFileURL(path.join(workspace, 'src/core/inventory.js')));
    const products = JSON.parse(await readFile(path.join(workspace, 'data/products.json')));
    console.log('inventory 是当前业务模块；products 是固定数据的独立副本。改完源码后用 Ctrl+D 退出并重新进入，加载新代码。');
    const session = start({ prompt: '库存> ' });
    session.context.inventory = core; session.context.products = products;
    return;
  }
  if (command === 'check') {
    try {
      await run(process.execPath, ['tools/check.mjs', id]);
      await saveState({ ...state, lastCheck: { lessonId: id, passed: true, at: new Date().toISOString() } });
    } catch (error) {
      await saveState({ ...state, lastCheck: { lessonId: id, passed: false, at: new Date().toISOString() } });
      throw error;
    }
    return;
  }
  if (command === 'compare') {
    const { compare } = await import('./reference.mjs'); await compare(id); return;
  }
  if (command === 'lint') { await run(process.execPath, ['node_modules/eslint/bin/eslint.js', '--config', 'tools/eslint.config.mjs', 'src/react']); return; }
  if (command === 'report') {
    if (Number(state.lessonId.slice(1)) < 17) throw new Error('报表从 C17 开始；先完成 src/cli/report.js。');
    await run(process.execPath, ['src/cli/report.js']); return;
  }
  if (command === 'dev' || command === 'build') {
    if (entryFor(state.lessonId) === 'adapters/openui5') {
      await run(process.execPath, ['tools/bridge.mjs']);
      const ui5 = path.join(workspace, 'node_modules/@ui5/cli/bin/ui5.cjs');
      if (command === 'dev') console.log('打开 http://127.0.0.1:8060/index.html（根地址是资源目录）。');
      await run(process.execPath, [ui5, command === 'dev' ? 'serve' : 'build', ...(command === 'dev' ? ['--port', '8060'] : ['--all', '--clean-dest', '--include-task', 'generateVersionInfo'])], path.join(workspace, 'adapters/openui5'));
    } else {
      const vite = await import('vite');
      const config = await viteConfig(state.lessonId, command === 'build');
      if (command === 'dev') { const server = await vite.createServer(config); await server.listen(); server.printUrls(); }
      else await vite.build(config);
    }
    return;
  }
  throw new Error('命令：status | start Cnn | dev | console | check Cnn | report | build | compare Cnn | restore Cnn 新目录 | api | api reset | shell | experiment lock/managers/types');
}
if (process.argv[1] && existsSync(process.argv[1]) && await realpath(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => { console.error(error.message); process.exitCode = 1; });
}
