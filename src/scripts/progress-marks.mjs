// 只读本地进度，给侧栏、Lab 卡片、「继续上次学习」和路线周进度加标记；不写入存储。
// 禁用 JS 或存储不可用时，这些位置保持静态链接与文字。
import { PROGRESS_EVENT, readProgress } from '../lib/progress.mjs';

function readCompleted() {
  let storage;
  try { storage = window.localStorage; } catch { /* 存储被禁用时只显示静态内容。 */ }
  const state = readProgress(storage);
  return state.status === 'ready' ? new Set(state.progress.completed) : null;
}

const idsOf = (element, name) => (element.dataset[name] ?? '').split(/\s+/).filter(Boolean);

function markSidebar(done) {
  for (const link of document.querySelectorAll('a[data-sidebar-lesson]')) {
    const finished = Boolean(done?.has(link.dataset.sidebarLesson));
    link.toggleAttribute('data-done', finished);
    let note = link.querySelector('.sidebar-done-note');
    if (finished && !note) {
      note = document.createElement('span');
      note.className = 'sidebar-done-note js-visually-hidden';
      note.textContent = '（已完成）';
      link.append(note);
    } else if (!finished) note?.remove();
  }
  for (const link of document.querySelectorAll('a[data-sidebar-lab]')) {
    const ids = idsOf(link, 'labLessons');
    let pill = link.querySelector('.sidebar-lab-progress');
    if (!done) { pill?.remove(); continue; }
    if (!pill) {
      pill = document.createElement('span');
      pill.className = 'sidebar-lab-progress';
      pill.setAttribute('aria-hidden', 'true');
      link.append(pill);
    }
    const count = ids.filter((id) => done.has(id)).length;
    pill.textContent = `${count}/${ids.length}`;
    link.toggleAttribute('data-lab-complete', count === ids.length);
  }
}

function lessonIndex() {
  const source = document.querySelector('script[data-lesson-index]');
  if (!source) return [];
  try { return JSON.parse(source.textContent ?? '[]'); } catch { return []; }
}

function markLabCards(done, lessons) {
  const byId = new Map(lessons.map((lesson) => [lesson.id, lesson]));
  for (const card of document.querySelectorAll('[data-lab-card]')) {
    const ids = idsOf(card, 'labLessons');
    const ring = card.querySelector('[data-lab-ring]');
    const next = card.querySelector('[data-card-next]');
    const action = card.querySelector('[data-lab-action]');
    if (!done) {
      if (ring) ring.hidden = true;
      if (next) next.hidden = true;
      continue;
    }
    const count = ids.filter((id) => done.has(id)).length;
    const pending = byId.get(ids.find((id) => !done.has(id)));
    card.dataset.labState = count === 0 ? 'new' : count === ids.length ? 'done' : 'active';
    if (ring) {
      ring.hidden = false;
      ring.style.setProperty('--ring', String(count / ids.length));
      ring.querySelector('[data-lab-ring-text]').textContent = `${count}/${ids.length}`;
      ring.setAttribute('aria-label', `已完成 ${count} / ${ids.length} 课`);
    }
    if (action) action.textContent = count === 0 ? '开始' : count === ids.length ? '回顾' : '继续';
    if (next) {
      const link = next.querySelector('a');
      next.hidden = !pending || count === 0;
      if (pending && link) {
        link.href = pending.href;
        link.textContent = `${pending.id} ${pending.title}`;
      }
    }
  }
}

function markContinue(done, lessons) {
  for (const box of document.querySelectorAll('[data-continue]')) {
    if (!done || !lessons.length) { box.hidden = true; continue; }
    const pending = lessons.find((lesson) => !done.has(lesson.id));
    const lesson = pending ?? lessons.at(-1);
    const state = done.size === 0 ? 'new' : pending ? 'active' : 'done';
    box.dataset.continueState = state;
    box.querySelector('[data-continue-kicker]').textContent = state === 'new' ? '还没有本地进度' : state === 'done' ? `48 课都已标记完成` : `已完成 ${done.size} / ${lessons.length} 课 · 下一课`;
    const title = box.querySelector('[data-continue-lesson]');
    title.textContent = state === 'done' ? '回顾 L5 的交付清单' : `${lesson.id} ${lesson.title}`;
    title.href = state === 'done' ? lesson.labHref : lesson.href;
    const lab = box.querySelector('[data-continue-lab]');
    lab.textContent = `${lesson.labId} ${lesson.labTitle}`;
    lab.href = lesson.labHref;
    box.hidden = false;
  }
}

function markCounts(done) {
  for (const counter of document.querySelectorAll('[data-done-count]')) {
    const ids = idsOf(counter, 'doneCount');
    if (!done) { counter.hidden = true; continue; }
    const count = ids.filter((id) => done.has(id)).length;
    counter.textContent = `已完成 ${count} / ${ids.length} 课`;
    counter.toggleAttribute('data-complete', count === ids.length);
    counter.hidden = false;
  }
}

function render() {
  const done = readCompleted();
  const lessons = lessonIndex();
  markSidebar(done);
  markLabCards(done, lessons);
  markContinue(done, lessons);
  markCounts(done);
}

render();
window.addEventListener('storage', render);
window.addEventListener(PROGRESS_EVENT, render);
window.addEventListener('pageshow', (event) => { if (event.persisted) render(); });
