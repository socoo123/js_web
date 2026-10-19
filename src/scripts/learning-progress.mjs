import {
  PROGRESS_KEY, BACKUP_KEY, MAX_IMPORT_SIZE, LESSON_IDS,
  emptyProgress, parseProgress, readProgress, writeProgress, markLesson, mergeProgress,
} from '../lib/progress.mjs';

function initializeProgress(panel) {
  if (panel.dataset.initialized) return;
  panel.dataset.initialized = 'true';
  const find = (name) => panel.querySelector(`[data-progress-${name}]`);
  const lessonId = panel.dataset.lesson;
  let storage;
  try { storage = window.localStorage; } catch { /* 存储受限时保留阅读功能。 */ }
  let state;

  function message(text, error = false) {
    find('message').textContent = text;
    find('message').toggleAttribute('data-error', error);
  }

  function render() {
    state = readProgress(storage);
    const ready = state.status === 'ready';
    const count = state.progress.completed.length;
    find('summary').textContent = ready
      ? `${lessonId ? `${lessonId} ${state.progress.completed.includes(lessonId) ? '已完成' : '未完成'} · ` : ''}已完成 ${count} / ${LESSON_IDS.length} 课`
      : '学习进度暂不可用';
    find('meter').value = count;
    find('meter').hidden = !ready;
    if (find('toggle')) {
      const done = state.progress.completed.includes(lessonId);
      find('toggle').textContent = done ? '撤销完成' : '标记完成';
      find('toggle').setAttribute('aria-pressed', String(done));
      find('toggle').disabled = !ready;
    }
    if (find('export')) find('export').disabled = !ready;
    if (find('import')) find('import').disabled = state.status === 'unavailable';
    find('restore').hidden = state.status !== 'damaged' || !state.backup;
    find('restart').hidden = state.status !== 'damaged';
    for (const badge of document.querySelectorAll('[data-lesson-status]')) {
      badge.hidden = false;
      badge.textContent = ready ? (state.progress.completed.includes(badge.dataset.lessonStatus) ? ' · 已完成' : ' · 未完成') : ' · 进度暂不可用';
      badge.classList.toggle('lesson-completed', ready && state.progress.completed.includes(badge.dataset.lessonStatus));
    }
    if (state.status === 'damaged') {
      message('本地进度记录损坏。可以恢复本地备份、到学习路线导入文件，或重新开始。原记录会保留。', true);
    } else if (state.status === 'unavailable') {
      message('浏览器未允许保存进度。请允许网站使用本地存储后刷新；课程仍可正常阅读。', true);
    } else {
      message('');
    }
  }

  function save(progress, success) {
    try {
      writeProgress(storage, progress);
      render();
      message(success);
    } catch {
      render();
      message('保存失败，进度未更新。请检查浏览器存储空间或权限后重试。', true);
    }
  }

  find('toggle')?.addEventListener('click', () => {
    render();
    if (state.status !== 'ready') return;
    const done = state.progress.completed.includes(lessonId);
    save(markLesson(state.progress, lessonId, !done), done ? '已撤销本课的完成标记。' : '本课已标记完成。');
  });

  find('export')?.addEventListener('click', () => {
    render();
    if (state.status !== 'ready') return;
    const blob = new Blob([JSON.stringify(state.progress, null, 2) + '\n'], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'js-web-progress.json';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    message('已导出进度文件。');
  });

  find('import')?.addEventListener('click', () => find('file').click());
  find('file')?.addEventListener('change', async (event) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;
    try {
      if (file.size > MAX_IMPORT_SIZE) throw new Error('文件过大，请选择小于 64 KB 的进度 JSON 文件。');
      const imported = parseProgress(await file.text());
      render();
      if (state.status === 'unavailable') return;
      const current = state.status === 'ready' ? state.progress : (state.backup ?? emptyProgress());
      save(mergeProgress(current, imported), '已导入并合并进度。');
    } catch (error) {
      message(error.message, true);
    } finally {
      input.value = '';
    }
  });

  find('restore').addEventListener('click', () => {
    render();
    if (state.status === 'damaged' && state.backup) {
      save(state.backup, '已从本地备份恢复，损坏记录已保留。');
      (find('toggle') ?? find('import')).focus();
    }
  });
  find('restart').addEventListener('click', () => {
    render();
    if (state.status === 'damaged' && window.confirm('重新开始学习进度？损坏的原记录会保留，已完成课程可重新标记。')) {
      save(emptyProgress(), '已重新开始，损坏记录已保留。');
      (find('toggle') ?? find('import')).focus();
    }
  });
  window.addEventListener('storage', (event) => {
    if (event.key === null || event.key === PROGRESS_KEY || event.key === BACKUP_KEY) render();
  });
  render();
  find('controls').hidden = false;
}

function initialize() {
  for (const panel of document.querySelectorAll('[data-progress]')) initializeProgress(panel);
}
initialize();
document.addEventListener('astro:page-load', initialize);
