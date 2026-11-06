import { existsSync, globSync, readFileSync } from 'node:fs';
import { mkdtemp, readFile, rm, stat } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { repo, materialize, filesIn, hash } from '../labs/snapshots.mjs';

// 截图定义、源码校验值与新鲜度检查。capture-previews.mjs 复用这里的读取与校验值。
export const definitionsDir = path.join(repo, 'labs/previews');
export const assetsDir = path.join(repo, 'src/assets/previews');
export const manifestFile = path.join(assetsDir, 'manifest.json');
export const GROUPS = ['c03', 'c15', 'c23', 'l1', 'l2', 'l3', 'l4', 'l5'];
const WIDTHS = [360, 768, 1280];
const THEMES = ['light', 'dark'];
const LOCATORS = ['role', 'label', 'placeholder', 'selector'];
const ACTIONS = {
  goto: ['path'],
  click: [], fill: ['value'], select: ['value'], check: [], focus: [], press: ['key'],
  waitText: ['text'], waitCount: ['count'], assertColumns: ['columns'], assertNoOverflow: [], assertScrollWidth: ['width'],
  addStyle: ['css'], mouseAway: [], scrollTop: [],
};
const PAGE_ACTIONS = ['goto', 'assertNoOverflow', 'assertScrollWidth', 'addStyle', 'mouseAway', 'scrollTop'];
// 只有影响像素的字段进入校验值；alt/caption 由 src/lib/previews.mjs 直接读定义，改说明不必重拍。
const PIXEL_FIELDS = ['checkpoint', 'entry', 'path', 'sources', 'actions', 'viewports', 'themes', 'target', 'fullPage'];

function fail(file, message) { throw new Error(`${path.relative(repo, file)}：${message}`); }

function validateAction(file, id, action, i) {
  const where = `${id} 第 ${i + 1} 个操作`;
  if (!action || typeof action !== 'object' || !ACTIONS[action.do]) fail(file, `${where} 的 do 必须是 ${Object.keys(ACTIONS).join('/')}`);
  for (const key of ACTIONS[action.do]) if (action[key] === undefined) fail(file, `${where}（${action.do}）缺少 ${key}`);
  const locators = LOCATORS.filter((key) => action[key] !== undefined);
  const wrongLocator = PAGE_ACTIONS.includes(action.do) ? locators.length > 0
    : action.do === 'press' ? locators.length > 1 : locators.length !== 1;
  if (wrongLocator) fail(file, `${where} 的定位方式（${LOCATORS.join('/')}）数量不对：页面级操作不写，元素操作写且只写一个`);
  if (action.role && typeof action.name !== 'string') fail(file, `${where} 按 role 定位时需要 name`);
  if (action.do === 'assertColumns' && (typeof action.columns !== 'object' || !Object.keys(action.columns).length)) fail(file, `${where} 的 columns 写成 {"360":1}`);
  if (action.do === 'assertScrollWidth' && (typeof action.width !== 'object' || !Object.keys(action.width).length)) fail(file, `${where} 的 width 写成 {"360":616}`);
  if (action.do === 'addStyle' && (typeof action.css !== 'string' || !action.css.trim())) fail(file, `${where} 的 css 必须是非空字符串`);
  const allowed = new Set(['do', ...LOCATORS, 'name', 'nth', ...ACTIONS[action.do]]);
  for (const key of Object.keys(action)) if (!allowed.has(key)) fail(file, `${where} 不支持字段 ${key}`);
}

export function loadDefinitions() {
  const shots = [];
  const files = globSync('*.json', { cwd: definitionsDir }).sort();
  for (const name of files) {
    const file = path.join(definitionsDir, name);
    const group = name.replace(/\.json$/, '');
    if (!GROUPS.includes(group)) fail(file, `组名必须是 ${GROUPS.join('/')}`);
    const data = JSON.parse(readFileSync(file, 'utf8'));
    if (data.group !== group || !Array.isArray(data.shots) || !data.shots.length) fail(file, 'group 与文件名一致，shots 为非空数组');
    for (const shot of data.shots) {
      const id = `${group}/${shot.name}`;
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(shot.name ?? '')) fail(file, `截图名无效：${shot.name}`);
      if (shots.some((item) => item.id === id)) fail(file, `截图 id 重复：${id}`);
      if (!/^C\d{2}$/.test(shot.checkpoint ?? '')) fail(file, `${id} 的 checkpoint 必须是 Cnn 参考快照`);
      if (typeof shot.entry !== 'string' || typeof shot.path !== 'string' || !shot.path.startsWith('/')) fail(file, `${id} 需要 entry 与以 / 开头的 path`);
      if (!Array.isArray(shot.sources) || !shot.sources.length) fail(file, `${id} 需要 sources（影响页面的快照路径）`);
      if (!Array.isArray(shot.viewports) || !shot.viewports.length) fail(file, `${id} 需要 viewports`);
      for (const viewport of shot.viewports) {
        if (!WIDTHS.includes(viewport.width) || !Number.isInteger(viewport.height) || viewport.height < 240 || viewport.height > 2400 || ![undefined, 1, 2].includes(viewport.scale)) fail(file, `${id} 视口须为 ${WIDTHS.join('/')} 宽、240–2400 高、scale 1 或 2`);
      }
      if (new Set(shot.viewports.map((viewport) => viewport.width)).size !== shot.viewports.length) fail(file, `${id} 的视口宽度重复`);
      if (!Array.isArray(shot.themes) || !shot.themes.length || shot.themes.some((theme) => !THEMES.includes(theme))) fail(file, `${id} 的 themes 只能取 ${THEMES.join('/')}`);
      if (typeof shot.alt !== 'string' || shot.alt.trim().length < 8) fail(file, `${id} 需要描述画面内容的 alt`);
      if (shot.caption !== undefined && (typeof shot.caption !== 'string' || !shot.caption.trim())) fail(file, `${id} 的 caption 必须是非空字符串`);
      if (shot.target !== undefined && typeof shot.target !== 'string') fail(file, `${id} 的 target 是元素选择器`);
      if (shot.fullPage !== undefined && typeof shot.fullPage !== 'boolean') fail(file, `${id} 的 fullPage 是布尔值`);
      if (!Array.isArray(shot.actions)) fail(file, `${id} 需要 actions 数组（可为空）`);
      shot.actions.forEach((action, i) => validateAction(file, id, action, i));
      const known = new Set(['name', 'alt', 'caption', ...PIXEL_FIELDS]);
      for (const key of Object.keys(shot)) if (!known.has(key)) fail(file, `${id} 不支持字段 ${key}`);
      shots.push({ ...shot, id, group, file: path.relative(repo, file) });
    }
  }
  return shots;
}

export const imageName = (shot, viewport, theme) => `${shot.group}/${shot.name}-${viewport.width}-${theme}.webp`;
export const expectedImages = (shot) => shot.viewports.flatMap((viewport) => shot.themes.map((theme) => ({ viewport, theme, file: imageName(shot, viewport, theme) })));

// 校验值 = 定义中影响像素的字段 + 快照里 sources 列出的源码逐文件 SHA-256。
export async function snapshotDigest(shot, root) {
  const files = [];
  for (const source of shot.sources) {
    const absolute = path.join(root, source);
    if (!existsSync(absolute)) throw new Error(`${shot.id}：快照 ${shot.checkpoint} 没有 ${source}`);
    const names = (await stat(absolute)).isDirectory() ? (await filesIn(absolute)).map((name) => `${source}/${name}`) : [source];
    for (const name of names) files.push([name, hash(await readFile(path.join(root, name)))]);
  }
  if (!existsSync(path.join(root, shot.entry, 'index.html'))) throw new Error(`${shot.id}：快照 ${shot.checkpoint} 没有入口 ${shot.entry}/index.html`);
  const definition = Object.fromEntries(PIXEL_FIELDS.filter((key) => shot[key] !== undefined).map((key) => [key, shot[key]]));
  return hash(JSON.stringify({ definition, files: files.sort(([a], [b]) => a.localeCompare(b, 'en')) }));
}

export async function withSnapshots(checkpoints, callback) {
  const parent = await mkdtemp(path.join(os.tmpdir(), 'js-web-previews-'));
  try {
    const roots = {};
    for (const id of [...new Set(checkpoints)].sort()) {
      roots[id] = path.join(parent, id);
      await materialize(id, roots[id]);
    }
    return await callback(roots, parent);
  } finally { await rm(parent, { recursive: true, force: true }); }
}

export function readManifest() {
  if (!existsSync(manifestFile)) return { version: 1, shots: {} };
  const manifest = JSON.parse(readFileSync(manifestFile, 'utf8'));
  if (manifest.version !== 1 || typeof manifest.shots !== 'object') throw new Error('src/assets/previews/manifest.json 格式无效');
  return manifest;
}

export async function checkPreviews() {
  const shots = loadDefinitions();
  const manifest = readManifest();
  const errors = [];
  const capture = (ids) => `node scripts/capture-previews.mjs --only ${ids}`;
  const digests = await withSnapshots(shots.map((shot) => shot.checkpoint), async (roots) => {
    const result = {};
    for (const shot of shots) result[shot.id] = await snapshotDigest(shot, roots[shot.checkpoint]);
    return result;
  });
  const referenced = new Set();
  for (const shot of shots) {
    const entry = manifest.shots[shot.id];
    if (!entry) { errors.push(`缺少截图：${shot.id}（${shot.file}）。运行 ${capture(shot.id)}`); continue; }
    if (entry.digest !== digests[shot.id]) errors.push(`截图过期：${shot.id} 的快照源码或定义已变，截图没有重拍。运行 ${capture(shot.id)}`);
    const expected = expectedImages(shot);
    const listed = (entry.images ?? []).map((image) => image.file).sort();
    if (JSON.stringify(listed) !== JSON.stringify(expected.map((image) => image.file).sort())) errors.push(`截图清单不符：${shot.id} 应为 ${expected.map((image) => image.file).join('、')}`);
    for (const image of entry.images ?? []) {
      referenced.add(image.file);
      const file = path.join(assetsDir, image.file);
      if (!existsSync(file)) errors.push(`缺少图片文件：src/assets/previews/${image.file}`);
      else if (hash(readFileSync(file)) !== image.sha256) errors.push(`图片与清单不一致（被手工替换或编辑）：src/assets/previews/${image.file}`);
    }
  }
  for (const id of Object.keys(manifest.shots)) if (!shots.some((shot) => shot.id === id)) errors.push(`清单里有已删除的定义：${id}。重拍任意截图会清理它，或从 manifest 删除`);
  for (const file of globSync('**/*.{webp,png,jpg,jpeg}', { cwd: assetsDir })) {
    if (!referenced.has(file)) errors.push(`无主图片：src/assets/previews/${file}（没有对应的定义与清单条目）`);
  }
  return { shots, manifest, errors };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { shots, manifest, errors } = await checkPreviews();
  if (errors.length) {
    console.error(errors.map((line) => `error ${line}`).join('\n'));
    console.error(`截图检查：${errors.length} error。拍摄需要本机 Chromium 与中文字体，不在 CI 中运行；重拍后提交 webp 与 manifest。`);
    process.exitCode = 1;
  } else {
    const images = Object.values(manifest.shots).reduce((sum, entry) => sum + entry.images.length, 0);
    console.log(`截图检查通过：${shots.length} 个定义、${images} 张图片，源码校验值全部一致。`);
  }
}
