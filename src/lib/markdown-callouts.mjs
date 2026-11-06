/**
 * 构建时给教学提示加 class 与 data-*，只改属性，不改文字和结构；样式见 src/styles/callouts.css。
 *
 * - `:::tip[自己尝试 · 环境]` 的 Starlight aside → data-callout="try"，data-env="环境"
 * - 段首 `**记住：**` 的段落 → data-callout="remember"
 * - 段首 `**Java 对照：**`（或旧课不加粗的「Java 对照：」）的段落 → data-callout="java"
 * - 旧课段首 `**先猜一猜：**` 的问题段 → data-callout="predict"、data-callout-scope="question"
 * - summary 为「提示」「参考答案」的 details → data-disclosure="hint|answer"
 * - 正文开头「第 N 周 · 第 D 天」引用块 → class="lesson-meta-legacy"
 *
 * Astro 7 默认用 Sätteri 处理 Markdown/MDX，`markdown.rehypePlugins` 会把整站切回旧的 unified 管线，
 * 所以这里写成 Sätteri hast 插件，由同文件导出的集成挂到当前处理器上。
 */

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
    if (!match) return;
    const kind = PARAGRAPH_LABELS.get(match[1]);
    addClass(node, ctx, 'js-callout');
    ctx.setProperty(node, 'data-callout', kind);
    if (kind === 'predict') ctx.setProperty(node, 'data-callout-scope', 'question');
    return;
  }
  if (first?.type === 'text' && /^\s*Java 对照[：:]/.test(first.value)) {
    addClass(node, ctx, 'js-callout');
    ctx.setProperty(node, 'data-callout', 'java');
    ctx.setProperty(node, 'data-callout-label', 'plain');
  }
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
