import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkMdx from 'remark-mdx';
import { comparison, snippet } from '../labs/sources.mjs';
import { readExample } from '../src/lib/examples.mjs';
import catalog from '../labs/catalog.json' with { type: 'json' };

export function codeLimitIssues(blocks, maximum) {
  const issues = [];
  if (blocks.length > maximum) issues.push(`代码块 ${blocks.length} 个，超过 ${maximum}`);
  blocks.forEach((block, i) => { if (block.lines.length > 25) issues.push(`第 ${i + 1} 个代码块 ${block.lines.length} 行，超过 25`); });
  return issues;
}

const ID_COMPONENTS = { CodeCompare: 'pairId', CodeExcerpt: 'snippetId', LessonTask: 'lessonId', LabOverview: 'labId' };
// V3 组件：允许的静态字符串属性；question/kind/example 为必填。
const V3_COMPONENTS = {
  Predict: ['question'],
  Effect: ['kind', 'example', 'preview', 'demo', 'title', 'caption'],
  RunSnippet: ['example', 'title'],
};
const COMPONENTS = [...Object.keys(ID_COMPONENTS), ...Object.keys(V3_COMPONENTS)];
const EFFECT_KINDS = ['console', 'terminal', 'page', 'demo'];

function v3Component(node, code, prose, components) {
  const name = node.name;
  const attrs = Object.fromEntries(node.attributes.map((attr) => [attr.name, attr.value]));
  for (const key of Object.keys(attrs)) {
    if (!V3_COMPONENTS[name].includes(key)) throw new Error(`${name} 不支持属性 ${key}`);
    if (typeof attrs[key] !== 'string' || !attrs[key].trim()) throw new Error(`${name} 的 ${key} 必须是非空静态字符串`);
  }
  const children = (node.children ?? []).filter((child) => !(child.type === 'text' && !child.value.trim()));
  if (name === 'Predict') {
    if (!attrs.question) throw new Error('Predict 需要 question');
    const answers = children.filter((child) => child.type === 'mdxJsxFlowElement' && child.name === 'div' && child.attributes.some((attr) => attr.name === 'slot' && attr.value === 'answer'));
    if (answers.length !== 1) throw new Error('Predict 需要且只能有一个 <div slot="answer"> 答案区');
    if (children.length < 2) throw new Error('Predict 需要问题代码和答案区');
    components.push({ component: name, id: attrs.question });
    prose.push(`先猜一猜：${attrs.question}`);
    return;
  }
  if (name === 'Effect') {
    if (!EFFECT_KINDS.includes(attrs.kind)) throw new Error(`Effect kind 必须是 ${EFFECT_KINDS.join('/')}`);
    if (attrs.kind === 'page' && (!attrs.preview || attrs.example || attrs.demo || children.length)) throw new Error('Effect page 只接受 preview，不接受子内容');
    if (attrs.kind === 'demo' && (!attrs.demo || attrs.example || attrs.preview || children.length)) throw new Error('Effect demo 只接受 demo，不接受子内容');
    if ((attrs.kind === 'console' || attrs.kind === 'terminal') && (attrs.preview || attrs.demo || Boolean(attrs.example) === Boolean(children.length))) throw new Error('Effect console/terminal 需要 example 或子代码块二选一');
    if (attrs.example) code.push({ code: readExample(attrs.example).expected });
    components.push({ component: name, id: attrs.example ?? attrs.preview ?? attrs.demo ?? attrs.kind, kind: attrs.kind });
    prose.push(attrs.title ?? '', attrs.caption ?? '');
    return;
  }
  if (name === 'RunSnippet') {
    if (!attrs.example || children.length) throw new Error('RunSnippet 只接受 example 与可选 title');
    const item = readExample(attrs.example);
    if (item.source === null) throw new Error(`RunSnippet 缺少源码：${attrs.example}`);
    code.push({ code: item.source }, { code: item.expected });
    components.push({ component: name, id: attrs.example });
    prose.push(attrs.title ?? '');
  }
}

// Parse JSX nodes rather than matching tags inside strings, comments, or fences.
export function importedContent(source, mdx = true) {
  if (!mdx) return { code: [], prose: '', components: [] };
  const tree = unified().use(remarkParse).use(remarkMdx).parse(source.replace(/^---\n[\s\S]*?\n---\n/, ''));
  const code = []; const prose = []; const components = [];
  function visit(node) {
    if (node.type === 'mdxjsEsm') {
      for (const declaration of node.data?.estree?.body ?? []) {
        if (declaration.type !== 'ImportDeclaration') throw new Error('课程 MDX 只允许 import 受控组件，不执行内联导出/变量');
        const name = declaration.source.value;
        const expected = name.match(new RegExp(`^\\.\\./.*/components/(${COMPONENTS.join('|')})\\.astro$`))?.[1];
        if (!expected) throw new Error(`课程 MDX 导入不在受控清单：${name}`);
        if (declaration.specifiers.length !== 1 || declaration.specifiers[0].type !== 'ImportDefaultSpecifier' || declaration.specifiers[0].local.name !== expected) throw new Error('课程组件必须使用同名默认导入');
      }
    }
    if (node.type === 'mdxFlowExpression' || node.type === 'mdxTextExpression') throw new Error('课程正文不允许内联 MDX 表达式；代码放进受控片段清单');
    if (node.type === 'mdxJsxFlowElement' || node.type === 'mdxJsxTextElement') {
      const component = node.name;
      if (component === 'script' || component === 'style') throw new Error('课程的脚本/样式代码必须放在受控源码片段中');
      for (const attr of node.attributes ?? []) {
        if (attr.type !== 'mdxJsxAttribute' || (attr.value !== null && typeof attr.value !== 'string')) throw new Error('课程 JSX 不允许表达式属性或 spread');
      }
      if (component && /^[A-Z]/.test(component)) {
        if (!COMPONENTS.includes(component)) throw new Error(`未知课程组件：${component}`);
        if (V3_COMPONENTS[component]) v3Component(node, code, prose, components);
        else {
          if (node.children?.length || node.attributes.length !== 1 || node.attributes[0].type !== 'mdxJsxAttribute' || typeof node.attributes[0].value !== 'string') throw new Error(`${component} 只接受一个静态 ID，不能在属性/slot 中藏正文或代码`);
          const attr = node.attributes[0]; const id = attr.value;
          const expected = ID_COMPONENTS[component];
          if (attr.name !== expected) throw new Error(`${component} 需要 ${expected}`);
          components.push({ component, id });
          if (component === 'CodeCompare') {
            const pair = comparison(id); code.push(pair.left, pair.right);
            prose.push(pair.title, pair.input, pair.difference, pair.left.output, pair.right.output, pair.left.caption, pair.right.caption);
            for (const side of [pair.left, pair.right]) if (!side.verified && !side.reason) throw new Error(`${id} 未运行代码缺少原因标注`);
          }
          if (component === 'CodeExcerpt') {
            const ref = snippet(id); code.push(ref); if (!ref.verified && !ref.reason) throw new Error(`${id} 未运行代码缺少原因标注`);
          }
          if (component === 'LessonTask') {
            const row = catalog.lessons.find((lesson) => lesson.lessonId === id);
            if (!row?.implemented) throw new Error(`任务尚未发行：${id}`);
            code.push({ code: Object.values(row.commands).join('\n') });
            prose.push(row.title, ...row.acceptance, ...row.files, row.trial?.description ?? '', '完整参考解（答案）下载本课起点，仅补课/恢复，在同一工作区持续修改。跨课沿用正在运行的服务。首次运行或切换界面时启动 dev；切换前用 Ctrl+C 停止旧服务，改完源码再运行 check。');
          }
        }
      }
    }
    for (const child of node.children ?? []) visit(child);
  }
  visit(tree);
  return { code, prose: prose.filter(Boolean).join('\n'), components };
}
