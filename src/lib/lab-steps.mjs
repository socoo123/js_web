// 构建时读取 labs/steps/l*.json，供 Lab 页（LabHero / LabLessonTabs / LabSteps / LabFinish）、课页 LabBar、LabNext、LessonTask 与 LabOverview 共用。数据有误时构建直接失败。
import catalog from '../../labs/catalog.json';
import demos from '../../labs/demos.json';
import { normalizeLab, stepAnchor, finishAnchor, labHref, lessonTabId, lessonTabHref } from '../../labs/steps/model.mjs';

const files = import.meta.glob('../../labs/steps/l*.json', { eager: true, import: 'default' });

/** @type {import('../../labs/steps/model.mjs').Lab[]} */
export const labs = Object.entries(files)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([file, data]) => normalizeLab(data, { catalog, demos: demos.demos, file: file.split('/').pop() }));

export { stepAnchor, finishAnchor, labHref, lessonTabId, lessonTabHref };

/** 课程标签上的短标题（完整标题在面板里）；catalog 增加 shortTitle 字段后改为读取 catalog。 */
export const TAB_LABELS = {
  C01: '故事与生态', C02: 'Web 与调试', C03: '值与类型', C04: '作用域', C05: '对象与 JSON',
  C06: '函数与闭包', C07: 'this 与 class', C08: 'Array', C09: 'Map 与 Set', C10: '栈、队列、树',
  C11: 'DOM 与事件', C12: 'Promise', C13: 'async 与请求', C14: '存储与错误', C15: 'CSS 布局',
  C16: '模块', C17: 'Node 边界', C18: 'npm', C19: 'Yarn/pnpm/Bun', C20: 'Vite 与 UT',
  C21: 'JSX 与组件', C22: 'Props', C23: 'useState', C24: 'key 与派生', C25: '表单校验',
  C26: '状态归属', C27: 'Reducer', C28: 'useRef', C29: 'useEffect', C30: '请求竞态',
  C31: 'Hooks 与路由', C32: 'Query', C33: 'React 19', C34: '性能与错误', C35: 'React 测试',
  C36: '复盘排错', C37: '组件选择', C38: 'Ant Design', C39: 'UI5 家族', C40: 'OpenUI5 MVC',
  C41: '绑定与控件', C42: '路由与 OData', C43: 'Web Components', C44: 'UI5 React', C45: '全链路 Debug',
  C46: '构建与 Pages', C47: '测试选择', C48: '总复盘',
};

/** @param {string} labId */
export function labFor(labId) {
  return labs.find((lab) => lab.labId === labId);
}

/** @param {string} id */
export function demoFor(id) {
  return demos.demos.find((demo) => demo.id === id);
}

/**
 * Lab 页需要的全部数据：catalog 的 Lab 与课程、步骤文件里的目标/步骤/收尾，以及每课的标签信息。
 * @param {string} labId
 */
export function labView(labId) {
  const row = catalog.labs.find((item) => item.labId === labId);
  if (!row) throw new Error(`catalog 中没有 ${labId}`);
  const data = labFor(labId);
  if (!data) throw new Error(`labs/steps 中没有 ${labId.toLowerCase()}.json`);
  const rows = catalog.lessons.filter((lesson) => lesson.labId === labId);
  const lessons = rows.map((lesson, index) => {
    const label = TAB_LABELS[lesson.lessonId];
    if (!label) throw new Error(`${lesson.lessonId} 缺少课程标签短标题`);
    return {
      ...lesson,
      index,
      tabId: lessonTabId(lesson.lessonId),
      label,
      steps: data.steps.filter((step) => step.lessonId === lesson.lessonId),
    };
  });
  const days = [lessons[0].day, lessons.at(-1).day];
  return {
    labId,
    title: row.title,
    description: row.description,
    goal: data.goal,
    steps: data.steps,
    finish: data.finish,
    lessons,
    range: `${lessons[0].lessonId}–${lessons.at(-1).lessonId}`,
    dayText: days[0] === days[1] ? `第 ${days[0]} 天` : `第 ${days[0]}–${days[1]} 天`,
    start: lessons[0].startCheckpoint,
  };
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
