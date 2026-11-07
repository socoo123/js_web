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

const escape = (text) => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
// Markdown 里的 HTML 块遇到空行就结束，所以时间线每一行都不能是空行，标题与说明仍写成 Markdown。
const html = (lines) => lines.filter((line) => line !== '').join('\n');

const connected = catalog.lessons.filter((row) => row.migrated && !row.trial).length;
const labGroups = catalog.labs.map((lab) => {
  const rows = catalog.lessons.filter((row) => row.labId === lab.labId);
  if (!rows.length) throw new Error(`${lab.labId} 缺少课程。`);
  return { lab, rows };
});
const output = [
  '---', 'title: 学习路线与课程目录',
  'description: 按 6 个 Lab 排列的 4 周 48 课与 8 周慢速路线，最后以 L6 毕业挑战收尾。',
  '---', '', '<!-- 由 scripts/sync-roadmap.mjs 从课程大纲、catalog 与已有文章生成。 -->', '',
  `**可阅读 ${published.size} / 48 课。** 第一次学习先到[库存工作区与 6 个 Lab](../labs/)准备工程，再从 L1 主页按课程标签跟做。`, '',
  '## 选择你的节奏', '',
  '<div class="pace-cards">', '',
  '- **4 周主线** 每周 6 个学习日，每天按目录顺序学习 2 课，投入 3–4 小时；第 7 天休息或补课。',
  '- **8 周慢速与深化** 每周 6 个学习日，每天按课号学习 1 课，用剩余时间练习、调试和复习。', '',
  '</div>', '',
  '下面按 Lab 排列；每个学习日注明 4 周主线的周次和 8 周路线对应的天数。每课先在 Lab 主页看本课任务，在自己的 inventory/ 修改，再对照输出、收集错误证据并检查。网站阅读标记与本地工作区检查分别管理。', '',
  connected === lessons.length
    ? '48 课均已接入连续工作区。阶段内接自己的上一课，固定起点只用于补课或恢复；旧 examples 保留为机制参考与验证记录。'
    : `当前 ${connected} / 48 课接入连续工作区。其余课程的工作区接入状态见下表；仍可阅读已有正文，试做起点会单独标明。`, '',
  '## 六个 Lab，一条连续主线', '',
  '| Lab | 课程 | 补课起点 | 阶段产出 |',
  '| --- | --- | --- | --- |',
];
for (const { lab, rows } of labGroups) {
  output.push(`| [${lab.labId} ${lab.title}](../labs/${lab.labId.toLowerCase()}/) | ${rows[0].lessonId}–${rows.at(-1).lessonId} | ${rows[0].startCheckpoint} | ${lab.description} |`);
}
output.push('| [L6 毕业挑战](../labs/l6/) | 学完 C48 后 | 自己的 C48 工程 | 能力自测、Bug 猎人与综合毕业项目 |');
output.push('', '起点是前一课的完成参考态，不是本 Lab 的答案。正常跟做沿用自己的目录；L4 保留 React 主应用，L5 回到 src/react 做交付。', '');

for (const { lab, rows } of labGroups) {
  const labLessons = lessons.filter(([, , id]) => rows.some((row) => row.lessonId === id));
  const days = [...new Set(labLessons.map(([, day]) => Number(day)))];
  const ids = labLessons.map(([, , id]) => id);
  const weeks = [...new Set(days.map((day) => Math.ceil(day / 6)))];
  const slowWeeks = [...new Set(ids.map((id) => Math.ceil(Number(id.slice(1)) / 6)))];
  const span = (list) => (list.length > 1 ? `${list[0]}–${list.at(-1)}` : `${list[0]}`);
  output.push(`## ${lab.labId} ${lab.title}`, '');
  output.push(html([
    '<p class="roadmap-week-meta not-content">',
    `<span>${ids[0]}–${ids.at(-1)} · 第 ${span(days)} 天 · ${ids.length} 课 · 4 周路线第 ${span(weeks)} 周 · 8 周路线第 ${span(slowWeeks)} 周</span>`,
    `<span data-done-count="${ids.filter((id) => published.has(id)).join(' ')}" hidden></span>`,
    '</p>',
  ]), '');
  const timeline = ['<ol class="roadmap-timeline not-content">'];
  timeline.push(`<li class="roadmap-milestone"><span class="roadmap-lab-chip">${lab.labId}</span><a href="../labs/${lab.labId.toLowerCase()}/">${escape(lab.title)} · Lab 主页</a><span>${escape(lab.description)} · 补课起点 ${rows[0].startCheckpoint}</span></li>`);
  for (const day of days) {
    const dayLessons = labLessons.filter(([, value]) => Number(value) === day);
    const slowDays = dayLessons.map(([, , id]) => Number(id.slice(1)));
    timeline.push(`<li class="roadmap-day"><p class="roadmap-day__label"><strong>第 ${day} 天</strong><span>第 ${Math.ceil(day / 6)} 周 · 8 周路线：第 ${slowDays.join('、')} 天</span></p><ul class="roadmap-lessons">`);
    for (const [, , id, rawTitle] of dayLessons) {
      const title = escape(rawTitle.trim());
      const slug = published.get(id);
      const row = catalog.lessons.find((item) => item.lessonId === id);
      const chip = row ? `<span class="roadmap-lab-chip">${row.labId}</span>` : '';
      const state = !slug ? '待发布' : row?.migrated ? (row.trial ? '已接工作区（前置试做）' : '') : '旧版可读';
      const label = `<span class="roadmap-lesson__id">${id}</span>${title}`;
      timeline.push(`<li class="roadmap-lesson">${slug ? `<a href="../${slug}/">${label}</a>` : `<span>${label}</span>`}<span class="roadmap-lesson__state">${chip}${state ? `<span>${state}</span>` : ''}${slug ? `<span data-lesson-status="${id}" hidden></span>` : ''}</span></li>`);
    }
    timeline.push('</ul></li>');
  }
  timeline.push('</ol>');
  output.push(html(timeline), '');
}
output.push('## L6 毕业挑战', '',
  '学完 C48 之后，用 [L6 毕业挑战](../labs/l6/)检验全部能力：能力自测按能力区给出薄弱项，Bug 猎人练定位与修复，毕业项目在自己的工作区里跨全部层次实作。答错或卡住的地方都链回对应课文。', '');
output.push('## 源码与练习', '',
  '必做任务、版本化学习包和恢复说明从 [Lab 入口](../labs/)进入。课程内写明当前目录、改动位置、启动和检查方式；在线阅读无需安装网站构建工具。', '',
  '[GitHub 的 examples 目录](https://github.com/socoo123/js_web/tree/main/examples)保留逐课机制参考、固定输出与验证记录；旧七阶段工程仅作参考，不作为日常切换目录。', '',
  '随时查阅：[ES 版本](../reference/es-versions/)、[Java ↔ JS](../reference/java-js/)、[React Hooks](../reference/react-hooks/)、[UI5 家族](../reference/ui5-family/)。', '');
mkdirSync(path.join(docsRoot, 'roadmap'), { recursive: true });
writeFileSync(path.join(docsRoot, 'roadmap/index.md'), output.join('\n'));
console.log(`课程目录已同步：${published.size} / 48 课。`);
