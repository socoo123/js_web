/**
 * 构建时给教学提示加 class 与 data-*，只改属性，不改文字和结构；样式见 src/styles/callouts.css。
 *
 * - `:::tip[自己尝试 · 环境]` 的 Starlight aside → data-callout="try"，data-env="环境"
 * - 段首 `**记住：**` 的段落 → data-callout="remember"
 * - 段首 `**Java 对照：**`（或旧课不加粗的「Java 对照：」）的段落 → data-callout="java"
 * - 旧课段首 `**先猜一猜：**` 的问题段 → data-callout="predict"、data-callout-scope="question"
 * - summary 为「提示」「参考答案」的 details → data-disclosure="hint|answer"
 * - 正文开头「第 N 周 · 第 D 天」引用块 → class="lesson-meta-legacy"
 * - 旧课每处「先猜一猜」（含写在段落中间的）→ 问题段 data-reveal-q="序号"；答案写在同一段时加 data-reveal-inline；
 *   紧跟的代码块（允许隔一句以冒号结尾的引导语）data-reveal-code，其后第一段说明（或表格）data-reveal-explain。
 *   浏览器脚本 src/scripts/reveal.mjs 只遮这些带标记的位置；判定规则见 reveal-rules.mjs。
 *
 * Astro 7 默认用 Sätteri 处理 Markdown/MDX，`markdown.rehypePlugins` 会把整站切回旧的 unified 管线，
 * 所以这里写成 Sätteri hast 插件，由同文件导出的集成挂到当前处理器上。
 */

import { inlineAnswerRange } from './reveal-rules.mjs';

const PARAGRAPH_LABELS = new Map([
  ['记住', 'remember'],
  ['Java 对照', 'java'],
  ['先猜一猜', 'predict'],
]);

const LABEL_PATTERN = /^\s*(记住|Java 对照|先猜一猜)\s*[：:]\s*$/;
const TRY_PATTERN = /^自己尝试(?:\s*·\s*(.+))?$/;
const LEGACY_META_PATTERN = /^第\s*\d+\s*周\s*·\s*第\s*\d+\s*天$/;

const isBlank = (node) => node?.type === 'text' && !node.value.trim();
const firstMeaningful = (children = []) => children.find((child) => !isBlank(child));
const isElement = (node, tagName) => node?.type === 'element' && (!tagName || node.tagName === tagName);
const isJsx = (node, name) => (node?.type === 'mdxJsxFlowElement' || node?.type === 'mdxJsxTextElement') && node.name === name;

function classList(node) {
  const props = node.properties ?? {};
  const value = props.class ?? props.className;
  if (Array.isArray(value)) return value.map(String);
  return typeof value === 'string' ? value.split(/\s+/).filter(Boolean) : [];
}

/** Sätteri 保留节点原来的键名（`class` 或 `className`），沿用同一个键，避免输出两个 class 属性。 */
function addClass(node, ctx, name) {
  const list = classList(node);
  if (list.includes(name)) return;
  if (typeof node.properties?.class === 'string') ctx.setProperty(node, 'class', [...list, name].join(' '));
  else ctx.setProperty(node, 'className', [...list, name]);
}

function tagParagraph(node, ctx) {
  if (classList(node).includes('js-callout')) return;
  const first = firstMeaningful(node.children);
  if (isElement(first, 'strong')) {
    const match = LABEL_PATTERN.exec(ctx.textContent(first));
    if (match) {
      const kind = PARAGRAPH_LABELS.get(match[1]);
      addClass(node, ctx, 'js-callout');
      ctx.setProperty(node, 'data-callout', kind);
      if (kind === 'predict') {
        ctx.setProperty(node, 'data-callout-scope', 'question');
        tagPredictParts(node, ctx);
      }
      return;
    }
  }
  if ((node.children ?? []).some((child) => isElement(child, 'strong') && PREDICT_LABEL.test(ctx.textContent(child)))) {
    tagPredictParts(node, ctx);
    return;
  }
  if (first?.type === 'text' && /^\s*Java 对照[：:]/.test(first.value)) {
    addClass(node, ctx, 'js-callout');
    ctx.setProperty(node, 'data-callout', 'java');
    ctx.setProperty(node, 'data-callout-label', 'plain');
  }
}

const PREDICT_LABEL = /^\s*先猜一猜\s*[：:]\s*$/;

const isCodeBlock = (node) => isElement(node, 'div') && classList(node).includes('expressive-code');

/** 普通说明段：不是另一个提示块，也不是只放一张图的段落。 */
function isProse(node, ctx) {
  if (!isElement(node, 'p') || classList(node).includes('js-callout')) return false;
  const lead = firstMeaningful(node.children);
  if (isElement(lead, 'strong') && LABEL_PATTERN.test(ctx.textContent(lead))) return false;
  if ((node.children ?? []).every((child) => isBlank(child) || isElement(child, 'img'))) return false;
  return Boolean(ctx.textContent(node).trim());
}

/** 「在 Console 执行：」这类引出代码的短句。 */
const isLeadIn = (node, ctx) => isProse(node, ctx) && /[：:]\s*$/.test(ctx.textContent(node)) && ctx.textContent(node).trim().length <= 60;

function tagPredictParts(node, ctx) {
  const group = String((ctx.data.revealGroups = (ctx.data.revealGroups ?? 0) + 1));
  ctx.setProperty(node, 'data-reveal-q', group);
  if (inlineAnswerRange(ctx.textContent(node))) {
    ctx.setProperty(node, 'data-reveal-inline', '');
    return;
  }
  const siblings = ctx.parent(node)?.children ?? [];
  const following = siblings.slice((ctx.indexOf(node) ?? siblings.length) + 1).filter((child) => !isBlank(child));
  let [next, after] = following;
  let rest = following.slice(1);
  if (isLeadIn(next, ctx)) {
    if (!isCodeBlock(after)) return;
    [next, rest] = [after, following.slice(2)];
  }
  if (isCodeBlock(next)) {
    ctx.setProperty(next, 'data-reveal-code', group);
    next = rest[0];
  }
  if (isProse(next, ctx) || isElement(next, 'table')) ctx.setProperty(next, 'data-reveal-explain', group);
}

function tagAside(node, ctx) {
  if (!classList(node).includes('starlight-aside--tip')) return;
  const props = node.properties ?? {};
  const match = TRY_PATTERN.exec(String(props['aria-label'] ?? props.ariaLabel ?? '').trim());
  if (!match) return;
  addClass(node, ctx, 'js-callout');
  ctx.setProperty(node, 'data-callout', 'try');
  if (match[1]) ctx.setProperty(node, 'data-env', match[1].trim());
}

function disclosureOf(node, ctx) {
  const summary = (node.children ?? []).find((child) => isElement(child, 'summary') || isJsx(child, 'summary'));
  const value = summary ? ctx.textContent(summary).trim() : '';
  return value === '提示' ? 'hint' : value === '参考答案' ? 'answer' : undefined;
}

function tagDetails(node, ctx) {
  const kind = disclosureOf(node, ctx);
  if (kind) ctx.setProperty(node, 'data-disclosure', kind);
}

function tagLegacyMeta(node, ctx) {
  if (ctx.parent(node)?.type !== 'root') return;
  const paragraph = (node.children ?? []).find((child) => isElement(child, 'p'));
  const lead = firstMeaningful(paragraph?.children);
  if (isElement(lead, 'strong') && LEGACY_META_PATTERN.test(ctx.textContent(lead).trim())) addClass(node, ctx, 'lesson-meta-legacy');
}

export const calloutsHastPlugin = {
  name: 'js-web-callouts',
  element: [
    { filter: ['p'], visit: tagParagraph },
    { filter: ['aside'], visit: tagAside },
    { filter: ['details'], visit: tagDetails },
    { filter: ['blockquote'], visit: tagLegacyMeta },
  ],
  mdxJsxFlowElement: { filter: ['details'], visit: tagDetails },
};

/** 放在 starlight() 之后，使本插件在 Starlight 的提示块与标题锚点处理之后运行。 */
export default function markdownCallouts() {
  return {
    name: 'js-web-markdown-callouts',
    hooks: {
      'astro:config:setup': ({ config, logger }) => {
        const processor = config.markdown?.processor;
        if (processor?.name === 'satteri') processor.options.hastPlugins.push(calloutsHastPlugin);
        else logger.warn(`markdown.processor 为 ${processor?.name ?? '未知'}，提示块只保留 CSS 兜底样式。`);
      },
    },
  };
}
