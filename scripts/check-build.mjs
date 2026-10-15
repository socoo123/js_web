import { existsSync, readFileSync, statSync, globSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const dist = fileURLToPath(new URL('../dist/', import.meta.url));
const origin = 'https://socoo123.github.io';
const base = '/js_web/';
const errors = [];
const pages = globSync('**/*.html', { cwd: dist });
for (const required of ['index.html', 'roadmap/index.html', '01-history-web/c01-story-ecosystem/index.html', 'pagefind/pagefind.js']) {
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
const lesson = readFileSync(path.join(dist, '01-history-web/c01-story-ecosystem/index.html'), 'utf8');
const answers = [...lesson.matchAll(/<details\b[^>]*>([\s\S]*?)<\/details>/g)]
  .filter((match) => /<summary>\s*(提示|参考答案)/.test(match[1]));
if (answers.length !== 5 || answers.some((match) => !match[1].includes('<p>'))) {
  errors.push('C01 应保留 5 个有正文的练习折叠区。');
}
if (!lesson.includes('c01-ecosystem')) errors.push('C01 缺少 D2 生态图。');
if (errors.length) throw new Error(errors.join('\n'));
console.log(`生产输出检查通过：${pages.length} 个 HTML 页面、中文语言、${base} 链接/资源、搜索入口与 C01 折叠区。`);
