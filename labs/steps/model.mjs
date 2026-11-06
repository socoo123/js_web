// Lab 步骤数据的校验、规范化与链接规则。Astro 组件与 scripts/check-lab-steps.mjs 共用，不读文件系统。
export const LAB_FILE = /^l([1-5])\.json$/;
export const STEP_ID = /^l([1-5])-c(\d{2})-([1-9])$/;
export const FINISH_ID = /^l([1-5])-finish-([1-9]\d?)$/;
export const SHOT_ID = /^(?:c\d{2}|l[1-5])\/[a-z0-9]+(?:-[a-z0-9]+)*$/;
const INTERNAL_ID = /(?<![\w/.-])[SVEAHDJ]\d{2}(?!\w)/;
const PATCH_VERSION = /(?<![\w.])\d+\.\d+\.\d+(?![\w.])/;
const LINK = /\[([^\]]+)\]\(([^)\s]+)\)/g;
/**
 * @typedef {{ lessonId: string, anchor: string, why: string }} ReadItem
 * @typedef {{ output?: string, shot?: string, caption?: string }} Preview
 * @typedef {{ summary: string, outcomes: string[], shot?: string, demo?: string }} Goal
 * @typedef {{ id: string, text: string }} FinishItem
 * @typedef {{
 *   stepId: string, lessonId: string, title: string, goal: string, read: ReadItem[], files?: string[],
 *   actions: string[], preview: Preview, acceptance: string[], check?: string | string[], hint?: string, answer?: string,
 * }} StepData
 * @typedef {{ labId: string, goal: Goal, steps: StepData[], finish: { items: FinishItem[] }, retired?: string[] }} LabData
 * @typedef {Omit<StepData, 'read' | 'files' | 'check'> & {
 *   number: number, files: string[], check: string[], defaultCheck: boolean,
 *   lessonStep: number, lessonSteps: number, lastOfLesson: boolean,
 *   lesson: { lessonId: string, title: string, slug: string },
 *   read: (ReadItem & { slug: string, title: string })[],
 * }} Step
 * @typedef {{ labId: string, title: string, lessons: string[], goal: Goal, steps: Step[], finish: FinishItem[], retired: string[] }} Lab
 * @typedef {{ catalog: any, demos?: { id: string }[], file?: string }} Context
 */
const TOP_KEYS = ['labId', 'goal', 'steps', 'finish', 'retired'];
const GOAL_KEYS = ['summary', 'outcomes', 'shot', 'demo'];
const STEP_KEYS = ['stepId', 'lessonId', 'title', 'goal', 'read', 'files', 'actions', 'preview', 'acceptance', 'check', 'hint', 'answer'];
const READ_KEYS = ['lessonId', 'anchor', 'why'];
const PREVIEW_KEYS = ['output', 'shot', 'caption'];
const FINISH_KEYS = ['id', 'text'];

const isText = (value) => typeof value === 'string' && value.trim() !== '';
const lessonNumber = (lessonId) => Number(lessonId.slice(1));

function unknownKeys(value, allowed, where, errors) {
  for (const key of Object.keys(value)) if (!allowed.includes(key)) errors.push(`${where} 有未知字段 ${key}`);
}

function textList(value, where, errors, { min = 1, max = 8 } = {}) {
  if (!Array.isArray(value) || value.length < min || value.length > max || !value.every(isText)) {
    errors.push(`${where} 必须是 ${min}–${max} 条非空文字`);
    return [];
  }
  return value;
}

function lintText(text, where, errors) {
  if (INTERNAL_ID.test(text)) errors.push(`${where} 含内部编号：${text.match(INTERNAL_ID)[0]}`);
  if (PATCH_VERSION.test(text)) errors.push(`${where} 含补丁版本号：${text.match(PATCH_VERSION)[0]}`);
  for (const [, , href] of text.matchAll(LINK)) {
    if (!href.startsWith('#') && !href.startsWith('/js_web/')) errors.push(`${where} 的链接必须是页内 # 或 /js_web/ 开头：${href}`);
  }
}

/**
 * 校验一个 Lab 的步骤数据；返回错误列表，空数组表示通过。
 * @param {any} data
 * @param {Context} context
 * @returns {string[]}
 */
export function validateLab(data, { catalog, demos = [], file }) {
  const errors = [];
  if (!data || typeof data !== 'object' || Array.isArray(data)) return ['步骤文件必须是对象'];
  unknownKeys(data, TOP_KEYS, '顶层', errors);
  const lab = catalog.labs.find((row) => row.labId === data.labId);
  if (!lab) return [...errors, `未知 labId：${data.labId}`];
  const labNumber = data.labId.slice(1);
  if (file && file !== `l${labNumber}.json`) errors.push(`${data.labId} 的文件名应为 l${labNumber}.json`);
  const lessons = catalog.lessons.filter((row) => row.labId === data.labId);
  const byId = new Map(catalog.lessons.map((row) => [row.lessonId, row]));

  const goal = data.goal;
  if (!goal || typeof goal !== 'object') errors.push('缺少 goal');
  else {
    unknownKeys(goal, GOAL_KEYS, 'goal', errors);
    if (!isText(goal.summary)) errors.push('goal.summary 必须是非空文字');
    else lintText(goal.summary, 'goal.summary', errors);
    textList(goal.outcomes, 'goal.outcomes', errors, { max: 6 }).forEach((text, i) => lintText(text, `goal.outcomes[${i}]`, errors));
    if (goal.shot !== undefined && !SHOT_ID.test(goal.shot)) errors.push(`goal.shot 截图 id 格式不对：${goal.shot}`);
    if (goal.demo !== undefined && !demos.some((demo) => demo.id === goal.demo)) errors.push(`goal.demo 不在 labs/demos.json：${goal.demo}`);
  }

  const steps = Array.isArray(data.steps) ? data.steps : [];
  if (!steps.length) errors.push('steps 不能为空');
  const seen = new Set();
  const perLesson = new Map();
  const referenced = new Set();
  let lastOrder = -1;
  steps.forEach((step, index) => {
    const where = `第 ${index + 1} 步（${step?.stepId ?? '无 stepId'}）`;
    if (!step || typeof step !== 'object') { errors.push(`${where} 必须是对象`); return; }
    unknownKeys(step, STEP_KEYS, where, errors);
    const row = byId.get(step.lessonId);
    if (!row || row.labId !== data.labId) { errors.push(`${where} 的 lessonId 不属于 ${data.labId}：${step.lessonId}`); return; }
    const match = STEP_ID.exec(step.stepId ?? '');
    if (!match) errors.push(`${where} 的 stepId 格式应为 l${labNumber}-cNN-序号`);
    else {
      if (match[1] !== labNumber || `C${match[2]}` !== step.lessonId) errors.push(`${where} 的 stepId 与 Lab/课号不一致`);
      const expected = (perLesson.get(step.lessonId) ?? 0) + 1;
      if (Number(match[3]) !== expected) errors.push(`${where} 应编号为 ${step.lessonId.toLowerCase()} 的第 ${expected} 步`);
    }
    if (seen.has(step.stepId)) errors.push(`${where} 的 stepId 重复`);
    seen.add(step.stepId);
    perLesson.set(step.lessonId, (perLesson.get(step.lessonId) ?? 0) + 1);
    const order = lessons.indexOf(row);
    if (order < lastOrder) errors.push(`${where} 应按课程顺序排列`);
    lastOrder = order;

    for (const key of ['title', 'goal']) {
      if (!isText(step[key])) errors.push(`${where} 缺少 ${key}`);
      else lintText(step[key], `${where} 的 ${key}`, errors);
    }
    if (isText(step.title) && step.title.length > 28) errors.push(`${where} 的 title 超过 28 字`);
    if (!Array.isArray(step.read) || step.read.length < 1 || step.read.length > 3) errors.push(`${where} 的 read 必须有 1–3 项`);
    const readKeys = new Set();
    for (const [i, item] of (Array.isArray(step.read) ? step.read : []).entries()) {
      const at = `${where} 的 read[${i}]`;
      if (!item || typeof item !== 'object') { errors.push(`${at} 必须是对象`); continue; }
      unknownKeys(item, READ_KEYS, at, errors);
      const target = byId.get(item.lessonId);
      if (!target) errors.push(`${at} 的 lessonId 不在 catalog：${item.lessonId}`);
      else if (lessonNumber(item.lessonId) > lessonNumber(step.lessonId)) errors.push(`${at} 不能指向后面的课 ${item.lessonId}`);
      if (!isText(item.anchor) || /[#?/\s]/.test(item.anchor)) errors.push(`${at} 的 anchor 必须是不含 # ? / 空白的标题 id`);
      if (!isText(item.why)) errors.push(`${at} 缺少 why`);
      else lintText(item.why, `${at} 的 why`, errors);
      const key = `${item.lessonId}#${item.anchor}`;
      if (readKeys.has(key)) errors.push(`${at} 重复`);
      readKeys.add(key);
      if (target?.labId === data.labId) referenced.add(item.lessonId);
    }
    if (step.files !== undefined) {
      if (!Array.isArray(step.files) || !step.files.length) errors.push(`${where} 的 files 不能为空数组`);
      else for (const file of step.files) {
        if (!row.files.includes(file)) errors.push(`${where} 的文件 ${file} 不在 ${step.lessonId} 的改动文件里`);
      }
      if (Array.isArray(step.files) && new Set(step.files).size !== step.files.length) errors.push(`${where} 的 files 重复`);
    }
    textList(step.actions, `${where} 的 actions`, errors).forEach((text, i) => lintText(text, `${where} 的 actions[${i}]`, errors));
    textList(step.acceptance, `${where} 的 acceptance`, errors, { max: 4 }).forEach((text, i) => lintText(text, `${where} 的 acceptance[${i}]`, errors));
    const preview = step.preview;
    if (!preview || typeof preview !== 'object') errors.push(`${where} 缺少 preview`);
    else {
      unknownKeys(preview, PREVIEW_KEYS, `${where} 的 preview`, errors);
      if (isText(preview.output) === (preview.shot !== undefined)) errors.push(`${where} 的 preview 需要 output 或 shot 二选一`);
      if (preview.shot !== undefined && !SHOT_ID.test(preview.shot)) errors.push(`${where} 的截图 id 格式不对：${preview.shot}`);
      if (preview.caption !== undefined && !isText(preview.caption)) errors.push(`${where} 的 preview.caption 不能为空`);
      if (isText(preview.caption)) lintText(preview.caption, `${where} 的 preview.caption`, errors);
    }
    if (step.check !== undefined) {
      const checks = Array.isArray(step.check) ? step.check : [step.check];
      if (!checks.length || !checks.every(isText)) errors.push(`${where} 的 check 必须是非空命令`);
    }
    for (const key of ['hint', 'answer']) {
      if (step[key] === undefined) continue;
      if (!isText(step[key])) errors.push(`${where} 的 ${key} 不能为空`);
      else lintText(step[key], `${where} 的 ${key}`, errors);
    }
  });

  for (const row of lessons) {
    if (!perLesson.has(row.lessonId)) errors.push(`${row.lessonId} 没有步骤`);
    if (perLesson.get(row.lessonId) > 3) errors.push(`${row.lessonId} 超过 3 步`);
    if (!referenced.has(row.lessonId)) errors.push(`${row.lessonId} 没有被任何「先读」引用`);
    const own = steps.filter((step) => step?.lessonId === row.lessonId);
    if (own.length && own.every((step) => Array.isArray(step.files))) {
      const covered = new Set(own.flatMap((step) => step.files));
      for (const file of row.files) if (!covered.has(file)) errors.push(`${row.lessonId} 的步骤没有覆盖改动文件 ${file}`);
    }
  }

  const items = data.finish?.items;
  if (!Array.isArray(items) || !items.length) errors.push('finish.items 不能为空');
  else {
    unknownKeys(data.finish, ['items'], 'finish', errors);
    items.forEach((item, index) => {
      const where = `收尾第 ${index + 1} 项`;
      unknownKeys(item ?? {}, FINISH_KEYS, where, errors);
      if (item?.id !== `l${labNumber}-finish-${index + 1}`) errors.push(`${where} 的 id 应为 l${labNumber}-finish-${index + 1}`);
      if (seen.has(item?.id)) errors.push(`${where} 的 id 重复`);
      seen.add(item?.id);
      if (!isText(item?.text)) errors.push(`${where} 缺少 text`);
      else lintText(item.text, where, errors);
    });
  }

  if (data.retired !== undefined) {
    if (!Array.isArray(data.retired)) errors.push('retired 必须是数组');
    else for (const id of data.retired) {
      const step = STEP_ID.exec(id);
      const finish = FINISH_ID.exec(id);
      if ((step?.[1] ?? finish?.[1]) !== labNumber) errors.push(`retired 含非本 Lab 的 id：${id}`);
      if (seen.has(id)) errors.push(`retired 与现有 id 冲突：${id}`);
    }
  }
  return errors;
}

/**
 * 校验并补全默认值（文件、检查命令、全局序号）；数据有错时抛出。
 * @param {any} data
 * @param {Context} context
 * @returns {Lab}
 */
export function normalizeLab(data, context) {
  const errors = validateLab(data, context);
  if (errors.length) throw new Error(`${data?.labId ?? 'Lab'} 步骤数据有误：\n${errors.join('\n')}`);
  const { catalog } = context;
  const lab = catalog.labs.find((row) => row.labId === data.labId);
  const rows = new Map(catalog.lessons.map((row) => [row.lessonId, row]));
  const steps = data.steps.map((step, index) => {
    const row = rows.get(step.lessonId);
    const own = data.steps.filter((item) => item.lessonId === step.lessonId);
    return {
      ...step,
      number: index + 1,
      files: step.files ?? row.files,
      check: [step.check ?? row.commands.check].flat(),
      defaultCheck: step.check === undefined,
      lessonStep: own.indexOf(step) + 1,
      lessonSteps: own.length,
      lastOfLesson: own.at(-1).stepId === step.stepId,
      lesson: { lessonId: row.lessonId, title: row.title, slug: row.slug },
      read: step.read.map((item) => ({ ...item, slug: rows.get(item.lessonId).slug, title: rows.get(item.lessonId).title })),
    };
  });
  const lessons = catalog.lessons.filter((row) => row.labId === data.labId).map((row) => row.lessonId);
  return {
    labId: data.labId,
    title: lab.title,
    lessons,
    goal: data.goal,
    steps,
    finish: data.finish.items,
    retired: data.retired ?? [],
  };
}

/**
 * 学习进度接受的 id：当前步骤、收尾项与已退役 id（退役 id 保留，旧记录才不会被判为损坏）。
 * @param {Lab} lab
 */
export function labProgressIds(lab) {
  return {
    active: [...lab.steps.map((step) => step.stepId), ...lab.finish.map((item) => item.id)],
    retired: [...lab.retired],
  };
}

/** @param {string} stepId */
export function stepAnchor(stepId) {
  return `step-${stepId}`;
}

/** @param {string} labId */
export function finishAnchor(labId) {
  return `${labId.toLowerCase()}-finish`;
}

/** @param {string} base @param {string} labId @param {string} [hash] */
export function labHref(base, labId, hash = '') {
  return `${base}labs/${labId.toLowerCase()}/${hash ? `#${hash}` : ''}`;
}

/** @param {string} base @param {{ slug: string, anchor: string }} item @param {string} stepId */
export function readHref(base, item, stepId) {
  return `${base}${item.slug}/?from=${encodeURIComponent(stepId)}#${item.anchor}`;
}

/** @param {string} text */
function escapeHtml(text) {
  return text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
}

/**
 * 步骤文字里只支持 `代码` 与 [文字](/js_web/... 或 #锚点)；其余按纯文本转义。
 * @param {string} text
 * @param {string} [base]
 */
export function inlineHtml(text, base = '/js_web/') {
  return text.split(/(`[^`]+`)/).map((part) => {
    if (/^`[^`]+`$/.test(part)) return `<code>${escapeHtml(part.slice(1, -1))}</code>`;
    let html = '';
    let last = 0;
    for (const match of part.matchAll(LINK)) {
      html += escapeHtml(part.slice(last, match.index));
      const href = match[2].startsWith('/js_web/') ? base + match[2].slice('/js_web/'.length) : match[2];
      html += `<a href="${escapeHtml(href)}">${escapeHtml(match[1])}</a>`;
      last = match.index + match[0].length;
    }
    return html + escapeHtml(part.slice(last));
  }).join('');
}
