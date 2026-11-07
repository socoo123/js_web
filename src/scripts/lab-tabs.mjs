// Lab 页：课程标签（WAI-ARIA tabs）、hash 深链、Lab 头部的进度环与「开始/继续」按钮。
// 禁用 JS 时什么都不隐藏：标签是页内锚点目录，所有课的面板依次显示。只读本地进度，不写入。
import { PROGRESS_EVENT, PROGRESS_KEY, BACKUP_KEY, readProgress } from '../lib/progress.mjs';

const STEP_ID = /^l[1-5]-c\d{2}-[1-9]$/;
const controllers = new Map();
let storage;
try { storage = window.localStorage; } catch { /* 存储受限时只按第一课显示。 */ }

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const idsOf = (element, name) => (element.dataset[name] ?? '').split(' ').filter(Boolean);

function completedLessons() {
  const state = readProgress(storage);
  return state.status === 'ready' ? new Set(state.progress.completed) : null;
}

function parseJson(text, fallback) {
  try { return JSON.parse(text ?? ''); } catch { return fallback; }
}

/** hash → 页面元素；兼容不带 step- 前缀的步骤 id（#l3-c21-1）。 */
function targetFor(hash) {
  let id;
  try { id = decodeURIComponent(hash.replace(/^#/, '')); } catch { return null; }
  if (!id) return null;
  return document.getElementById(id) ?? (STEP_ID.test(id) ? document.getElementById(`step-${id}`) : null);
}

function setupTabs(root) {
  if (controllers.has(root)) return;
  const list = root.querySelector('[data-tab-list]');
  const tabs = [...list.querySelectorAll('[data-tab]')];
  const panels = tabs.map((tab) => document.getElementById(tab.dataset.tab));
  if (!tabs.length || panels.some((panel) => !panel)) return;
  list.setAttribute('role', 'tablist');
  list.setAttribute('aria-label', root.dataset.tabsLabel ?? '课程');
  for (const item of list.children) item.setAttribute('role', 'presentation');
  tabs.forEach((tab, index) => {
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', panels[index].id);
    panels[index].setAttribute('role', 'tabpanel');
    panels[index].setAttribute('aria-labelledby', tab.id);
    panels[index].tabIndex = 0;
  });
  root.classList.add('is-tabbed');
  let current = -1;

  function keepTabVisible(tab) {
    if (list.scrollWidth <= list.clientWidth) return;
    const left = tab.offsetLeft - (list.clientWidth - tab.offsetWidth) / 2;
    list.scrollTo({ left: Math.max(0, left), behavior: reduced() ? 'auto' : 'smooth' });
  }

  function select(index, { focus = false, animate = true } = {}) {
    if (index !== current) {
      current = index;
      tabs.forEach((tab, i) => {
        const on = i === index;
        tab.setAttribute('aria-selected', String(on));
        tab.tabIndex = on ? 0 : -1;
        panels[i].hidden = !on;
        panels[i].removeAttribute('data-entering');
      });
      if (animate && !reduced()) {
        const panel = panels[index];
        void panel.offsetWidth;
        panel.setAttribute('data-entering', '');
        panel.addEventListener('animationend', () => panel.removeAttribute('data-entering'), { once: true });
      }
      root.dataset.selected = tabs[index].dataset.lesson;
    }
    keepTabVisible(tabs[index]);
    if (focus) tabs[index].focus({ preventScroll: true });
  }

  list.addEventListener('keydown', (event) => {
    const index = tabs.indexOf(event.target.closest?.('[data-tab]'));
    if (index < 0) return;
    const last = tabs.length - 1;
    const next = { ArrowRight: index === last ? 0 : index + 1, ArrowLeft: index === 0 ? last : index - 1, Home: 0, End: last }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    select(next, { focus: true });
    history.replaceState(history.state, '', `#${tabs[next].dataset.tab}`);
  });

  const controller = {
    nav: root.querySelector('[data-tab-nav]') ?? list,
    /** @param {Element} element */
    owns: (element) => panels.findIndex((panel) => panel === element || panel.contains(element)),
    select,
    tab: (index) => tabs[index],
    lessons: tabs.map((tab) => tab.dataset.lesson),
  };
  controllers.set(root, controller);

  const target = targetFor(location.hash);
  const owned = target ? controller.owns(target) : -1;
  const done = completedLessons();
  const pending = done ? controller.lessons.findIndex((id) => !done.has(id)) : -1;
  select(owned >= 0 ? owned : Math.max(0, pending), { animate: false });
}

/** 选中目标所在的课程标签、展开所在折叠区，然后滚动到它。 */
function reveal(target, { scroll = true, smooth = true, focusTab = false } = {}) {
  let scrollTo = target;
  for (const controller of controllers.values()) {
    const index = controller.owns(target);
    if (index < 0) continue;
    controller.select(index, { focus: focusTab, animate: smooth });
    if (target.matches('[data-lesson-panel]')) scrollTo = controller.nav;
  }
  for (let fold = target.closest('details'); fold; fold = fold.parentElement?.closest('details')) fold.open = true;
  if (scroll) scrollTo.scrollIntoView({ block: 'start', behavior: smooth && !reduced() ? 'smooth' : 'auto' });
}

function onClick(event) {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const link = event.target instanceof Element ? event.target.closest('a[href*="#"]') : null;
  if (!link) return;
  const url = new URL(link.href, location.href);
  if (url.origin !== location.origin || url.pathname !== location.pathname || url.search !== location.search) return;
  const target = targetFor(url.hash);
  if (!target) return;
  const inPanel = [...controllers.values()].some((controller) => controller.owns(target) >= 0);
  const folded = Boolean(target.closest('details:not([open])'));
  if (!inPanel && !folded) return;
  event.preventDefault();
  const isTab = link.matches('[data-tab]');
  history[isTab ? 'replaceState' : 'pushState'](history.state, '', url.hash);
  reveal(target, { scroll: !isTab, focusTab: isTab || link.hasAttribute('data-tab-go') });
}

function renderTabs(done) {
  for (const root of document.querySelectorAll('[data-lab-tabs]')) {
    const tabs = [...root.querySelectorAll('[data-tab]')];
    const pending = done ? tabs.find((tab) => !done.has(tab.dataset.lesson)) : undefined;
    for (const tab of tabs) {
      const finished = Boolean(done?.has(tab.dataset.lesson));
      tab.toggleAttribute('data-done', finished);
      tab.toggleAttribute('data-next', tab === pending);
      const note = tab.querySelector('[data-tab-note]');
      if (note) note.textContent = finished ? '（已完成）' : tab === pending ? '（下一课）' : '';
    }
    for (const panel of root.querySelectorAll('[data-lesson-panel]')) {
      const mark = panel.querySelector('[data-panel-done]');
      if (mark) mark.hidden = !done?.has(panel.dataset.lessonPanel);
    }
  }
}

function renderHero(done) {
  for (const hero of document.querySelectorAll('[data-lab-hero]')) {
    const ids = idsOf(hero, 'labLessons');
    for (const element of hero.querySelectorAll('[data-tabs-js]')) element.hidden = !done;
    const next = hero.querySelector('[data-hero-next]');
    if (!done) continue;
    const count = ids.filter((id) => done.has(id)).length;
    const ring = hero.querySelector('[data-hero-ring]');
    ring?.style.setProperty('--ring', String(ids.length ? count / ids.length : 0));
    ring?.setAttribute('aria-label', `已完成 ${count} / ${ids.length} 课`);
    const ratio = hero.querySelector('[data-hero-ratio]');
    if (ratio) ratio.textContent = `${count}/${ids.length}`;
    const state = hero.querySelector('[data-hero-state]');
    if (state) state.textContent = count === 0 ? `${ids.length} 课，还没有标记完成的课` : count === ids.length ? `${ids.length} 课都已标记完成` : `已完成 ${count} / ${ids.length} 课`;
    hero.dataset.labState = count === 0 ? 'new' : count === ids.length ? 'done' : 'active';
    if (!next) continue;
    const targets = parseJson(next.dataset.targets, {});
    const pending = ids.find((id) => !done.has(id));
    const target = pending ? targets[pending] : targets.finish;
    if (!target) continue;
    next.href = target.href;
    next.querySelector('[data-hero-next-verb]').textContent = !pending ? '回顾' : count === 0 ? '开始' : '继续';
    next.querySelector('[data-hero-next-text]').textContent = target.text;
  }
}

function render() {
  const done = completedLessons();
  renderTabs(done);
  renderHero(done);
}

function initialize() {
  for (const root of document.querySelectorAll('[data-lab-tabs]')) setupTabs(root);
  render();
  const target = targetFor(location.hash);
  if (target) requestAnimationFrame(() => reveal(target, { smooth: false }));
}

if (!window.__jsWebLabTabs) {
  window.__jsWebLabTabs = true;
  document.addEventListener('click', onClick);
  window.addEventListener('hashchange', () => {
    const target = targetFor(location.hash);
    if (target) reveal(target);
  });
  window.addEventListener(PROGRESS_EVENT, render);
  window.addEventListener('storage', (event) => {
    if (event.key === null || event.key === PROGRESS_KEY || event.key === BACKUP_KEY) render();
  });
  window.addEventListener('pageshow', (event) => { if (event.persisted) render(); });
  document.addEventListener('astro:page-load', initialize);
}
initialize();
