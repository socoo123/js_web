// 构建时读取 labs/steps/l*.json，供 LabSteps、LabBar、LabNext、LessonTask 与 LabOverview 共用。数据有误时构建直接失败。
import catalog from '../../labs/catalog.json';
import demos from '../../labs/demos.json';
import { normalizeLab, stepAnchor, finishAnchor, labHref } from '../../labs/steps/model.mjs';

const files = import.meta.glob('../../labs/steps/l*.json', { eager: true, import: 'default' });

/** @type {import('../../labs/steps/model.mjs').Lab[]} */
export const labs = Object.entries(files)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([file, data]) => normalizeLab(data, { catalog, demos: demos.demos, file: file.split('/').pop() }));

export { stepAnchor, finishAnchor, labHref };

/** @param {string} labId */
export function labFor(labId) {
  return labs.find((lab) => lab.labId === labId);
}

/** @param {string} id */
export function demoFor(id) {
  return demos.demos.find((demo) => demo.id === id);
}

/**
 * 本课在所属 Lab 中的步骤；Lab 还没有步骤数据时返回 null。
 * @param {string} lessonId
 */
export function stepsForLesson(lessonId) {
  for (const lab of labs) {
    const steps = lab.steps.filter((step) => step.lessonId === lessonId);
    if (steps.length) return { lab, steps };
  }
  return null;
}

/**
 * 本课之后的下一步；本课已是 Lab 最后一课时指向收尾清单。
 * @param {string} lessonId
 * @returns {{ lab: import('../../labs/steps/model.mjs').Lab, step?: import('../../labs/steps/model.mjs').Step, finish?: true } | null}
 */
export function nextAfterLesson(lessonId) {
  const own = stepsForLesson(lessonId);
  if (!own) return null;
  const last = own.steps.at(-1);
  const next = own.lab.steps[last.number];
  return next ? { lab: own.lab, step: next } : { lab: own.lab, finish: true };
}

/**
 * 「先读」指向本课的步骤，用于从 ?from= 还原返回浮标。
 * @param {string} lessonId
 * @param {string} base
 */
export function returnsForLesson(lessonId, base) {
  /** @type {Record<string, { lab: string, number: number, title: string, href: string }>} */
  const map = {};
  for (const lab of labs) {
    for (const step of lab.steps) {
      if (!step.read.some((item) => item.lessonId === lessonId)) continue;
      map[step.stepId] = {
        lab: lab.labId,
        number: step.number,
        title: step.title,
        href: labHref(base, lab.labId, stepAnchor(step.stepId)),
      };
    }
  }
  return map;
}

/**
 * 课程页标题 id → 文字；找不到时退回“相关小节”。
 * @param {{ anchor: string }} item
 * @param {{ slug: string, text: string }[] | undefined} headings
 */
export function readLabel(item, headings) {
  const heading = headings?.find((entry) => entry.slug === item.anchor);
  return heading ? heading.text : '相关小节';
}
