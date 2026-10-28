import { existsSync, readFileSync, statSync, globSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { importedContent } from './lesson-sources.mjs';
import catalog from '../labs/catalog.json' with { type: 'json' };
import { createHash } from 'node:crypto';
import { gunzipSync } from 'node:zlib';

const dist = fileURLToPath(new URL('../dist/', import.meta.url));
const origin = 'https://socoo123.github.io';
const base = '/js_web/';
const errors = [];
const pages = globSync('**/*.html', { cwd: dist });
const docsRoot = fileURLToPath(new URL('../src/content/docs/', import.meta.url));
const references = globSync('reference/*.{md,mdx}', { cwd: docsRoot })
  .map((file) => file.replace(/\.(?:md|mdx)$/, ''));
const lessons = globSync('**/c[0-9][0-9]-*.{md,mdx}', { cwd: docsRoot }).sort().map((file) => {
  const source = readFileSync(path.join(docsRoot, file), 'utf8');
  const diagrams = [...source.matchAll(/assets\/diagrams\/([^\s)"']+)\.svg/g)].map((match) => match[1]);
  return [path.basename(file).slice(0, 3).toUpperCase(), file.replace(/\.(?:md|mdx)$/, ''), diagrams, source];
});
for (const required of ['index.html', 'roadmap/index.html', 'pagefind/pagefind.js', ...references.map((slug) => `${slug}/index.html`), ...lessons.map(([, slug]) => `${slug}/index.html`)]) {
  if (!existsSync(path.join(dist, required))) errors.push(`缺少输出：${required}`);
}
for (const page of pages) {
  const html = readFileSync(path.join(dist, page), 'utf8');
  const pageUrl = new URL(base + page.replace(/index\.html$/, ''), origin);
  if (!html.includes('lang="zh-CN"')) errors.push(`页面未设为中文：${page}`);
  if (page !== 'index.html' && page !== '404.html') {
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
      if (!existsSync(target)) errors.push(`${page} 的链接没有输出文件：${value}`);
    }
  }
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
}
for (const lab of catalog.labs) if (!existsSync(path.join(dist, `labs/${lab.labId.toLowerCase()}/index.html`))) errors.push(`缺少 Lab 页：${lab.labId}`);
const releaseManifest = path.join(dist, `downloads/inventory/${catalog.release}/manifest.json`);
if (!existsSync(releaseManifest)) errors.push('缺少版本化快照清单');
else {
  const manifest = JSON.parse(readFileSync(releaseManifest, 'utf8'));
  const hash = (data) => createHash('sha256').update(data).digest('hex');
  for (const [id, entry] of Object.entries(manifest.checkpoints)) {
    const dir = path.dirname(releaseManifest);
    for (const [suffix, expected] of [['json.gz', entry.sha256], ['tar.gz', entry.archiveSha256]]) {
      const file = path.join(dir, `${id}.${suffix}`);
      if (!existsSync(file) || hash(readFileSync(file)) !== expected) errors.push(`快照缺失或校验失败：${id}.${suffix}`);
    }
    const bundle = JSON.parse(gunzipSync(readFileSync(path.join(dir, `${id}.json.gz`))).toString());
    for (const [file, digest] of Object.entries(entry.files)) if (hash(bundle.files[file] ?? '') !== digest) errors.push(`快照源码校验失败：${id}/${file}`);
  }
}
const roadmap = readFileSync(path.join(dist, 'roadmap/index.html'), 'utf8');
if ((roadmap.match(/data-progress\s/g) ?? []).length !== 1 || lessons.some(([id]) => !roadmap.includes(`data-lesson-status="${id}"`))) {
  errors.push('学习路线缺少进度管理或课程状态入口。');
}
if (errors.length) throw new Error(errors.join('\n'));
console.log(`生产输出检查通过：${pages.length} 个 HTML 页面、中文语言、${base} 链接/资源、搜索入口、${references.length} 张速查导航与 ${lessons.length} 课折叠区/D2 图。`);
