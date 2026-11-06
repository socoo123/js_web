import { existsSync, readFileSync, statSync, globSync, readdirSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { importedContent } from './lesson-sources.mjs';
import catalog from '../labs/catalog.json' with { type: 'json' };
import { repo, checkpointIds, verifyRelease } from '../labs/snapshots.mjs';

const dist = fileURLToPath(new URL('../dist/', import.meta.url));
const origin = 'https://socoo123.github.io';
const base = '/js_web/';
const errors = [];
// 只供并行开发的隔离副本使用；集成与发布构建不设置，缺截图或演示即失败。
const allowPending = process.env.JS_WEB_ALLOW_PENDING_ASSETS === '1';
const pages = globSync('**/*.html', { cwd: dist });
const docsRoot = fileURLToPath(new URL('../src/content/docs/', import.meta.url));
const references = globSync('reference/*.{md,mdx}', { cwd: docsRoot })
  .map((file) => file.replace(/\.(?:md|mdx)$/, ''));
const lessons = globSync('**/c[0-9][0-9]-*.{md,mdx}', { cwd: docsRoot }).sort().map((file) => {
  const source = readFileSync(path.join(docsRoot, file), 'utf8');
  const diagrams = [...source.matchAll(/assets\/diagrams\/([^\s)"']+)\.svg/g)].map((match) => match[1]);
  return [path.basename(file).slice(0, 3).toUpperCase(), file.replace(/\.(?:md|mdx)$/, ''), diagrams, source];
});
for (const required of ['index.html', 'roadmap/index.html', 'labs/index.html', 'pagefind/pagefind.js', ...references.map((slug) => `${slug}/index.html`), ...lessons.map(([, slug]) => `${slug}/index.html`)]) {
  if (!existsSync(path.join(dist, required))) errors.push(`缺少输出：${required}`);
}
for (const page of pages) {
  const html = readFileSync(path.join(dist, page), 'utf8');
  const pageUrl = new URL(base + page.replace(/index\.html$/, ''), origin);
  if (!html.includes('lang="zh-CN"')) errors.push(`页面未设为中文：${page}`);
  if (page !== 'index.html' && page !== '404.html' && !page.startsWith('demos/')) {
    const sidebar = html.match(/<nav\b[^>]*class="[^"]*\bsidebar\b[^"]*"[^>]*>([\s\S]*?)<\/nav>/)?.[1] ?? '';
    for (const slug of references) {
      if (!sidebar.includes(`href="${base}${slug}/"`)) errors.push(`${page} 的侧栏缺少速查入口：${slug}`);
    }
  }
  for (const tag of html.matchAll(/<(?:a|img|script|link)\b[^>]*>/g)) {
    // Starlight 的 404.html canonical 是 /404/，不是可导航的页面链接。
    if (page === '404.html' && /\brel="canonical"/.test(tag[0])) continue;
    for (const attr of tag[0].matchAll(/\b(?:href|src)="([^"]+)"/g)) {
      const value = attr[1].replaceAll('&amp;', '&');
      if (/^(#|data:|mailto:|tel:)/.test(value)) continue;
      const url = new URL(value, pageUrl);
      if (url.origin !== origin) continue;
      if (!url.pathname.startsWith(base)) {
        errors.push(`${page} 的链接缺少 ${base}：${value}`);
        continue;
      }
      const local = path.join(dist, decodeURIComponent(url.pathname.slice(base.length)));
      const target = existsSync(local) && statSync(local).isDirectory() ? path.join(local, 'index.html') : local;
      if (!existsSync(target) && !(allowPending && url.pathname.startsWith(`${base}demos/`))) errors.push(`${page} 的链接没有输出文件：${value}`);
    }
  }
  if (!allowPending && /data-missing-preview=/.test(html)) errors.push(`${page} 引用了不存在的效果截图`);
  // 代码外的 `--` 会被排版成 en dash，学员照抄的命令就坏了。
  for (const match of html.matchAll(/npm (?:run|ci|exec)[^<\n]{0,40}? – /g)) errors.push(`${page} 的命令被排版成破折号，放进反引号：${match[0]}`);
}
for (const [id, slug, diagrams, source] of lessons) {
  const lessonFile = path.join(dist, `${slug}/index.html`);
  if (!existsSync(lessonFile)) continue;
  const lesson = readFileSync(lessonFile, 'utf8');
  const row = catalog.lessons.find((row) => row.lessonId === id);
  if (row?.migrated) {
    const imported = importedContent(source);
    const cards = imported.components.filter((item) => item.component === 'CodeCompare');
    if (!lesson.includes(`data-lesson-task="${id}"`)) errors.push(`${id} 缺少静态任务卡`);
    for (const card of cards) if (!lesson.includes(`data-comparison="${card.id}"`)) errors.push(`${id} 缺少静态代码对照 ${card.id}`);
    if ((lesson.match(/class="[^\"]*\bcompare-side\b[^\"]*"/g) ?? []).length !== cards.length * 2) errors.push(`${id} 对照没有静态渲染两侧`);
  }
  if ((lesson.match(/data-progress\s/g) ?? []).length !== 1 || !lesson.includes(`data-lesson="${id}"`)) {
    errors.push(`${id} 缺少唯一的本课学习进度入口。`);
  }
  const answers = [...lesson.matchAll(/<details\b[^>]*>([\s\S]*?)<\/details>/g)]
    .filter((match) => /<summary>\s*(提示|参考答案)/.test(match[1]));
  const sourceAnswers = [...source.matchAll(/<summary>\s*(?:提示|参考答案)/g)].length;
  if (sourceAnswers < 2 || answers.length !== sourceAnswers || answers.some((match) => !/<(?:p|ol|ul|pre)\b/.test(match[1]))) {
    errors.push(`${id} 应保留源码中的 ${sourceAnswers} 个有正文的练习折叠区（至少 2 个）。`);
  }
  for (const diagram of diagrams) {
    if (!lesson.includes(diagram)) errors.push(`${id} 缺少 D2 教学图 ${diagram}。`);
  }
  checkInteractive(id, source, lesson);
}

// 先猜一猜、效果面板和可运行片段都必须先有不依赖 JavaScript 的静态结果。
function checkInteractive(id, source, lesson) {
  let components;
  try { components = importedContent(source).components; } catch (error) { errors.push(`${id} 课程组件无法解析：${error.message}`); return; }
  const used = (name) => components.filter((item) => item.component === name);
  const predicts = used('Predict').length;
  const answerBodies = [...lesson.matchAll(/<summary\b[^>]*>\s*<span\b[^>]*>揭晓答案<\/span>[\s\S]*?<div class="predict-answer-body\b[^"]*">([\s\S]*?)<\/details>/g)];
  if (count(lesson, /\bdata-predict[\s>]/g) !== predicts || answerBodies.length !== predicts || answerBodies.some((match) => !/<(?:p|ol|ul|pre|figure)\b/.test(match[1]))) {
    errors.push(`${id} 应静态渲染 ${predicts} 个带答案的「先猜一猜」`);
  }
  const effects = used('Effect');
  if (count(lesson, /\bdata-effect="(?:console|terminal|page|demo)"/g) !== effects.length) errors.push(`${id} 应静态渲染 ${effects.length} 个效果面板`);
  for (const effectId of new Set(effects.map((item) => item.id).filter(Boolean))) {
    const effect = effects.find((item) => item.id === effectId);
    const figures = [...lesson.matchAll(new RegExp(`<figure\\b[^>]*data-effect-id="${effectId}"[^>]*>([\\s\\S]*?)<figcaption\\b`, 'g'))].map((match) => match[1]);
    if (figures.length !== effects.filter((item) => item.id === effectId).length) errors.push(`${id} 的效果面板 ${effectId} 数量与源码不符`);
    for (const figure of figures) {
      if (effect.kind === 'page' && !/<img\b/.test(figure) && !(allowPending && figure.includes(`data-missing-preview="${effectId}"`))) errors.push(`${id} 的页面效果 ${effectId} 没有截图`);
      if (effect.kind === 'demo' && !new RegExp(`data-demo="${effectId}"[\\s\\S]*<astro-island\\b(?=[^>]*\\bclient="visible")(?=[^>]*\\bssr\\b)[^>]*>\\s*<div class="jsd\\b`).test(figure)) errors.push(`${id} 的交互演示 ${effectId} 缺少 client:visible 岛或服务端初始画面`);
      if ((effect.kind === 'console' || effect.kind === 'terminal') && !figure.includes(escapeHtml(effect.output.split('\n')[0]))) errors.push(`${id} 的输出面板 ${effectId} 缺少已验证输出`);
    }
  }
  const demos = new Set(effects.filter((item) => item.kind === 'demo').map((item) => item.id));
  if (demos.size > 2) errors.push(`${id} 使用了 ${demos.size} 个交互演示，每课最多 2 个`);
  for (const snippet of used('RunSnippet')) {
    const root = lesson.match(new RegExp(`<section\\b[^>]*data-run-snippet="${snippet.id}"[^>]*>([\\s\\S]*?)<p\\b[^>]*data-run-status`))?.[1];
    if (!root) errors.push(`${id} 缺少可运行片段 ${snippet.id}`);
    else if (!root.includes(`>${escapeHtml(snippet.output)}</code></pre>`) || !/<pre\b[^>]*data-language="js"/.test(root)) errors.push(`${id} 的可运行片段 ${snippet.id} 没有静态代码和已验证输出`);
  }
  if (/<iframe\b/.test(lesson)) errors.push(`${id} 的静态页面不应包含 iframe；沙箱只在点击运行时创建`);
}

function count(text, pattern) { return (text.match(pattern) ?? []).length; }
function escapeHtml(text) { return text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;'); }

// 只有含交互岛的页面才能加载 React；单页在全站共用脚本之外新增的 JS 不超过 80 KB（gzip）。
// demos/ 下是独立构建的 Lab 目标演示应用，由 build-demos 自行校验，不计入课程页预算。
const REACT_MARKERS = ['react.transitional.element', 'react.dev/errors'];
const JS_BUDGET = 80 * 1024;
const assets = new Map();
function asset(file) {
  if (!assets.has(file)) {
    const text = existsSync(file) ? readFileSync(file, 'utf8') : '';
    assets.set(file, { text, gzip: gzipSync(text).length, refs: [...text.matchAll(/\bimport\s*(?:[\w$*{},\s]+?from\s*)?["']([^"']+\.js)["']|\bimport\(\s*["']([^"']+\.js)["']\s*\)/g)].map((match) => path.resolve(path.dirname(file), match[1] ?? match[2])) });
  }
  return assets.get(file);
}
const scripts = new Map();
for (const page of pages.filter((page) => !page.startsWith('demos/'))) {
  const html = readFileSync(path.join(dist, page), 'utf8');
  const entries = [...html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"|\b(?:component|renderer|before-hydration)-url="([^"]+)"/g)]
    .map((match) => match[1] ?? match[2]).filter((url) => url.startsWith(base) && url.endsWith('.js'))
    .map((url) => path.join(dist, url.slice(base.length)));
  const inline = [...html.matchAll(/<script\b(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)].map((match) => match[1]).filter((text) => text.trim() && !text.trimStart().startsWith('{'));
  for (const text of inline) for (const match of text.matchAll(/\bimport\s*(?:[\w$*{},\s]+?from\s*)?["']([^"']+\.js)["']/g)) if (match[1].startsWith(base)) entries.push(path.join(dist, match[1].slice(base.length)));
  const files = new Set();
  const visit = (file) => { if (files.has(file)) return; files.add(file); asset(file).refs.forEach(visit); };
  entries.forEach(visit);
  scripts.set(page, { files, inline, island: /<astro-island\b/.test(html) });
}
const lessonPages = lessons.map(([, slug]) => `${slug}/index.html`).filter((page) => scripts.has(page));
const shared = lessonPages.length ? lessonPages.map((page) => scripts.get(page)).reduce((common, page) => ({
  files: new Set([...common.files].filter((file) => page.files.has(file))),
  inline: common.inline.filter((text) => page.inline.includes(text)),
})) : { files: new Set(), inline: [] };
const budgets = [];
for (const [page, { files, inline, island }] of scripts) {
  const react = [...files].filter((file) => REACT_MARKERS.some((marker) => asset(file).text.includes(marker)));
  if (!island && react.length) errors.push(`${page} 没有交互岛却加载了 React：${react.map((file) => path.relative(dist, file)).join('、')}`);
  if (island && !react.length) errors.push(`${page} 有交互岛但找不到 React 运行时`);
  const extra = [...files].filter((file) => !shared.files.has(file)).reduce((sum, file) => sum + asset(file).gzip, 0)
    + inline.filter((text) => !shared.inline.includes(text)).reduce((sum, text) => sum + gzipSync(text).length, 0);
  budgets.push([page, extra]);
  if (extra > JS_BUDGET) errors.push(`${page} 新增 JS ${kb(extra)}（gzip），超过 80 KB`);
}
function kb(bytes) { return `${(bytes / 1024).toFixed(1)} KB`; }
const islandPages = budgets.filter(([page]) => scripts.get(page).island).sort((a, b) => b[1] - a[1]);
for (const lab of catalog.labs) if (!existsSync(path.join(dist, `labs/${lab.labId.toLowerCase()}/index.html`))) errors.push(`缺少 Lab 页：${lab.labId}`);
const frozenRoot = path.join(repo, 'labs/releases');
const frozenReleases = readdirSync(frozenRoot, { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => entry.name);
let archives = 0;
for (const release of new Set([...frozenReleases, catalog.release])) {
  const directory = path.join(dist, 'downloads/inventory', release);
  try {
    const manifest = await verifyRelease(directory, release);
    archives += Object.keys(manifest.checkpoints).length * 2;
    if (release === catalog.release && JSON.stringify(Object.keys(manifest.checkpoints)) !== JSON.stringify(checkpointIds())) errors.push(`${release} 快照范围不符，必须覆盖全部已实现课程`);
    if (frozenReleases.includes(release) && !readFileSync(path.join(directory, 'manifest.json')).equals(readFileSync(path.join(frozenRoot, release, 'manifest.json')))) errors.push(`${release} 已冻结清单被改写`);
  } catch (error) { errors.push(`发行包检查失败：${release}：${error.message}`); }
}
const roadmap = readFileSync(path.join(dist, 'roadmap/index.html'), 'utf8');
if ((roadmap.match(/data-progress\s/g) ?? []).length !== 1 || lessons.some(([id]) => !roadmap.includes(`data-lesson-status="${id}"`))) {
  errors.push('学习路线缺少进度管理或课程状态入口。');
}
if (errors.length) throw new Error(errors.join('\n'));
console.log(`生产输出检查通过：${pages.length} 个 HTML 页面、中文语言、${base} 链接/资源、搜索入口、${references.length} 张速查导航与 ${lessons.length} 课折叠区/D2 图/交互组件静态结果；${new Set([...frozenReleases, catalog.release]).size} 版 ${archives} 个学习包/源码清单。`);
console.log(`页面 JS：${islandPages.length} 个页面含交互岛，其余页面不加载 React；单页新增 JS 最大 ${kb(Math.max(0, ...budgets.map(([, bytes]) => bytes)))}（gzip，上限 80 KB）${islandPages.map(([page, bytes]) => `；${page.replace(/\/index\.html$/, '')} ${kb(bytes)}`).join('')}。`);
