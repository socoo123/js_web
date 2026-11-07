import { mkdir, readdir, rm, symlink, writeFile } from 'node:fs/promises';
import { createServer as createNetServer } from 'node:net';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { pathToFileURL } from 'node:url';
import sharp from 'sharp';
import { repo, hash } from '../labs/snapshots.mjs';
import { assetsDir, manifestFile, loadDefinitions, readManifest, snapshotDigest, withSnapshots, expectedImages } from './check-previews.mjs';

// 从参考快照真实运行页面并拍摄。依赖与浏览器都用 labs/inventory 的锁定版本；不改参考源码。
// 用法：node scripts/capture-previews.mjs [--only c15/layout,l3/goal]
const inventory = path.join(repo, 'labs/inventory');
const { createServer } = await import(pathToFileURL(path.join(inventory, 'node_modules/vite/dist/node/index.js')));
const { chromium, expect } = await import(pathToFileURL(path.join(inventory, 'node_modules/@playwright/test/index.mjs')));
const playwrightVersion = JSON.parse(readFileSync(path.join(inventory, 'node_modules/@playwright/test/package.json'), 'utf8')).version;
const PORTS = process.env.PREVIEW_PORT ? [Number(process.env.PREVIEW_PORT)] : [4341, 4342, 4343, 4344, 4345, 4346, 4347, 4348, 4349];
const TIMEOUT = 20000;
// 界面截图色块平整，无损 WebP 比有损更小，也不会在文字周围出现压缩噪点。
const WEBP = { lossless: true, effort: 6 };
// 完整版 Chromium（非 headless shell）才带中文界面资源，文件选择框等控件显示「选择文件」。
const LAUNCH = { channel: 'chromium', args: ['--lang=zh-CN'] };

const args = process.argv.slice(2);
const onlyIndex = args.indexOf('--only');
const only = onlyIndex >= 0 ? (args[onlyIndex + 1] ?? '').split(',').filter(Boolean) : null;
if (args.some((arg, i) => arg !== '--only' && i !== onlyIndex + 1) || (only && !only.length)) {
  console.error('用法：node scripts/capture-previews.mjs [--only c15/layout,l3/goal]');
  process.exit(1);
}
const all = loadDefinitions();
const unknown = (only ?? []).filter((id) => !all.some((shot) => shot.id === id));
if (unknown.length) throw new Error(`没有这些截图定义：${unknown.join('、')}`);
const shots = only ? all.filter((shot) => only.includes(shot.id)) : all;

function freePort() {
  return PORTS.reduce((found, port) => found.catch(() => new Promise((resolve, reject) => {
    const probe = createNetServer().once('error', reject).once('listening', () => probe.close(() => resolve(port)));
    probe.listen(port, '127.0.0.1');
  })), Promise.reject()).catch(() => { throw new Error(`端口 ${PORTS[0]}–${PORTS.at(-1)} 都被占用`); });
}

function locate(page, action) {
  const exact = { exact: true };
  let locator;
  if (action.role) locator = page.getByRole(action.role, { name: action.name, ...exact });
  else if (action.label) locator = page.getByLabel(action.label, exact);
  else if (action.placeholder) locator = page.getByPlaceholder(action.placeholder, exact);
  else if (action.selector) locator = page.locator(action.selector);
  if (locator && action.nth !== undefined) locator = locator.nth(action.nth);
  return locator;
}

async function perform(page, origin, action, viewport) {
  const target = locate(page, action);
  const options = { timeout: TIMEOUT };
  switch (action.do) {
    case 'goto': await page.goto(origin + action.path.replace(/^\//, ''), { waitUntil: 'load' }); break;
    case 'click': await target.click(options); break;
    case 'fill': await target.fill(action.value, options); break;
    case 'select': await target.selectOption(action.value, options); break;
    case 'check': await target.check(options); break;
    case 'focus': await target.focus(options); break;
    case 'press': await (target ?? page.keyboard).press(action.key, target ? options : undefined); break;
    case 'waitText': await expect(target).toContainText(action.text, options); break;
    case 'waitCount': await expect(target).toHaveCount(action.count, options); break;
    case 'assertColumns': {
      const expected = action.columns[String(viewport.width)];
      if (expected === undefined) break;
      await expect.poll(() => target.evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(' ').length), options).toBe(expected);
      break;
    }
    case 'assertNoOverflow': {
      const [scroll, width] = await page.evaluate(() => [document.documentElement.scrollWidth, innerWidth]);
      if (scroll > width) throw new Error(`${viewport.width}px 整页横向溢出：scrollWidth ${scroll}`);
      break;
    }
    case 'assertScrollWidth': {
      const expected = action.width[viewport.width];
      if (expected === undefined) break;
      const scroll = await page.evaluate(() => document.documentElement.scrollWidth);
      if (scroll !== expected) throw new Error(`${viewport.width}px 的 scrollWidth 是 ${scroll}，定义要求 ${expected}`);
      break;
    }
    case 'addStyle': await page.addStyleTag({ content: action.css }); break;
    case 'mouseAway': await page.mouse.move(0, 0); break;
    case 'scrollTop': await page.evaluate(() => window.scrollTo(0, 0)); break;
    default: throw new Error(`未知操作 ${action.do}`);
  }
}

async function shoot(browser, origin, shot, viewport, theme) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height }, deviceScaleFactor: viewport.scale ?? 1,
    colorScheme: theme, reducedMotion: 'reduce', locale: 'zh-CN', timezoneId: 'Asia/Shanghai',
  });
  const page = await context.newPage();
  const problems = [];
  page.on('pageerror', (error) => problems.push(`页面异常：${error.message}`));
  page.on('response', (response) => { if (response.status() >= 400) problems.push(`HTTP ${response.status()}：${response.url()}`); });
  try {
    await page.goto(origin + shot.path.replace(/^\//, ''), { waitUntil: 'load' });
    for (const action of shot.actions) await perform(page, origin, action, viewport);
    await page.mouse.move(0, 0);
    await page.evaluate(() => document.fonts.ready);
    if (problems.length) throw new Error(problems.join('\n'));
    const options = { type: 'png', animations: 'disabled', caret: 'hide', timeout: TIMEOUT };
    const png = shot.target ? await page.locator(shot.target).screenshot(options) : await page.screenshot({ ...options, fullPage: shot.fullPage ?? false });
    return await sharp(png).webp(WEBP).toBuffer();
  } catch (error) {
    throw new Error(`${shot.id} @${viewport.width}px ${theme}：${error.message}`);
  } finally { await context.close(); }
}

async function startServer(root, checkpoint) {
  const { viteConfig } = await import(pathToFileURL(path.join(root, 'tools/lab.mjs')));
  const config = await viteConfig(checkpoint);
  // 快照带本地后端时（C44 起）用临时数据、随机端口的后端，并把 /api 代理改指向它。
  let api = null;
  if (existsSync(path.join(root, 'server/app.mjs')) && config.server.proxy?.['/api']) {
    const { startApiFixture, proxyTo } = await import(pathToFileURL(path.join(root, 'tools/api-fixture.mjs')));
    api = await startApiFixture({ root });
    config.server.proxy = proxyTo(config.server.proxy, api.origin);
  }
  const port = await freePort();
  // node_modules 是指向 labs/inventory 的链接，UI5 字体按真实路径请求，需加入允许列表。
  const allow = [...(config.server.fs?.allow ?? []), path.join(inventory, 'node_modules')];
  config.server = { ...config.server, port, strictPort: true, hmr: false, fs: { ...config.server.fs, allow } };
  config.logLevel = 'error';
  const server = await createServer(config);
  await server.listen();
  return { server, api, origin: `http://127.0.0.1:${port}/` };
}

const manifest = readManifest();
const environment = { playwright: playwrightVersion, node: process.versions.node, platform: `${os.platform()}-${os.arch()}` };
const written = [];
await withSnapshots(shots.map((shot) => shot.checkpoint), async (roots) => {
  const browser = await chromium.launch(LAUNCH);
  environment.browser = `Chromium ${browser.version()}`;
  try {
    for (const checkpoint of Object.keys(roots)) {
      const root = roots[checkpoint];
      await symlink(path.join(inventory, 'node_modules'), path.join(root, 'node_modules'), 'dir');
      const { server, api, origin } = await startServer(root, checkpoint);
      try {
        // 预热：让 Vite 先完成依赖预构建，避免拍摄中途整页重载。
        const warm = await browser.newPage();
        await warm.goto(origin, { waitUntil: 'networkidle', timeout: 60000 });
        await warm.waitForTimeout(500);
        await warm.close();
        for (const shot of shots.filter((item) => item.checkpoint === checkpoint)) {
          const digest = await snapshotDigest(shot, root);
          const images = [];
          for (const { viewport, theme, file } of expectedImages(shot)) {
            await api?.reset();
            const data = await shoot(browser, origin, shot, viewport, theme);
            const { width, height } = await sharp(data).metadata();
            await mkdir(path.dirname(path.join(assetsDir, file)), { recursive: true });
            await writeFile(path.join(assetsDir, file), data);
            images.push({ file, width: viewport.width, theme, pixels: [width, height], bytes: data.length, sha256: hash(data) });
            written.push(`${file}  ${width}×${height}  ${(data.length / 1024).toFixed(1)} KB`);
          }
          const keep = new Set(images.map((image) => path.basename(image.file)));
          const pattern = new RegExp(`^${shot.name}-\\d+-(?:light|dark)\\.webp$`);
          for (const name of await readdir(path.join(assetsDir, shot.group))) {
            if (pattern.test(name) && !keep.has(name)) await rm(path.join(assetsDir, shot.group, name));
          }
          manifest.shots[shot.id] = { checkpoint, digest, capturedAt: new Date().toISOString().slice(0, 10), environment, images };
        }
      } finally { await server.close(); await api?.close(); }
    }
  } finally { await browser.close(); }
});
for (const id of Object.keys(manifest.shots)) if (!all.some((shot) => shot.id === id)) delete manifest.shots[id];
manifest.shots = Object.fromEntries(Object.entries(manifest.shots).sort(([a], [b]) => a.localeCompare(b, 'en')));
await writeFile(manifestFile, JSON.stringify(manifest, null, 2) + '\n');
console.log(written.join('\n'));
console.log(`已拍摄 ${shots.length} 个定义、${written.length} 张图片；清单：${path.relative(repo, manifestFile)}。`);
