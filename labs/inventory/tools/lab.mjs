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
    base: production ? (process.env.LAB_BASE ?? '/js_web/demos/inventory/') : '/',
    server: { host: '127.0.0.1', port: 8060, strictPort: true, fs: { allow: [workspace] } },
    build: { outDir: path.join(workspace, 'dist', entry.replaceAll('/', '-')), emptyOutDir: true, sourcemap: true },
  }, overrides);
}
async function main() {
  const [command = 'status', rawId, target] = process.argv.slice(2);
  if (command === 'experiment') {
    const { experiment } = await import('./experiments.mjs'); await experiment(rawId); return;
  }
  const state = await readState();
  const id = (rawId ?? state.lessonId).toUpperCase();
  const lesson = catalog.lessons.find((lesson) => lesson.lessonId === id);
  if (command === 'restore') {
    if (!rawId || !target) throw new Error('用法：npm run lab -- restore C02 ../新的空目录');
    const { restore } = await import('./reference.mjs');
    await restore(id, path.resolve(workspace, target)); return;
  }
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
  throw new Error('命令：status | start Cnn | dev | console | check Cnn | report | build | compare Cnn | restore Cnn 新目录 | experiment lock/managers/types');
}
if (process.argv[1] && existsSync(process.argv[1]) && await realpath(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => { console.error(error.message); process.exitCode = 1; });
}
