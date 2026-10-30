import { readFileSync, writeFileSync, mkdirSync, globSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import catalog from '../labs/catalog.json' with { type: 'json' };

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
const connected = catalog.lessons.filter((row) => row.migrated && !row.trial).length;
const output = [
  '---', 'title: 学习路线与课程目录',
  'description: 4 周 48 课与 8 周慢速路线，从五个 Lab 进入同一个库存工作区。',
  '---', '', '<!-- 由 scripts/sync-roadmap.mjs 从课程大纲、catalog 与已有文章生成。 -->', '',
  `**可阅读 ${published.size} / 48 课。** 第一次学习先到[库存工作区与 5 个 Lab](../labs/)准备工程，再按课号跟做。`, '',
  '## 选择你的节奏', '',
  '- **4 周主线：** 每周 6 个学习日，每天按目录顺序学习 2 课，投入 3–4 小时；第 7 天休息或补课。',
  '- **8 周慢速与深化：** 每周 6 个学习日，每天按课号学习 1 课，用剩余时间练习、调试和复习。', '',
  '每课先看任务卡，在自己的 inventory/ 修改，再对照输出、收集错误证据并检查。Lab 收尾包含在课程时间里；网站阅读标记与本地工作区检查分别管理。', '',
  connected === lessons.length
    ? '48 课均已接入连续工作区。阶段内接自己的上一课，固定起点只用于补课或恢复；旧 examples 保留为机制参考与验证记录。'
    : `当前 ${connected} / 48 课接入连续工作区。其余课程的工作区接入状态见下表；仍可阅读已有正文，试做起点会单独标明。`, '',
  '## 五个 Lab，一条连续主线', '',
  '| Lab | 课程 | 补课起点 | 阶段产出 |',
  '| --- | --- | --- | --- |',
];
for (const lab of catalog.labs) {
  const rows = catalog.lessons.filter((row) => row.labId === lab.labId);
  if (!rows.length) throw new Error(`${lab.labId} 缺少课程。`);
  output.push(`| [${lab.labId} ${lab.title}](../labs/${lab.labId.toLowerCase()}/) | ${rows[0].lessonId}–${rows.at(-1).lessonId} | ${rows[0].startCheckpoint} | ${lab.description} |`);
}
output.push('', '起点是前一课的完成参考态，不是本 Lab 的答案。正常跟做沿用自己的目录；L4 保留 React 主应用，L5 回到 src/react 做交付。', '');
for (let week = 1; week <= 4; week++) {
  output.push(`## 第 ${week} 周：${weekNames[week - 1]}`, '', '| 主线学习日 | 课程 | 状态 |', '| --- | --- | --- |');
  for (const [, day, id, rawTitle] of lessons.slice((week - 1) * 12, week * 12)) {
    const title = `${id} ${rawTitle.trim()}`;
    const slug = published.get(id);
    const row = catalog.lessons.find((row) => row.lessonId === id);
    const state = row?.migrated ? `已接工作区${row.trial ? '（前置试做）' : ''}` : '旧版可读';
    output.push(`| 第 ${day} 天 | ${slug ? `[${title}](../${slug}/)` : title} | ${slug ? `${state}<span data-lesson-status="${id}" hidden></span>` : '待发布'} |`);
  }
  output.push('');
}
output.push('## 源码与练习', '',
  '必做任务、版本化学习包和恢复说明从 [Lab 入口](../labs/)进入。课程内写明当前目录、改动位置、启动和检查方式；在线阅读无需安装网站构建工具。', '',
  '[GitHub 的 examples 目录](https://github.com/socoo123/js_web/tree/main/examples)保留逐课机制参考、固定输出与验证记录；旧七阶段工程仅作参考，不作为日常切换目录。', '',
  '随时查阅：[ES 版本](../reference/es-versions/)、[Java ↔ JS](../reference/java-js/)、[React Hooks](../reference/react-hooks/)、[UI5 家族](../reference/ui5-family/)。', '');
mkdirSync(path.join(docsRoot, 'roadmap'), { recursive: true });
writeFileSync(path.join(docsRoot, 'roadmap/index.md'), output.join('\n'));
console.log(`课程目录已同步：${published.size} / 48 课。`);
