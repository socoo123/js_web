import { globSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { importedContent, codeLimitIssues } from './lesson-sources.mjs';

const root = fileURLToPath(new URL('../src/content/docs/', import.meta.url));
const LEGACY = [];
const difficult = new Set(['c06', 'c07', 'c12', 'c13', 'c23', 'c29', 'c30', 'c35']);
const required = ['这一课解决什么问题', 'Java 程序员先看这里', '常见错误与调试', '练习', '小结', '延伸阅读'];
const forbidden = /操作方式：|验证状态：|作者环境|作者实际|作者执行|调试协议|临时替换|不宣称|不承诺|不能据此|推导成|写成已验证/g;
const files = globSync('**/c[0-9][0-9]-*.{md,mdx}', { cwd: root }).sort();
let errors = 0;
let warnings = 0;
for (const file of files) {
  const id = path.basename(file).slice(0, 3);
  if (LEGACY.includes(id)) continue;
  const hard = difficult.has(id);
  const limit = hard ? 10000 : 8000;
  const source = readFileSync(path.join(root, file), 'utf8').replace(/\r\n?/g, '\n');
  const body = source.replace(/^---\n[\s\S]*?\n---\n/, '');
  const blocks = [];
  let fence;
  let plain = '';
  for (const line of body.split('\n')) {
    const start = line.match(/^\s{0,3}(`{3,}|~{3,})(.*)$/);
    if (!fence && start) {
      fence = { marker: start[1][0], length: start[1].length, lines: [] };
      blocks.push(fence);
    } else if (fence && new RegExp(`^\\s{0,3}${fence.marker}{${fence.length},}\\s*$`).test(line)) {
      fence = undefined;
    } else if (fence) fence.lines.push(line);
    else plain += `${line}\n`;
  }
  const report = (message, warning = false) => {
    console[warning ? 'warn' : 'error'](`${warning ? 'warning' : 'error'} ${file}: ${message}`);
    if (warning) warnings++; else errors++;
  };
  try {
    const imported = importedContent(source, file.endsWith('.mdx'));
    for (const ref of imported.code) blocks.push({ lines: ref.code.split('\n') });
    plain += imported.prose;
  } catch (error) { report(`导入片段：${error.message}`); }
  if (fence) report('代码围栏未关闭');
  const prose = plain.replace(/<!--[\s\S]*?-->/g, '').replace(/<\/?[A-Za-z][^>\n]*>/g, '')
    .replace(/(!?\[[^\]]*\])\([^\n]*?\)/g, '$1').replace(/^\s*\[[^\]]+\]:\s*\S+.*$/gm, '');
  const count = [...prose.replace(/\s/g, '')].length;
  if (count > limit) report(`正文 ${count} 字符，超过 ${limit}`);
  for (const issue of codeLimitIssues(blocks, hard ? 20 : 16)) report(issue);
  const concepts = [...plain.matchAll(/^## \d+[.、]\s/gm)].length;
  if (concepts < (hard ? 4 : 3) || concepts > (hard ? 6 : 5)) report(`主体概念节 ${concepts} 个，应为 ${hard ? '4–6' : '3–5'} 个`);
  for (const match of plain.matchAll(forbidden)) report(`禁用词「${match[0]}」`);
  for (const match of plain.matchAll(/(?<![\w/.-])[SVEAHDJ]\d{2}(?!\w)/g)) report(`内部编号 ${match[0]}`);
  for (const match of plain.matchAll(/(?:Node|Chrome|Edge|npm)\s*\**\d+\.\d+\.\d+/g)) report(`正文含补丁版本 ${match[0]}`);
  for (const heading of required) {
    if (!new RegExp(`^## ${heading}\\s*$`, 'm').test(plain)) report(`缺少二级标题「${heading}」`);
  }
  if ([...plain.matchAll(/先猜一猜/g)].length < 2) report('「先猜一猜」不足 2 处');
  if (!/^:::tip\[自己尝试/m.test(plain)) report('缺少「自己尝试」提示框');
  const alerts = [...plain.matchAll(/^:::(?:caution|danger)\b/gm)].length;
  if (alerts > (hard ? 4 : 3)) report(`caution/danger 提示框 ${alerts} 个，超过上限`);
  if ([...plain.matchAll(/<details\b[^>]*>\s*<summary>\s*(?:提示|参考答案)/g)].length < 2) report('提示/参考答案折叠区不足 2 个');
  const reading = plain.match(/^## 延伸阅读\s*$/m);
  const before = reading ? plain.slice(0, reading.index) : plain;
  const after = reading ? plain.slice(reading.index).split(/\n## /)[0] : '';
  const standards = /https?:\/\/(?:[\w-]+\.)*(?:tc39\.es|ecma-international\.org)\b[^\s)>]*/g;
  if ([...before.matchAll(standards)].length) report('规范链接只能放在「延伸阅读」');
  if ([...after.matchAll(standards)].length > 2) report('「延伸阅读」规范链接超过 2 条');
  const previews = [...before.matchAll(/\bC(\d{2})\b|下一课/g)]
    .filter((match) => !match[1] || Number(match[1]) > Number(id.slice(1))).length;
  if (previews > 3) report(`后续课预告 ${previews} 处，建议不超过 3 处`, true);
  console.log(`${id.toUpperCase()}：正文 ${count}/${limit} 字符，代码块 ${blocks.length} 个`);
}
if (!files.length) { console.error('error 未发现课程'); errors++; }
console.log(`课程检查：${files.length} 课，${errors} error，${warnings} warning。`);
process.exitCode = errors ? 1 : 0;
