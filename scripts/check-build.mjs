import { existsSync, readFileSync, statSync, globSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const dist = fileURLToPath(new URL('../dist/', import.meta.url));
const origin = 'https://socoo123.github.io';
const base = '/js_web/';
const errors = [];
const pages = globSync('**/*.html', { cwd: dist });
const docsRoot = fileURLToPath(new URL('../src/content/docs/', import.meta.url));
const lessons = globSync('**/c[0-9][0-9]-*.{md,mdx}', { cwd: docsRoot }).sort().map((file) => {
  const source = readFileSync(path.join(docsRoot, file), 'utf8');
  const diagrams = [...source.matchAll(/assets\/diagrams\/([^\s)"']+)\.svg/g)].map((match) => match[1]);
  return [path.basename(file).slice(0, 3).toUpperCase(), file.replace(/\.(?:md|mdx)$/, ''), diagrams, source];
});
for (const required of ['index.html', 'roadmap/index.html', 'pagefind/pagefind.js', ...lessons.map(([, slug]) => `${slug}/index.html`)]) {
  if (!existsSync(path.join(dist, required))) errors.push(`缺少输出：${required}`);
}
for (const page of pages) {
  const html = readFileSync(path.join(dist, page), 'utf8');
  const pageUrl = new URL(base + page.replace(/index\.html$/, ''), origin);
  if (!html.includes('lang="zh-CN"')) errors.push(`页面未设为中文：${page}`);
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
const roadmap = readFileSync(path.join(dist, 'roadmap/index.html'), 'utf8');
if ((roadmap.match(/data-progress\s/g) ?? []).length !== 1 || lessons.some(([id]) => !roadmap.includes(`data-lesson-status="${id}"`))) {
  errors.push('学习路线缺少进度管理或课程状态入口。');
}
if (errors.length) throw new Error(errors.join('\n'));
console.log(`生产输出检查通过：${pages.length} 个 HTML 页面、中文语言、${base} 链接/资源、搜索入口与 ${lessons.length} 课折叠区/D2 图。`);
