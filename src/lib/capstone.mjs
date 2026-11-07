// L6 毕业挑战的构建期数据：题库、Bug、项目目标统一在这里解析「回看」链接。
// 锚点必须是课文标题的 slug 或课文里显式的 <a id>，找不到就让构建失败。
import { getEntry, render } from 'astro:content';
import catalog from '../../labs/catalog.json';
import { AREAS, QUESTIONS } from '../../labs/capstone/quiz.mjs';
import { BUGS } from '../../labs/capstone/bugs.mjs';
import { CASES, LEVELS, PARTIAL, RUBRIC, RUBRIC_SCALE, START } from '../../labs/capstone/project.mjs';

export const STORAGE_KEY = 'js-web-capstone-v1';
export { AREAS, QUESTIONS, BUGS, CASES, LEVELS, PARTIAL, RUBRIC, RUBRIC_SCALE, START };

const base = import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`;
const lessons = new Map(catalog.lessons.map((lesson) => [lesson.lessonId, lesson]));
/** @type {Map<string, Promise<{ lesson: any, body: string, headings: { depth: number, slug: string, text: string }[] }>>} */
const pages = new Map();

function page(lessonId) {
  const lesson = lessons.get(lessonId);
  if (!lesson) throw new Error(`L6：catalog 里没有 ${lessonId}`);
  if (!pages.has(lessonId)) {
    pages.set(lessonId, (async () => {
      const entry = await getEntry('docs', lesson.slug);
      if (!entry) throw new Error(`L6：找不到 ${lessonId} 的课文 ${lesson.slug}`);
      const { headings } = await render(entry);
      return { lesson, body: entry.body ?? '', headings };
    })());
  }
  return pages.get(lessonId);
}

const plain = (text) => text.replace(/`/g, '');

/** 显式锚点所在的小节：锚点后面紧跟标题就用那个标题，否则用它前面最近的标题。 */
function sectionFor(body, index, headings) {
  const after = body.slice(index).split('\n').slice(1);
  for (const line of after) {
    const text = line.trim();
    if (!text || /^<a\s+id=/.test(text)) continue;
    const match = text.match(/^#{2,4}\s+(.+)$/);
    if (match) return plain(match[1]);
    break;
  }
  const before = body.slice(0, index).split('\n').reverse();
  for (const line of before) {
    const match = line.match(/^#{2,4}\s+(.+)$/);
    if (match) return plain(match[1]);
  }
  return headings[0]?.text ?? '相关小节';
}

/**
 * @param {string} lessonId
 * @param {string} anchor
 * @param {string} [label]
 */
export async function review(lessonId, anchor, label) {
  const { lesson, body, headings } = await page(lessonId);
  const heading = headings.find((item) => item.slug === anchor);
  let text = label ?? heading?.text;
  if (!heading) {
    const index = body.search(new RegExp(`<a\\s+id="${anchor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`));
    if (index < 0) throw new Error(`L6：${lessonId} 没有锚点 #${anchor}（既不是标题 slug，也没有 <a id>）`);
    text ??= sectionFor(body, index, headings);
  }
  return {
    lessonId,
    lessonTitle: lesson.title,
    label: text,
    href: `${base}${lesson.slug}/#${anchor}`,
  };
}

export function areaFor(id) {
  const area = AREAS.find((item) => item.id === id);
  if (!area) throw new Error(`L6：未知领域 ${id}`);
  return area;
}

export function href(path) {
  return path.startsWith('/js_web/') ? base + path.slice('/js_web/'.length) : path;
}

const escapeHtml = (text) => String(text).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const INLINE = /(`[^`]+`)|\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^)\s]+)\)/g;

/** 数据里的行内标记：`代码`、**强调**、[文字](/js_web/...)。 */
export function inline(text) {
  let html = '';
  let last = 0;
  for (const match of text.matchAll(INLINE)) {
    html += escapeHtml(text.slice(last, match.index));
    if (match[1]) html += `<code>${escapeHtml(match[1].slice(1, -1))}</code>`;
    else if (match[2]) html += `<strong>${escapeHtml(match[2])}</strong>`;
    else html += `<a href="${escapeHtml(href(match[4]))}">${escapeHtml(match[3])}</a>`;
    last = match.index + match[0].length;
  }
  return html + escapeHtml(text.slice(last));
}

/** @type {Record<string, string>} */
export const TYPE_LABEL = { single: '单选', multi: '多选', predict: '预测输出' };
export const KEYS = ['A', 'B', 'C', 'D', 'E', 'F'];

export function answerText(question) {
  return question.answer.map((index) => KEYS[index]).join('、');
}

/** 所有项目检查项的 id，前缀带级别与目标，存储时不会互相覆盖。 */
export function checkId(level, goal, check) {
  return `${level.id}.${goal.id}.${check.id}`;
}
