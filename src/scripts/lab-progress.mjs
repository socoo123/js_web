import {
  PROGRESS_KEY, BACKUP_KEY, PROGRESS_EVENT, readProgress, writeProgress, markLabStep,
} from '../lib/progress.mjs';

let storage;
try { storage = window.localStorage; } catch { /* 存储受限时保留阅读功能。 */ }

const idsOf = (element) => (element.dataset.ids ?? '').split(' ').filter(Boolean);

function parseJson(text, fallback) {
  try { return JSON.parse(text ?? ''); } catch { return fallback; }
}

function stateText(status) {
  if (status === 'damaged') return '本地学习进度记录损坏，勾选暂停使用。可到学习路线页从备份恢复或导入进度文件。';
  if (status === 'unavailable') return '浏览器未允许保存进度，勾选暂不可用；内容仍可正常阅读。';
  return '';
}

function render() {
  const state = readProgress(storage);
  const ready = state.status === 'ready';
  const done = new Set(ready ? state.progress.labSteps : []);
  for (const element of document.querySelectorAll('[data-lab-js]')) element.hidden = false;
  for (const input of document.querySelectorAll('[data-lab-step-toggle]')) {
    input.checked = done.has(input.dataset.labStepToggle);
    input.disabled = !ready;
    input.closest('[data-lab-step-item]')?.classList.toggle('is-done', input.checked);
  }
  for (const summary of document.querySelectorAll('[data-lab-progress]')) {
    const ids = idsOf(summary);
    const count = ids.filter((id) => done.has(id)).length;
    const unit = summary.dataset.unit ?? '步';
    const countText = summary.querySelector('[data-lab-progress-count]');
    if (countText) countText.textContent = ready ? `已勾选 ${count} / ${ids.length} ${unit}` : '进度暂不可用';
    const ring = summary.querySelector('[data-lab-progress-ring]');
    if (ring) {
      ring.style.setProperty('--done', String(ids.length ? count / ids.length : 0));
      ring.querySelector('[data-lab-progress-ratio]').textContent = `${count}/${ids.length}`;
    }
    const next = summary.querySelector('[data-lab-progress-next]');
    if (next && ready) {
      const targets = parseJson(next.dataset.targets, {});
      const pending = ids.find((id) => !done.has(id));
      const target = pending ? targets[pending] : { href: next.dataset.doneHref, text: next.dataset.doneText };
      if (target?.href) {
        next.href = target.href;
        next.textContent = target.text;
      }
    }
  }
  for (const element of document.querySelectorAll('[data-lab-progress-state]')) {
    element.textContent = stateText(state.status);
    element.hidden = ready;
  }
  return state;
}

function announce(input, text, error = false) {
  const message = input.closest('[data-lab-scope]')?.querySelector('[data-lab-message]');
  if (!message) return;
  message.textContent = text;
  message.toggleAttribute('data-error', error);
}

function onChange(event) {
  const input = event.target instanceof Element ? event.target.closest('[data-lab-step-toggle]') : null;
  if (!input) return;
  const state = readProgress(storage);
  const label = input.dataset.label ?? '这一项';
  if (state.status !== 'ready') {
    render();
    announce(input, stateText(state.status), true);
    return;
  }
  try {
    const saved = writeProgress(storage, markLabStep(state.progress, input.dataset.labStepToggle, input.checked));
    const summary = input.closest('[data-lab-root]')?.querySelector('[data-lab-progress]');
    const ids = summary ? idsOf(summary) : [];
    const count = ids.filter((id) => saved.labSteps.includes(id)).length;
    const total = ids.length ? `，已勾选 ${count} / ${ids.length} ${summary.dataset.unit ?? '步'}` : '';
    announce(input, input.checked ? `已记录你确认完成${label}${total}。` : `已取消${label}的勾选${total}。`);
  } catch {
    render();
    announce(input, '保存失败，勾选未更新。请检查浏览器存储空间或权限后重试。', true);
  }
}

function setupReturn(floater) {
  if (floater.dataset.ready) return;
  floater.dataset.ready = 'true';
  const from = new URLSearchParams(window.location.search).get('from');
  const returns = parseJson(floater.dataset.returns, {});
  const target = from && Object.hasOwn(returns, from) ? returns[from] : null;
  if (!target) return;
  const link = floater.querySelector('[data-lab-return-link]');
  link.href = target.href;
  floater.querySelector('[data-lab-return-text]').textContent = `返回 ${target.lab} 第 ${target.number} 步`;
  floater.querySelector('[data-lab-return-title]').textContent = target.title;
  floater.hidden = false;
  document.documentElement.classList.add('has-lab-return');
  const close = () => {
    floater.hidden = true;
    document.documentElement.classList.remove('has-lab-return');
    const url = new URL(window.location.href);
    url.searchParams.delete('from');
    window.history.replaceState(window.history.state, '', url);
    document.querySelector('[data-lab-bar] a')?.focus();
  };
  floater.querySelector('[data-lab-return-close]').addEventListener('click', close);
  floater.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') close();
  });
}

function initialize() {
  render();
  for (const floater of document.querySelectorAll('[data-lab-return]')) setupReturn(floater);
}

if (!window.__jsWebLabProgress) {
  window.__jsWebLabProgress = true;
  document.addEventListener('change', onChange);
  window.addEventListener(PROGRESS_EVENT, () => render());
  window.addEventListener('storage', (event) => {
    if (event.key === null || event.key === PROGRESS_KEY || event.key === BACKUP_KEY) render();
  });
  document.addEventListener('astro:page-load', initialize);
}
initialize();
