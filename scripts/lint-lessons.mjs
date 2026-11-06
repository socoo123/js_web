import { globSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkMdx from 'remark-mdx';
import { importedContent, codeLimitIssues } from './lesson-sources.mjs';

const root = fileURLToPath(new URL('../src/content/docs/', import.meta.url));
const LEGACY = [];
const difficult = new Set(['c06', 'c07', 'c12', 'c13', 'c23', 'c29', 'c30', 'c35']);
const required = ['这一课解决什么问题', 'Java 程序员先看这里', '常见错误与调试', '练习', '小结', '延伸阅读'];
const forbidden = /操作方式：|验证状态：|作者环境|作者实际|作者执行|调试协议|临时替换|不宣称|不承诺|不能据此|推导成|写成已验证/g;

// V3 可读性阈值（CONTENT_GUIDE 第 16 节）。按 C03/C15/C23 试跑确定；改阈值时同步改第 16 节。
export const READABILITY = {
  paragraphChars: 130, // 一段的正文字符（不含空白、链接网址），PLAN 写「约 120 字」，留 10 字余量
  paragraphSentences: 3,
  inlineCode: 3,
  semicolons: 1, // 一段超过 1 个「；」就改成列表
  introSentences: 4,
  learnItems: 3,
  rememberSentences: 1,
  javaSentences: 2, // 一句相同点、一句失效点
};
const OLD_HEADER = /^> \*\*第 \d+ 周 · 第 \d+ 天\*\*/m;
const OUTPUT_LANGS = new Set(['text', 'txt', 'console', 'output']);
const EFFECTS = new Set(['Effect', 'RunSnippet', 'CodeCompare']);
const NEUTRAL = new Set(['LessonTask', 'LabOverview']);
const V3_COMPONENTS = new Set(['Predict', 'Effect', 'RunSnippet']);

function frontmatter(source) {
  const block = source.match(/^---\n([\s\S]*?)\n---\n/)?.[1] ?? '';
  const lesson = block.match(/^lesson:\s*\n((?:[ \t]+.*\n?)+)/m)?.[1];
  if (!lesson) return { lesson: null };
  const fields = Object.fromEntries([...lesson.matchAll(/^[ \t]+(\w+):\s*(.*?)\s*(?:#.*)?$/gm)].map((match) => [match[1], match[2]]));
  return { lesson: fields };
}

function textOf(node) {
  if (node.type === 'text' || node.type === 'inlineCode') return node.value;
  if (node.type === 'image' || node.type === 'html') return '';
  return (node.children ?? []).map(textOf).join('');
}
const countInline = (node) => (node.type === 'inlineCode' ? 1 : 0) + (node.children ?? []).reduce((sum, child) => sum + countInline(child), 0);
export function sentenceCount(text) {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  const ends = (trimmed.match(/[。！？]+/g) ?? []).length;
  return ends + (/[。！？]["」”）)]*$/.test(trimmed) ? 0 : 1);
}
const lead = (node) => node.children?.[0]?.type === 'strong' ? textOf(node.children[0]) : '';

// 按文档顺序把正文拆成：标题、说明、代码、效果；Predict 视为「代码 + 揭晓的效果」。
function flatten(tree, admonitionLines) {
  const items = [];
  let section = '';
  function prose(node, kind = 'prose') {
    let text = textOf(node);
    const line = node.position?.start.line ?? 0;
    const inAdmonition = admonitionLines.has(line);
    text = text.replace(/^:::[\w-]+(?:\[[^\]]*\])?\s*/, '').replace(/\s*:::\s*$/, '');
    items.push({ kind, section, line, text, inline: countInline(node), lead: lead(node), inAdmonition, node });
  }
  function visit(node, inPredict = false) {
    switch (node.type) {
      case 'heading':
        if (node.depth === 2) section = textOf(node).trim();
        items.push({ kind: 'heading', section, line: node.position.start.line, depth: node.depth });
        return;
      case 'paragraph':
        if (node.children.every((child) => child.type === 'image' || (child.type === 'text' && !child.value.trim()))) { items.push({ kind: 'figure', section, line: node.position.start.line }); return; }
        prose(node); return;
      case 'list':
        for (const item of node.children) {
          const paragraphs = item.children.filter((child) => child.type === 'paragraph');
          for (const paragraph of paragraphs) prose(paragraph, 'item');
          for (const child of item.children) if (child.type !== 'paragraph') visit(child, inPredict);
        }
        return;
      case 'table': items.push({ kind: 'table', section, line: node.position.start.line }); return;
      case 'code':
        if (inPredict) return;
        items.push({ kind: OUTPUT_LANGS.has(node.lang ?? '') ? 'effect' : 'code', section, line: node.position.start.line, name: node.lang ?? '' });
        return;
      case 'mdxJsxFlowElement': {
        const line = node.position.start.line;
        if (EFFECTS.has(node.name)) { items.push({ kind: 'effect', section, line, name: node.name }); return; }
        if (node.name === 'CodeExcerpt') { items.push({ kind: 'code', section, line, name: 'CodeExcerpt' }); return; }
        if (NEUTRAL.has(node.name)) { items.push({ kind: 'neutral', section, line, name: node.name }); return; }
        if (node.name === 'Predict') {
          items.push({ kind: 'code', section, line, name: 'Predict' });
          for (const child of node.children ?? []) visit(child, true);
          items.push({ kind: 'effect', section, line, name: 'Predict 答案' });
          return;
        }
        for (const child of node.children ?? []) visit(child, inPredict);
        return;
      }
      default:
        for (const child of node.children ?? []) visit(child, inPredict);
    }
  }
  visit(tree);
  return items;
}

export function readabilityIssues(source, limits = READABILITY) {
  const issues = [];
  const body = source.replace(/^---\n[\s\S]*?\n---\n/, (match) => '\n'.repeat(match.split('\n').length - 1));
  const lines = body.split('\n');
  const admonitionLines = new Set();
  for (let i = 0, open = false; i < lines.length; i++) {
    if (/^:::[\w-]/.test(lines[i])) open = true;
    if (open) admonitionLines.add(i + 1);
    if (/^:::\s*$/.test(lines[i])) open = false;
  }
  const tree = unified().use(remarkParse).use(remarkMdx).parse(body);
  const items = flatten(tree, admonitionLines);
  const at = (item) => `第 ${item.line} 行`;
  const concept = (section) => /^\d+[.、]\s/.test(section);
  for (const item of items.filter((entry) => entry.kind === 'prose' || entry.kind === 'item')) {
    if (item.section === '延伸阅读') continue;
    const chars = [...item.text.replace(/\s/g, '')].length;
    const sentences = sentenceCount(item.text);
    if (!item.inAdmonition && (chars > limits.paragraphChars || sentences > limits.paragraphSentences)) issues.push(`${at(item)} 段落过长：${chars} 字、${sentences} 句（上限约 ${limits.paragraphChars} 字、${limits.paragraphSentences} 句），拆段或删减`);
    if (item.inline > limits.inlineCode) issues.push(`${at(item)} 行内代码过密：${item.inline} 处（上限 ${limits.inlineCode}），把路径、命令放进代码块或任务卡`);
    if ((item.text.match(/；/g) ?? []).length > limits.semicolons) issues.push(`${at(item)} 一段里有多个分号，改成列表`);
    if (item.lead === '记住：' && sentences > limits.rememberSentences) issues.push(`${at(item)} 「记住」只写一句`);
    if (item.lead === 'Java 对照：' && sentences > limits.javaSentences) issues.push(`${at(item)} 「Java 对照」最多 ${limits.javaSentences} 句`);
  }
  const units = items.filter((item) => item.kind !== 'heading' && item.kind !== 'neutral');
  units.forEach((item, i) => {
    if (item.kind !== 'code') return;
    const next = units[i + 1];
    if (next?.kind === 'code' && next.section === item.section) issues.push(`${at(item)} 两个代码块之间既没有效果也没有解释`);
    if (!concept(item.section)) return;
    const rest = units.slice(i + 1);
    const stop = rest.findIndex((entry) => entry.kind === 'code' || entry.section !== item.section);
    if (!(stop < 0 ? rest : rest.slice(0, stop)).some((entry) => entry.kind === 'effect')) issues.push(`${at(item)} 代码块后没有效果（Effect、RunSnippet 或输出块）`);
  });
  const sections = [...new Set(items.filter((item) => item.kind === 'heading' && item.depth === 2).map((item) => item.section))];
  for (const section of sections.filter(concept)) {
    if (!items.some((item) => item.section === section && item.kind === 'effect')) issues.push(`概念节「${section}」没有任何效果`);
  }
  const intro = items.filter((item) => item.section === '这一课解决什么问题');
  if (intro.length) {
    const sentences = intro.filter((item) => item.kind === 'prose' && !/学完你能/.test(item.text)).reduce((sum, item) => sum + sentenceCount(item.text), 0);
    if (sentences > limits.introSentences) issues.push(`「这一课解决什么问题」${sentences} 句，上限 ${limits.introSentences}`);
    if (!intro.some((item) => item.kind === 'effect' && item.name === 'Effect')) issues.push('「这一课解决什么问题」缺少「完成后的效果」（Effect）');
    const index = intro.findIndex((item) => item.kind === 'prose' && /学完你能/.test(item.text));
    const learn = index < 0 ? [] : intro.slice(index + 1).filter((item, i, rest) => item.kind === 'item' && rest.slice(0, i).every((entry) => entry.kind === 'item'));
    if (learn.length !== limits.learnItems) issues.push(`「学完你能」应为 ${limits.learnItems} 条，现在 ${learn.length} 条`);
  }
  if (!items.some((item) => item.lead === 'Java 对照：')) issues.push('概念节没有任何「**Java 对照：**」段落');
  return issues;
}

function lintLesson(file, { previewV3 = false } = {}) {
  const errors = [];
  const warnings = [];
  const id = path.basename(file).slice(0, 3);
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
  const report = (message, warning = false) => (warning ? warnings : errors).push(message);
  let imported = { components: [] };
  try {
    imported = importedContent(source, file.endsWith('.mdx'));
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

  // V3：frontmatter 有 lesson 的课启用页首与可读性规则；其他课本阶段不检查（--preview-v3 可试跑）。
  const { lesson } = frontmatter(source);
  const usesV3 = imported.components.some((item) => V3_COMPONENTS.has(item.component));
  if (lesson) {
    for (const key of ['time', 'prereq', 'env', 'verified']) if (!lesson[key]) report(`frontmatter lesson 缺少 ${key}`);
    if (lesson.verified && !['all', 'partial'].includes(lesson.verified)) report('frontmatter lesson.verified 只能是 all 或 partial');
    if (OLD_HEADER.test(body)) report('已有 frontmatter lesson，仍保留旧页首引用块', true);
  } else if (usesV3) report('使用了 V3 组件，但缺少 frontmatter lesson', true);
  const v3 = Boolean(lesson);
  if (v3 || previewV3) for (const issue of readabilityIssues(source)) report(issue, true);
  return { id, count, limit, blocks: blocks.length, errors, warnings, v3 };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const previewV3 = process.argv.includes('--preview-v3');
  const files = globSync('**/c[0-9][0-9]-*.{md,mdx}', { cwd: root }).sort();
  let errors = 0;
  let warnings = 0;
  for (const file of files) {
    if (LEGACY.includes(path.basename(file).slice(0, 3))) continue;
    const result = lintLesson(file, { previewV3 });
    for (const message of result.errors) console.error(`error ${file}: ${message}`);
    for (const message of result.warnings) console.warn(`warning ${file}: ${message}`);
    errors += result.errors.length; warnings += result.warnings.length;
    console.log(`${result.id.toUpperCase()}：正文 ${result.count}/${result.limit} 字符，代码块 ${result.blocks} 个${result.v3 ? '，V3 可读性规则已启用' : ''}${result.warnings.length ? `，${result.warnings.length} warning` : ''}`);
  }
  if (!files.length) { console.error('error 未发现课程'); errors++; }
  console.log(`课程检查：${files.length} 课，${errors} error，${warnings} warning。`);
  process.exitCode = errors ? 1 : 0;
}
