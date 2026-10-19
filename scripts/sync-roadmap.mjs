import { readFileSync, writeFileSync, mkdirSync, globSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const docsRoot = path.join(root, 'src/content/docs');
const published = new Map();
for (const file of globSync('**/*.{md,mdx}', { cwd: docsRoot })) {
  const text = readFileSync(path.join(docsRoot, file), 'utf8');
  const match = text.match(/^title:\s*(C\d{2})\s+(.+)$/m);
  if (!match) continue;
  if (published.has(match[1])) throw new Error(`重复课号：${match[1]}`);
  published.set(match[1], file.replace(/\.(md|mdx)$/, '').replace(/\/index$/, ''));
}

const curriculum = readFileSync(path.join(root, 'docs/CURRICULUM.md'), 'utf8');
const lessons = [...curriculum.matchAll(/^\|\s*(\d+)\s*\|\s*(C\d{2})\s+([^|]+)\|/gm)];
if (lessons.length !== 48 || lessons.some((lesson, i) => lesson[2] !== `C${String(i + 1).padStart(2, '0')}`)) {
  throw new Error('课程大纲必须按 C01–C48 连续列出 48 课。');
}
for (const id of published.keys()) {
  if (!lessons.some((lesson) => lesson[2] === id)) throw new Error(`未列入大纲的课号：${id}`);
}

const weekNames = ['历史、语言、结构与浏览器', '现代 JS、运行时、工具与 React 起步', '详细 React 与组件工程', '开源组件、UI5 与项目交付'];
const output = [
  '---', 'title: 学习路线与课程目录',
  'description: 4 周 48 课主线与 8 周慢速路线，查看已发布课程和后续计划。',
  '---', '', '<!-- 由 scripts/sync-roadmap.mjs 从课程大纲与已有文章生成。 -->', '',
  `**已发布 ${published.size} / 48 课。** 有链接的课程可以阅读；「待发布」仅表示计划主题。`, '',
  '## 选择你的节奏', '',
  '- **4 周主线：** 每周 6 个学习日，每天按目录顺序学习 2 课，投入 3–4 小时；第 7 天休息或补课。',
  '- **8 周慢速与深化：** 每周 6 个学习日，每天按课号学习 1 课，用剩余时间练习、调试和复习。', '',
  '先读示例、亲手运行，再做预测与排错练习。每课包含 Java 对照和操作说明，库存管理项目贯穿全程。', '',
];
for (let week = 1; week <= 4; week++) {
  output.push(`## 第 ${week} 周：${weekNames[week - 1]}`, '', '| 主线学习日 | 课程 | 状态 |', '| --- | --- | --- |');
  for (const [, day, id, rawTitle] of lessons.slice((week - 1) * 12, week * 12)) {
    const title = `${id} ${rawTitle.trim()}`;
    const slug = published.get(id);
    output.push(`| 第 ${day} 天 | ${slug ? `[${title}](../${slug}/)` : title} | ${slug ? `已发布<span data-lesson-status="${id}" hidden></span>` : '待发布'} |`);
  }
  output.push('');
}
output.push('## 源码与练习', '', '课程的必要文件和验证记录保存在 [GitHub 的 examples 目录](https://github.com/socoo123/js_web/tree/main/examples)。按每课说明选择浏览器或本地环境，不需要为阅读课程安装站点构建工具。', '');
mkdirSync(path.join(docsRoot, 'roadmap'), { recursive: true });
writeFileSync(path.join(docsRoot, 'roadmap/index.md'), output.join('\n'));
console.log(`课程目录已同步：${published.size} / 48 课。`);
