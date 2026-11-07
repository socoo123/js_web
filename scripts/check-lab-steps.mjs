// 校验 labs/steps/l*.json：结构与编号、有步骤的 Lab 每课有步骤且都被「先读」引用、生成的 ids.mjs 同步，
// 以及构建产物里：「先读」锚点真实存在；Lab 页每课一个标签面板、步骤锚点、收尾清单与勾选框；课页 LabBar 指向本课标签。
// 截图是否存在由 check-build 的 data-missing-preview 规则负责。
// 用法：node scripts/check-lab-steps.mjs [--write] [--source] [--dist 目录]
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  LAB_FILE, finishAnchor, labProgressIds, lessonTabHref, lessonTabId, normalizeLab, readHref, stepAnchor, validateLab,
} from '../labs/steps/model.mjs';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const base = '/js_web/';

const escapeRe = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export function loadSteps(root = repo) {
  const dir = path.join(root, 'labs/steps');
  return readdirSync(dir).filter((file) => LAB_FILE.test(file)).sort().map((file) => ({
    file,
    data: JSON.parse(readFileSync(path.join(dir, file), 'utf8')),
  }));
}

export function idsModule(labs) {
  const active = Object.fromEntries(labs.map((lab) => [lab.labId, labProgressIds(lab).active]));
  const retired = labs.flatMap((lab) => labProgressIds(lab).retired);
  return [
    '// 由 `node scripts/check-lab-steps.mjs --write` 根据 labs/steps/l*.json 生成，请勿手改。',
    '// 学习进度只接受这里列出的 Lab 步骤与收尾项；已删除的 id 进 retired，旧记录才不会被判为损坏。',
    `export const LAB_STEP_IDS = ${JSON.stringify(active, null, 2)};`,
    `export const RETIRED_LAB_STEP_IDS = ${JSON.stringify(retired)};`,
    '',
  ].join('\n');
}

/** 锚点必须落在 h2–h4 标题上，或是紧贴在标题前的空 <a id>；返回 null 表示通过。 */
export function anchorIssue(html, anchor) {
  const id = escapeRe(anchor);
  if (new RegExp(`<h[2-4]\\b[^>]*\\bid="${id}"`).test(html)) return null;
  const compat = new RegExp(`<a id="${id}"></a>((?:\\s*<a id="[^"]*"></a>)*)\\s*<div class="sl-heading-wrapper`);
  if (compat.test(html)) return null;
  if (new RegExp(`\\bid="${id}"`).test(html)) return '存在但不在标题上，跳转后落点不对';
  return '不存在';
}

export function checkLabSteps({ root = repo, dist = path.join(root, 'dist'), source = false, write = false } = {}) {
  const catalog = JSON.parse(readFileSync(path.join(root, 'labs/catalog.json'), 'utf8'));
  const demos = JSON.parse(readFileSync(path.join(root, 'labs/demos.json'), 'utf8'));
  const errors = [];
  const labs = [];
  for (const { file, data } of loadSteps(root)) {
    const issues = validateLab(data, { catalog, demos: demos.demos ?? demos, file });
    if (issues.length) errors.push(...issues.map((issue) => `${file}：${issue}`));
    else labs.push(normalizeLab(data, { catalog, demos: demos.demos ?? demos }));
  }
  if (errors.length) return { errors, labs };

  const idsFile = path.join(root, 'labs/steps/ids.mjs');
  const expected = idsModule(labs);
  if (write) writeFileSync(idsFile, expected);
  else if (!existsSync(idsFile) || readFileSync(idsFile, 'utf8') !== expected) {
    errors.push('labs/steps/ids.mjs 与步骤数据不同步：运行 node scripts/check-lab-steps.mjs --write');
  }
  if (source) return { errors, labs };

  const pages = new Map();
  const page = (slug) => {
    if (!pages.has(slug)) {
      const file = path.join(dist, slug, 'index.html');
      pages.set(slug, existsSync(file) ? readFileSync(file, 'utf8') : null);
    }
    return pages.get(slug);
  };
  if (!existsSync(dist)) return { errors: [...errors, `没有构建产物 ${dist}：先运行构建，或加 --source 只查数据`], labs };
  for (const lab of labs) {
    for (const step of lab.steps) {
      for (const item of step.read) {
        const html = page(item.slug);
        if (html === null) { errors.push(`${step.stepId} 先读 ${item.lessonId}：缺少 ${item.slug}/index.html`); continue; }
        const issue = anchorIssue(html, item.anchor);
        if (issue) errors.push(`${step.stepId} 先读 ${item.lessonId}#${item.anchor}：锚点${issue}`);
      }
    }
    const labSlug = `labs/${lab.labId.toLowerCase()}`;
    const html = page(labSlug);
    if (html === null) { errors.push(`缺少 ${labSlug}/index.html`); continue; }
    for (const lessonId of lab.lessons) {
      const tab = lessonTabId(lessonId);
      if (!html.includes(`id="${tab}"`) || !html.includes(`data-lesson-panel="${lessonId}"`)) errors.push(`${labSlug} 缺少 ${lessonId} 的标签面板 #${tab}`);
      if (!html.includes(`href="#${tab}"`)) errors.push(`${labSlug} 缺少指向 #${tab} 的课程标签`);
    }
    for (const step of lab.steps) {
      if (!html.includes(`id="${stepAnchor(step.stepId)}"`)) errors.push(`${labSlug} 缺少步骤锚点 ${stepAnchor(step.stepId)}`);
      for (const item of step.read) {
        if (!html.includes(`href="${readHref(base, item, step.stepId)}"`)) errors.push(`${labSlug} 缺少 ${step.stepId} 的先读链接 ${item.lessonId}#${item.anchor}`);
      }
    }
    if (!html.includes(`id="${finishAnchor(lab.labId)}"`)) errors.push(`${labSlug} 缺少收尾清单锚点 ${finishAnchor(lab.labId)}`);
    for (const id of labProgressIds(lab).active) {
      if (!html.includes(`data-lab-step-toggle="${id}"`)) errors.push(`${labSlug} 缺少勾选项 ${id}`);
    }
    for (const lessonId of lab.lessons) {
      const row = catalog.lessons.find((item) => item.lessonId === lessonId);
      const lesson = page(row.slug);
      if (lesson === null) continue;
      const href = lessonTabHref(base, lab.labId, lessonId);
      const bar = lesson.match(new RegExp(`<nav\\b[^>]*data-lab-bar="${lessonId}"[^]*?</nav>`))?.[0] ?? '';
      if (!bar.includes(`href="${href}"`)) errors.push(`${lessonId} 的 LabBar 没有链接到本课标签 ${href}`);
    }
  }
  return { errors, labs };
}

export function summarize(labs) {
  return labs.map((lab) => {
    if (!lab.steps.length) return `${lab.labId}：尚无步骤数据，${lab.finish.length} 项收尾；Lab 页按 catalog 显示 ${lab.lessons.length} 个课程标签`;
    const perLesson = lab.lessons.map((id) => `${id}×${lab.steps.filter((step) => step.lessonId === id).length}`).join(' ');
    const reads = lab.steps.flatMap((step) => step.read.map((item) => ({ step, item })));
    const back = reads.filter(({ step, item }) => item.lessonId !== step.lessonId);
    const outside = back.filter(({ item }) => !lab.lessons.includes(item.lessonId));
    return `${lab.labId}：${lab.steps.length} 步、${lab.finish.length} 项收尾；先读 ${reads.length} 条，其中回看前课 ${back.length} 条（Lab 外 ${outside.length} 条）；每课 ${perLesson}`;
  }).join('\n');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const distIndex = args.indexOf('--dist');
  const options = {
    write: args.includes('--write'),
    source: args.includes('--source'),
    ...(distIndex >= 0 ? { dist: path.resolve(args[distIndex + 1]) } : {}),
  };
  const { errors, labs } = checkLabSteps(options);
  if (errors.length) {
    console.error(`Lab 步骤检查失败（${errors.length} 项）：\n${errors.join('\n')}`);
    process.exit(1);
  }
  console.log(`Lab 步骤检查通过${options.source ? '（只查数据）' : '（含构建产物锚点）'}${options.write ? '，已写入 labs/steps/ids.mjs' : ''}\n${summarize(labs)}`);
}
