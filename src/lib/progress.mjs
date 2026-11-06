import { LAB_STEP_IDS, RETIRED_LAB_STEP_IDS } from '../../labs/steps/ids.mjs';

// 键名沿用 v1：已有记录和备份都在这个键下，格式由记录里的 version 区分。
export const PROGRESS_KEY = 'js_web:progress:v1';
export const BACKUP_KEY = `${PROGRESS_KEY}:backup`;
export const DAMAGED_KEY = `${PROGRESS_KEY}:damaged`;
export const PROGRESS_EVENT = 'js_web:progress';
export const PROGRESS_VERSION = 2;
export const LESSON_IDS = Array.from({ length: 48 }, (_, i) => `C${String(i + 1).padStart(2, '0')}`);
export const LAB_STEPS = LAB_STEP_IDS;
export const STEP_IDS = [...Object.values(LAB_STEP_IDS).flat(), ...RETIRED_LAB_STEP_IDS];
export const MAX_IMPORT_SIZE = 64 * 1024;

export function emptyProgress() {
  return { version: PROGRESS_VERSION, completed: [], labSteps: [] };
}

function validIds(list, allowed) {
  return Array.isArray(list) && list.length <= allowed.length && list.every((id) => allowed.includes(id));
}

// v1 只有 completed，读取时补上空的 labSteps；写出一律是 v2。
export function parseProgress(raw) {
  if (typeof raw !== 'string' || raw.length > MAX_IMPORT_SIZE) throw new Error('进度文件过大或格式不正确。');
  let value;
  try { value = JSON.parse(raw); } catch { throw new Error('无法读取 JSON，请选择导出的进度文件。'); }
  if (!value || (value.version !== 1 && value.version !== 2) || !Array.isArray(value.completed)
    || (value.version === 2 && !Array.isArray(value.labSteps))) {
    throw new Error('进度文件版本或格式不正确，请选择本教程导出的文件。');
  }
  if (!validIds(value.completed, LESSON_IDS)) throw new Error('进度文件包含无效课号，请检查后重新导入。');
  const labSteps = value.version === 1 ? [] : value.labSteps;
  if (!validIds(labSteps, STEP_IDS)) throw new Error('进度文件包含无效的 Lab 步骤，请检查后重新导入。');
  const done = new Set(labSteps);
  return {
    version: PROGRESS_VERSION,
    completed: [...new Set(value.completed)].sort(),
    labSteps: STEP_IDS.filter((id) => done.has(id)),
  };
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

function announce(progress) {
  if (typeof window === 'undefined' || typeof window.dispatchEvent !== 'function') return;
  window.dispatchEvent(new CustomEvent(PROGRESS_EVENT, { detail: { progress: structuredClone(progress) } }));
}

// 先保留旧记录，主记录写入成功后界面才能显示保存成功。
export function writeProgress(storage, progress) {
  const normalized = parseProgress(JSON.stringify(progress));
  const raw = storage.getItem(PROGRESS_KEY);
  if (raw === null) {
    storage.setItem(BACKUP_KEY, JSON.stringify(normalized));
  } else {
    let damaged = false;
    try { parseProgress(raw); } catch { damaged = true; }
    storage.setItem(damaged ? DAMAGED_KEY : BACKUP_KEY, raw);
  }
  storage.setItem(PROGRESS_KEY, JSON.stringify(normalized));
  announce(normalized);
  return normalized;
}

function rebuild(completed, labSteps) {
  return parseProgress(JSON.stringify({ version: PROGRESS_VERSION, completed: [...completed], labSteps: [...labSteps] }));
}

export function markLesson(progress, id, completed) {
  if (!LESSON_IDS.includes(id)) throw new Error('无效课号。');
  const ids = new Set(progress.completed);
  if (completed) ids.add(id);
  else ids.delete(id);
  return rebuild(ids, progress.labSteps ?? []);
}

export function markLabStep(progress, stepId, done) {
  if (!STEP_IDS.includes(stepId)) throw new Error('无效的 Lab 步骤。');
  const ids = new Set(progress.labSteps ?? []);
  if (done) ids.add(stepId);
  else ids.delete(stepId);
  return rebuild(progress.completed, ids);
}

export function mergeProgress(current, imported) {
  return rebuild(
    new Set([...current.completed, ...imported.completed]),
    new Set([...(current.labSteps ?? []), ...(imported.labSteps ?? [])]),
  );
}
