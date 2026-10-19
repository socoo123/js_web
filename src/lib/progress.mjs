export const PROGRESS_KEY = 'js_web:progress:v1';
export const BACKUP_KEY = `${PROGRESS_KEY}:backup`;
export const DAMAGED_KEY = `${PROGRESS_KEY}:damaged`;
export const LESSON_IDS = Array.from({ length: 48 }, (_, i) => `C${String(i + 1).padStart(2, '0')}`);
export const MAX_IMPORT_SIZE = 64 * 1024;

export function emptyProgress() {
  return { version: 1, completed: [] };
}

export function parseProgress(raw) {
  if (typeof raw !== 'string' || raw.length > MAX_IMPORT_SIZE) throw new Error('进度文件过大或格式不正确。');
  let value;
  try { value = JSON.parse(raw); } catch { throw new Error('无法读取 JSON，请选择导出的进度文件。'); }
  if (!value || value.version !== 1 || !Array.isArray(value.completed)) {
    throw new Error('进度文件版本或格式不正确，请选择本教程导出的文件。');
  }
  if (value.completed.length > LESSON_IDS.length || value.completed.some((id) => !LESSON_IDS.includes(id))) {
    throw new Error('进度文件包含无效课号，请检查后重新导入。');
  }
  return { version: 1, completed: [...new Set(value.completed)].sort() };
}

export function readProgress(storage) {
  try {
    const raw = storage.getItem(PROGRESS_KEY);
    if (raw === null) return { status: 'ready', progress: emptyProgress(), backup: null };
    try {
      return { status: 'ready', progress: parseProgress(raw), backup: null };
    } catch {
      let backup = null;
      try { backup = parseProgress(storage.getItem(BACKUP_KEY)); } catch { /* 仍可通过文件恢复。 */ }
      return { status: 'damaged', progress: emptyProgress(), backup };
    }
  } catch {
    return { status: 'unavailable', progress: emptyProgress(), backup: null };
  }
}

// 先保留旧记录，主记录写入成功后界面才能显示保存成功。
export function writeProgress(storage, progress) {
  const normalized = parseProgress(JSON.stringify(progress));
  const raw = storage.getItem(PROGRESS_KEY);
  if (raw === null) {
    storage.setItem(BACKUP_KEY, JSON.stringify(normalized));
  } else {
    try { parseProgress(raw); } catch {
      storage.setItem(DAMAGED_KEY, raw);
      storage.setItem(PROGRESS_KEY, JSON.stringify(normalized));
      return normalized;
    }
    storage.setItem(BACKUP_KEY, raw);
  }
  storage.setItem(PROGRESS_KEY, JSON.stringify(normalized));
  return normalized;
}

export function markLesson(progress, id, completed) {
  if (!LESSON_IDS.includes(id)) throw new Error('无效课号。');
  const ids = new Set(progress.completed);
  if (completed) ids.add(id);
  else ids.delete(id);
  return parseProgress(JSON.stringify({ version: 1, completed: [...ids] }));
}

export function mergeProgress(current, imported) {
  return parseProgress(JSON.stringify({ version: 1, completed: [...new Set([...current.completed, ...imported.completed])] }));
}
