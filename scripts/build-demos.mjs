import { existsSync, readFileSync, globSync } from 'node:fs';
import { mkdir, readFile, realpath, stat, symlink, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { repo, filesIn, hash } from '../labs/snapshots.mjs';
import { withSnapshots } from './check-previews.mjs';

// 把参考快照构建成 Lab 目标演示：public/demos/<id>/，站点路径 /js_web/demos/<id>/。
// 产物不提交；npm run build 在 astro build 之前生成。/js_web/demos/inventory/ 留给 C46 学员自己的构建。
// 用法：node scripts/build-demos.mjs [--force] [--verify]
const SITE_BASE = '/js_web/';
const inventory = path.join(repo, 'labs/inventory');
const publicDir = path.join(repo, 'public');
const stampDir = path.join(repo, '.cache/demos');
const config = JSON.parse(readFileSync(path.join(repo, 'labs/demos.json'), 'utf8'));
const args = new Set(process.argv.slice(2));
for (const arg of args) if (!['--force', '--verify'].includes(arg)) { console.error('用法：node scripts/build-demos.mjs [--force] [--verify]'); process.exit(1); }

function validate(demo) {
  if (!/^l[1-5]$/.test(demo.id) || demo.path !== `demos/${demo.id}/`) throw new Error(`演示 ${demo.id} 的 path 必须是 demos/<id>/`);
  if (!/^C\d{2}$/.test(demo.checkpoint) || !Array.isArray(demo.sources) || !demo.sources.length) throw new Error(`演示 ${demo.id} 需要 checkpoint 与 sources`);
  if (!Array.isArray(demo.smoke) || !demo.smoke.length) throw new Error(`演示 ${demo.id} 需要 smoke 检查`);
}

async function digest(demo, root) {
  const files = [];
  for (const source of demo.sources) {
    const absolute = path.join(root, source);
    const names = (await stat(absolute)).isDirectory() ? (await filesIn(absolute)).map((name) => `${source}/${name}`) : [source];
    for (const name of names) files.push([name, hash(await readFile(path.join(root, name)))]);
  }
  const lock = hash(await readFile(path.join(inventory, 'package-lock.json')));
  return hash(JSON.stringify({ demo: { checkpoint: demo.checkpoint, path: demo.path, sources: demo.sources }, lock, files: files.sort(([a], [b]) => a.localeCompare(b, 'en')) }));
}

// 产物里的绝对地址必须在本演示前缀下；根路径 /assets/ 在 Pages 子路径上会 404。
async function verifyOutput(demo, outDir) {
  const base = SITE_BASE + demo.path;
  const html = await readFile(path.join(outDir, 'index.html'), 'utf8');
  const problems = [];
  for (const match of html.matchAll(/\b(?:src|href)="([^"]+)"/g)) {
    if (/^(?:https?:|data:|#)/.test(match[1])) continue;
    if (!match[1].startsWith(base)) problems.push(`index.html 引用 ${match[1]}`);
    else if (!existsSync(path.join(outDir, match[1].slice(base.length)))) problems.push(`index.html 引用的文件不存在：${match[1]}`);
  }
  for (const file of globSync('**/*.js', { cwd: outDir })) {
    const text = await readFile(path.join(outDir, file), 'utf8');
    if (/["'`]\/assets\//.test(text)) problems.push(`${file} 含根路径 /assets/`);
  }
  if (problems.length) throw new Error(`演示 ${demo.id} 产物路径错误：\n${problems.join('\n')}`);
  return globSync('**/*', { cwd: outDir, withFileTypes: true }).filter((entry) => entry.isFile()).length;
}

async function build(demos) {
  const { build: viteBuild } = await import(pathToFileURL(path.join(inventory, 'node_modules/vite/dist/node/index.js')));
  await mkdir(stampDir, { recursive: true });
  await withSnapshots(demos.map((demo) => demo.checkpoint), async (roots) => {
    for (const demo of demos) {
      const root = roots[demo.checkpoint];
      const outDir = path.join(publicDir, demo.path);
      const stampFile = path.join(stampDir, `${demo.id}.json`);
      const current = await digest(demo, root);
      const stamp = existsSync(stampFile) ? JSON.parse(await readFile(stampFile, 'utf8')) : null;
      if (!args.has('--force') && stamp?.digest === current && existsSync(path.join(outDir, 'index.html'))) {
        console.log(`演示 ${demo.id}：源码未变，沿用 public/${demo.path}（${stamp.files} 个文件）`);
        continue;
      }
      if (!existsSync(path.join(root, 'node_modules'))) await symlink(path.join(inventory, 'node_modules'), path.join(root, 'node_modules'), 'dir');
      const { viteConfig } = await import(pathToFileURL(path.join(root, 'tools/lab.mjs')));
      const options = await viteConfig(demo.checkpoint, true);
      options.base = SITE_BASE + demo.path;
      options.logLevel = 'warn';
      options.build = { ...options.build, outDir, emptyOutDir: true, sourcemap: false };
      await viteBuild(options);
      const files = await verifyOutput(demo, outDir);
      await writeFile(stampFile, JSON.stringify({ digest: current, files }, null, 2) + '\n');
      console.log(`演示 ${demo.id}：${demo.checkpoint} 已构建到 public/${demo.path}（base ${options.base}，${files} 个文件）`);
    }
  });
}

const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.webp': 'image/webp', '.png': 'image/png' };
// 严格静态服务器：只返回真实存在的文件，目录只在以 / 结尾时取 index.html，没有 SPA 回退。
export async function serveStrict(root, port) {
  const actualRoot = await realpath(root);
  const server = createServer(async (request, response) => {
    try {
      const url = new URL(request.url, 'http://localhost');
      if (!['GET', 'HEAD'].includes(request.method) || !url.pathname.startsWith(SITE_BASE)) throw new Error('outside');
      let relative = decodeURIComponent(url.pathname.slice(SITE_BASE.length));
      if (relative === '' || relative.endsWith('/')) relative += 'index.html';
      const file = await realpath(path.resolve(actualRoot, relative));
      if (!file.startsWith(actualRoot + path.sep) || !(await stat(file)).isFile()) throw new Error('not a file');
      response.writeHead(200, { 'Content-Type': types[path.extname(file)] ?? 'application/octet-stream', 'Cache-Control': 'no-store' });
      response.end(request.method === 'HEAD' ? undefined : await readFile(file));
    } catch { response.writeHead(404, { 'Content-Type': 'text/plain' }); response.end('Not found'); }
  });
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(port, '127.0.0.1', resolve); });
  return server;
}

async function verify(demos) {
  const { chromium, expect } = await import(pathToFileURL(path.join(inventory, 'node_modules/@playwright/test/index.mjs')));
  const port = Number(process.env.DEMO_PORT ?? 4340);
  const server = await serveStrict(publicDir, port);
  const browser = await chromium.launch();
  try {
    for (const demo of demos) {
      const base = `http://127.0.0.1:${port}${SITE_BASE}${demo.path}`;
      const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
      const page = await context.newPage();
      const requests = [];
      const errors = [];
      page.on('pageerror', (error) => errors.push(error.message));
      page.on('response', (response) => requests.push([response.status(), new URL(response.url()).pathname]));
      for (const [i, check] of demo.smoke.entries()) {
        await page.goto(base + check.path);
        await expect(page.locator('body')).toContainText(check.text, { timeout: 15000 });
        if (check.path.startsWith('#')) {
          await page.reload();
          await expect(page.locator('body')).toContainText(check.text, { timeout: 15000 });
        }
        console.log(`  ${i + 1}. ${check.path || '直接访问'}${check.path.startsWith('#') ? ' 与刷新' : ''}：看到「${check.text}」`);
      }
      if (demo.interaction) {
        await page.goto(base);
        await page.locator(demo.interaction.click).click();
        await expect(page.locator('body')).toContainText(demo.interaction.text, { timeout: 15000 });
        console.log(`  交互：浏览器内 mock 数据更新为「${demo.interaction.text}」`);
      }
      const outside = requests.filter(([, pathname]) => !pathname.startsWith(SITE_BASE + demo.path));
      const failed = requests.filter(([status]) => status !== 200);
      if (outside.length || failed.length || errors.length) throw new Error(`演示 ${demo.id}：前缀外请求 ${JSON.stringify(outside)}；失败请求 ${JSON.stringify(failed)}；页面异常 ${errors.join(' | ')}`);
      const data = await context.request.get(base + 'products.json');
      const products = await data.json();
      const probes = {
        [`${SITE_BASE}${demo.path}products/P004`]: 404,
        [`${SITE_BASE}${demo.path}assets/missing.js`]: 404,
        [`/assets/`]: 404,
        [`${SITE_BASE}${demo.path}index.html`]: 200,
      };
      for (const [probe, expected] of Object.entries(probes)) {
        const status = (await context.request.get(`http://127.0.0.1:${port}${probe}`)).status();
        if (status !== expected) throw new Error(`严格静态检查失败：${probe} 返回 ${status}，应为 ${expected}`);
      }
      console.log(`演示 ${demo.id} 严格静态验证通过：${requests.length} 个请求全部 200 且都在 ${SITE_BASE}${demo.path} 下；products.json ${products.length} 条；深链与缺失资源真实 404，无 SPA 回退。`);
      await context.close();
    }
  } finally { await browser.close(); server.close(); }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const demos = config.demos;
  demos.forEach(validate);
  await build(demos);
  if (args.has('--verify')) await verify(demos);
}
