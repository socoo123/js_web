/**
 * 课页「先猜一猜」与练习的交互揭晓。渐进增强：静态 HTML 已有完整答案，本脚本只在浏览器里先遮住、再按需揭开。
 *
 * - 旧课先猜：构建插件标出的问题段、代码块、解释段（data-reveal-*）。遮代码里写出结果的注释与解释段，
 *   段内答案则把问号后的那部分包起来；下方加「你的猜测 + 揭晓」操作栏，可重置。
 * - Predict 组件：同一操作栏驱动原生 details；有 choices 时改为点选即判。
 * - 练习的「提示」「参考答案」：包成三步答题区，答案揭晓后可自评，结果存 localStorage。
 */
import { inlineAnswerRange, maskedCommentPrefix, sameOutput } from '../lib/reveal-rules.mjs';

const PRACTICE_KEY = 'js-web-practice-v1';
const HASH_COMMENT_LANGS = /^(?:sh|bash|shell|zsh|shellsession|console|yaml|yml|toml|ini|python|py|dotenv|properties)$/;
const STAGGER = 110;

let sequence = 0;
const uid = (prefix) => `${prefix}-${++sequence}`;
const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function h(tag, props = {}, ...children) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (value == null || value === false) continue;
    if (key === 'class') node.className = value;
    else if (key === 'text') node.textContent = value;
    else node.setAttribute(key, value === true ? '' : String(value));
  }
  node.append(...children.filter((child) => child != null && child !== false));
  return node;
}

function ensureId(node, prefix) {
  if (!node.id) node.id = uid(prefix);
  return node.id;
}

/** 揭开时的淡入：给元素设延迟并挂上动画标记，动画结束后摘掉。 */
function playIn(node, index = 0) {
  if (reducedMotion()) return;
  node.style.setProperty('--reveal-delay', `${index * STAGGER}ms`);
  node.setAttribute('data-reveal-in', '');
  node.addEventListener('animationend', () => node.removeAttribute('data-reveal-in'), { once: true });
}

/** 原生 details 的展开/收起高度动画；减少动态效果时直接切换。 */
function setDetailsOpen(details, open) {
  if ((details.revealTarget ?? details.open) === open) return;
  details.revealAnimation?.cancel();
  if (details.open === open) return;
  if (reducedMotion() || typeof details.animate !== 'function') {
    details.open = open;
    return;
  }
  const from = details.offsetHeight;
  details.open = open;
  const to = details.offsetHeight;
  if (!open) details.open = true;
  details.style.overflow = 'clip';
  const animation = details.animate({ height: [`${from}px`, `${to}px`] }, { duration: 260, easing: 'cubic-bezier(0.2, 0, 0, 1)' });
  details.revealAnimation = animation;
  details.revealTarget = open;
  const settle = () => {
    details.style.overflow = '';
    details.revealAnimation = undefined;
    details.revealTarget = undefined;
  };
  animation.onfinish = () => {
    if (!open) details.open = false;
    settle();
  };
  animation.oncancel = settle;
  if (open) for (const child of details.children) if (child.tagName !== 'SUMMARY') playIn(child);
}

function chip(label) {
  return h('span', { class: 'reveal-chip', title: '揭晓后显示' }, h('span', { 'aria-hidden': 'true' }, '？'), h('span', { class: 'js-visually-hidden' }, label));
}

/* ---------- 遮罩：代码注释、解释段、段内答案 ---------- */

/** 遮住一行代码里写出结果的注释；返回 { value, chip }，没有可遮的内容返回 null。 */
function maskLine(line, hashComments) {
  const tokens = [...line.childNodes];
  let before = '';
  let start = -1;
  for (const [index, token] of tokens.entries()) {
    const text = token.textContent ?? '';
    if (token.nodeType === Node.ELEMENT_NODE && (text.startsWith('//') || (hashComments && text.startsWith('#')))) {
      start = index;
      break;
    }
    before += text;
  }
  if (start < 0) return null;
  const comment = tokens.slice(start);
  const keep = maskedCommentPrefix(before, comment.map((token) => token.textContent).join(''));
  if (keep < 0) return null;
  let offset = keep;
  let first = 0;
  while (first < comment.length && offset >= comment[first].textContent.length) offset -= comment[first++].textContent.length;
  if (first >= comment.length) return null;
  if (offset > 0) {
    const token = comment[first];
    const tail = token.cloneNode(false);
    tail.textContent = token.textContent.slice(offset);
    token.textContent = token.textContent.slice(0, offset);
    token.after(tail);
    comment.splice(first + 1, 0, tail);
    first += 1;
  }
  const valueNodes = comment.slice(first);
  const value = h('span', { class: 'reveal-value' });
  valueNodes[0].before(value);
  value.append(...valueNodes);
  return { value, chip: chip('输出已隐藏') };
}

function maskCode(block) {
  const language = block.querySelector('pre')?.dataset.language ?? '';
  const hashComments = HASH_COMMENT_LANGS.test(language);
  const masks = [];
  for (const line of block.querySelectorAll('.ec-line > .code')) {
    const mask = maskLine(line, hashComments);
    if (mask) masks.push(mask);
  }
  return masks;
}

/** 文本偏移 → (文本节点, 节点内偏移)。 */
function locate(root, offset) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let remaining = offset;
  let node = walker.nextNode();
  while (node) {
    if (remaining <= node.data.length) return [node, remaining];
    remaining -= node.data.length;
    node = walker.nextNode();
  }
  return null;
}

/** 把问题段里问号后的答案包进 span；返回包好的元素。 */
function wrapInlineAnswer(paragraph) {
  const range = inlineAnswerRange(paragraph.textContent ?? '');
  if (!range) return null;
  const start = locate(paragraph, range[0]);
  const end = locate(paragraph, range[1]);
  if (!start || !end) return null;
  const selection = document.createRange();
  selection.setStart(...start);
  selection.setEnd(...end);
  const wrapper = h('span', { class: 'reveal-inline' });
  wrapper.append(selection.extractContents());
  selection.insertNode(wrapper);
  paragraph.normalize();
  return wrapper;
}

/* ---------- 操作栏：猜测输入 + 揭晓/再猜一次 ---------- */

/** where：揭晓后去哪里对照，如「下面的解析」「问题后面的答案」。 */
function createBar({ kind, controls, context = 'prose', where, onReveal, onReset, actual }) {
  const id = uid('reveal');
  const actionLabel = kind === 'output' ? '揭晓输出' : '揭晓答案';
  const input = h('input', {
    class: 'reveal-input', type: 'text', id: `${id}-guess`, name: 'guess', autocomplete: 'off', spellcheck: 'false',
    enterkeyhint: 'done', placeholder: kind === 'output' ? '例如：12、3、true' : '先写下你的判断',
  });
  const button = h('button', {
    class: 'js-button reveal-toggle', type: 'submit', 'data-variant': 'amber', 'aria-expanded': 'false', 'aria-controls': controls.join(' '),
  }, actionLabel);
  const field = h('div', { class: 'reveal-field' }, h('label', { class: 'reveal-label', for: input.id }, '你的猜测', h('span', { class: 'reveal-optional' }, '可选')), input);
  const form = h('form', { class: 'reveal-form', novalidate: true }, field, button);
  const note = h('p', { class: 'reveal-note' }, kind === 'output' ? '运行结果和解析 · 揭晓后显示' : '答案 · 揭晓后显示');
  const result = h('div', { class: 'reveal-result', hidden: true });
  const live = h('p', { class: 'js-visually-hidden', 'aria-live': 'polite' });
  const root = h('div', { class: 'reveal-bar', 'data-reveal-bar': kind, 'data-context': context, 'data-state': 'hidden' }, form, note, result, live);

  function showResult(guess) {
    const actualText = actual?.() ?? '';
    result.replaceChildren();
    if (!guess) {
      result.append(h('p', { class: 'reveal-done' }, `已揭晓，对照${where}。`));
      return;
    }
    const cards = h('div', { class: 'reveal-compare' },
      h('div', { class: 'reveal-card', 'data-kind': 'guess' }, h('span', { class: 'reveal-card__label' }, '你的猜测'), h('span', { class: 'reveal-card__text' }, guess)));
    if (actualText) cards.append(h('div', { class: 'reveal-card', 'data-kind': 'actual' }, h('span', { class: 'reveal-card__label' }, '实际输出'), h('span', { class: 'reveal-card__text' }, actualText)));
    result.append(cards);
    if (actualText) {
      const same = sameOutput(guess, actualText);
      result.append(h('p', { class: 'js-status reveal-verdict', 'data-tone': same ? 'ok' : 'warn' }, same ? '和实际输出一致' : '有出入：对照解析找出是哪一步想得不一样'));
    } else {
      result.append(h('p', { class: 'reveal-done' }, `对照${where}，看看判断依据是否一致。`));
    }
  }

  function reveal() {
    const guess = input.value.trim();
    root.dataset.state = 'shown';
    button.textContent = '再猜一次';
    button.dataset.variant = 'secondary';
    button.setAttribute('aria-expanded', 'true');
    showResult(guess);
    result.hidden = false;
    playIn(result);
    onReveal();
    live.textContent = `已揭晓${actual?.() ? `，实际输出：${actual()}` : ''}`;
    if (document.activeElement === input) button.focus();
  }

  function reset() {
    root.dataset.state = 'hidden';
    button.textContent = actionLabel;
    button.dataset.variant = 'amber';
    button.setAttribute('aria-expanded', 'false');
    result.hidden = true;
    result.replaceChildren();
    onReset();
    live.textContent = '答案已重新遮住';
    input.value = '';
    input.focus();
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (root.dataset.state === 'shown') reset();
    else reveal();
  });
  return { root, reveal, reset };
}

/* ---------- 旧课「先猜一猜」 ---------- */

function setupLegacyPredicts(content) {
  for (const question of content.querySelectorAll('[data-reveal-q]')) {
    const group = question.getAttribute('data-reveal-q');
    const code = content.querySelector(`[data-reveal-code="${group}"]`);
    const explain = content.querySelector(`[data-reveal-explain="${group}"]`);
    const inline = question.hasAttribute('data-reveal-inline') ? wrapInlineAnswer(question) : null;
    const masks = code ? maskCode(code) : [];
    if (!masks.length && !explain && !inline) continue;

    const inlineChip = inline ? h('span', { class: 'reveal-chip reveal-chip--text' }, '答案 · 揭晓后显示') : null;
    const controls = [code && masks.length ? ensureId(code, 'reveal-code') : null, explain && ensureId(explain, 'reveal-explain'), inline && ensureId(inline, 'reveal-inline')].filter(Boolean);
    const cover = () => {
      for (const mask of masks) {
        mask.value.hidden = true;
        mask.value.before(mask.chip);
      }
      if (explain) explain.hidden = true;
      if (inline) {
        inline.hidden = true;
        inline.before(inlineChip);
      }
    };
    const bar = createBar({
      kind: masks.length ? 'output' : 'answer',
      controls,
      where: inline ? '问题后面的答案' : masks.length ? (explain ? '每行输出和下面的解析' : '代码里每行的输出') : '下面的解析',
      actual: masks.length ? () => masks.map((mask) => mask.value.textContent.trim()).join('；') : undefined,
      onReveal() {
        masks.forEach((mask, index) => {
          mask.chip.remove();
          mask.value.hidden = false;
          playIn(mask.value, index);
        });
        if (inline) {
          inlineChip.remove();
          inline.hidden = false;
          playIn(inline);
        }
        if (explain) {
          explain.hidden = false;
          playIn(explain, masks.length);
        }
      },
      onReset: cover,
    });
    cover();
    (code ?? question).after(bar.root);
    question.setAttribute('data-reveal-ready', '');
  }
}

/* ---------- Predict 组件 ---------- */

function setupChoices(section, list, details) {
  const correct = Number(list.dataset.answer);
  const status = h('p', { class: 'predict-verdict', 'aria-live': 'polite' });
  const again = h('button', { class: 'js-button reveal-again', type: 'button', 'data-variant': 'secondary', hidden: true }, '再猜一次');
  const buttons = [];
  for (const item of list.querySelectorAll('li[data-choice]')) {
    const index = Number(item.dataset.choice);
    const button = h('button', { class: 'predict-choice', type: 'button', 'aria-pressed': 'false' });
    button.append(...item.childNodes);
    item.append(button);
    buttons.push([index, button]);
    button.addEventListener('click', () => {
      const right = index === correct;
      for (const [other, node] of buttons) {
        node.disabled = true;
        node.setAttribute('aria-pressed', String(other === index));
        if (other === index) node.dataset.result = right ? 'ok' : 'err';
        if (other === correct) node.dataset.correct = '';
        if (other === index || other === correct) {
          const tone = other === correct ? 'ok' : 'err';
          node.append(h('span', { class: 'js-status predict-choice-tag', 'data-tone': tone }, other === index ? '你的选择' : '正确答案'));
        }
      }
      const key = (i) => buttons.find(([other]) => other === i)?.[1].querySelector('.predict-choice-key')?.textContent ?? '';
      status.replaceChildren(h('span', { class: 'js-status', 'data-tone': right ? 'ok' : 'err' }, right ? `答对了：${key(index)}` : `不对：你选了 ${key(index)}，正确答案是 ${key(correct)}`));
      again.hidden = false;
      setDetailsOpen(details, true);
      again.focus();
    });
  }
  again.addEventListener('click', () => {
    for (const [, node] of buttons) {
      node.disabled = false;
      node.setAttribute('aria-pressed', 'false');
      delete node.dataset.result;
      delete node.dataset.correct;
      node.querySelector('.predict-choice-tag')?.remove();
    }
    status.replaceChildren();
    again.hidden = true;
    setDetailsOpen(details, false);
    buttons[0]?.[1].focus();
  });
  list.after(h('div', { class: 'predict-judge' }, status, again));
}

function setupComponentPredicts(content) {
  for (const section of content.querySelectorAll('[data-predict]')) {
    const details = section.querySelector('details.predict-answer');
    const body = details?.querySelector('.predict-answer-body');
    if (!details || !body) continue;
    const choices = section.querySelector('[data-predict-choices]');
    details.open = false;
    if (choices) setupChoices(section, choices, details);
    else {
      const bar = createBar({
        kind: 'answer', context: 'callout', where: '下面的答案', controls: [ensureId(body, 'predict-answer')],
        onReveal: () => setDetailsOpen(details, true),
        onReset: () => setDetailsOpen(details, false),
      });
      (section.querySelector('.predict-body') ?? details).after(bar.root);
    }
    section.setAttribute('data-reveal-ready', '');
  }
}

/* ---------- 练习：先自己做 → 看提示 → 对照参考答案 ---------- */

function readPractice() {
  try {
    const value = JSON.parse(window.localStorage.getItem(PRACTICE_KEY) ?? '{}');
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  } catch {
    return {};
  }
}

function writePractice(id, result) {
  try {
    const all = readPractice();
    if (result) all[id] = result;
    else delete all[id];
    window.localStorage.setItem(PRACTICE_KEY, JSON.stringify(all));
    return true;
  } catch {
    return false;
  }
}

const ASSESS_TEXT = { ok: '我做对了', retry: '还需要再练' };

function buildPractice(group, practiceId) {
  const steps = h('ol', { class: 'practice-steps' });
  const wrapper = h('section', { class: 'practice', 'aria-label': '练习答题区', 'data-practice': practiceId ?? '', 'data-step': 'try' },
    h('div', { class: 'practice-head' }, h('p', { class: 'practice-title' }, '练习答题区'), h('p', { class: 'practice-badge', hidden: true })),
    steps);
  group[0].before(wrapper);
  steps.append(h('li', { class: 'practice-step', 'data-step-kind': 'try' },
    h('span', { class: 'practice-dot', 'aria-hidden': 'true' }),
    h('div', { class: 'practice-try' }, h('p', { class: 'practice-step-title' }, '先自己做'), h('p', { class: 'practice-step-text' }, '按上面的要求动手完成，卡住时再展开提示。'))));
  for (const details of group) {
    const summary = details.querySelector(':scope > summary');
    if (!summary) continue;
    steps.append(h('li', { class: 'practice-step', 'data-step-kind': details.dataset.disclosure }, h('span', { class: 'practice-dot', 'aria-hidden': 'true' }), details));
    summary.addEventListener('click', (event) => {
      event.preventDefault();
      setDetailsOpen(details, !details.open);
    });
    details.addEventListener('toggle', update);
  }

  const badge = wrapper.querySelector('.practice-badge');
  const answer = group.find((details) => details.dataset.disclosure === 'answer');
  let assessButtons = [];
  let message;
  if (answer && practiceId) {
    message = h('p', { class: 'practice-message', 'aria-live': 'polite' });
    assessButtons = Object.entries(ASSESS_TEXT).map(([value, label]) => {
      const button = h('button', { class: 'js-button practice-assess-button', type: 'button', 'data-variant': 'secondary', 'data-assess': value, 'aria-pressed': 'false' }, label);
      button.addEventListener('click', () => {
        const next = button.getAttribute('aria-pressed') === 'true' ? null : value;
        const saved = writePractice(practiceId, next);
        render(next);
        message.textContent = !saved ? '浏览器没有允许本地存储，这次自评不会保留。'
          : next === 'ok' ? '已记在本机：这道练习做对了。'
            : next === 'retry' ? '已记在本机：之后回来再练一遍。' : '已清除这道练习的自评。';
      });
      return button;
    });
    answer.append(h('div', { class: 'practice-assess', role: 'group', 'aria-label': '自评' },
      h('p', { class: 'practice-assess-title' }, '对照完了？给自己打个分'), h('div', { class: 'practice-assess-actions' }, ...assessButtons), message));
  }

  function render(result) {
    for (const button of assessButtons) button.setAttribute('aria-pressed', String(button.dataset.assess === result));
    badge.hidden = !result;
    badge.replaceChildren(result ? h('span', { class: 'js-status', 'data-tone': result === 'ok' ? 'ok' : 'warn' }, ASSESS_TEXT[result]) : '');
    wrapper.dataset.result = result ?? '';
  }

  function update() {
    const open = (kind) => group.some((details) => details.dataset.disclosure === kind && details.open);
    wrapper.dataset.step = open('answer') ? 'answer' : open('hint') ? 'hint' : 'try';
  }

  render(practiceId ? readPractice()[practiceId] : undefined);
  update();
}

function setupPractice(content, lessonId) {
  const groups = [];
  for (const details of content.querySelectorAll('details[data-disclosure]:not(.lab-fold)')) {
    if (details.closest('.lab-ui')) continue;
    const last = groups.at(-1);
    if (last && last.at(-1) === details.previousElementSibling) last.push(details);
    else groups.push([details]);
  }
  groups.forEach((group, index) => buildPractice(group, lessonId ? `${lessonId}-${index + 1}` : null));
}

function init() {
  const content = document.querySelector('.sl-markdown-content');
  if (!content || content.hasAttribute('data-reveal-init')) return;
  content.setAttribute('data-reveal-init', '');
  const lessonId = document.querySelector('[data-reveal-lesson]')?.getAttribute('data-reveal-lesson') ?? null;
  setupLegacyPredicts(content);
  setupComponentPredicts(content);
  setupPractice(content, lessonId);
}

init();
