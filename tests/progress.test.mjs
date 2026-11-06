import test from 'node:test';
import assert from 'node:assert/strict';
import {
  PROGRESS_KEY, BACKUP_KEY, DAMAGED_KEY, MAX_IMPORT_SIZE, PROGRESS_EVENT, STEP_IDS, LAB_STEPS,
  emptyProgress, parseProgress, readProgress, writeProgress, markLesson, markLabStep, mergeProgress,
} from '../src/lib/progress.mjs';

function storageFor(entries = {}) {
  const values = new Map(Object.entries(entries));
  return { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
}
const progress = (completed = [], labSteps = []) => ({ version: 2, completed, labSteps });
const v1 = (...completed) => ({ version: 1, completed });
const [STEP_A, STEP_B] = LAB_STEPS.L3;

test('首次访问不写存储，显示零进度', () => {
  const storage = storageFor();
  assert.deepEqual(readProgress(storage), { status: 'ready', progress: emptyProgress(), backup: null });
  assert.deepEqual(emptyProgress(), progress());
  assert.equal(storage.getItem(PROGRESS_KEY), null);
});

test('标记、撤销均不修改原值，课号保持排序', () => {
  const original = progress(['C02'], [STEP_A]);
  assert.deepEqual(markLesson(original, 'C01', true), progress(['C01', 'C02'], [STEP_A]));
  assert.deepEqual(markLesson(original, 'C02', false), progress([], [STEP_A]));
  assert.deepEqual(original, progress(['C02'], [STEP_A]));
  assert.throws(() => markLesson(original, 'C49', true));
});

test('v1 记录读取时无损升级为 v2，下一次写入保存 v2', () => {
  const storage = storageFor({ [PROGRESS_KEY]: JSON.stringify(v1('C03', 'C01')) });
  const state = readProgress(storage);
  assert.equal(state.status, 'ready');
  assert.deepEqual(state.progress, progress(['C01', 'C03']));
  writeProgress(storage, markLabStep(state.progress, STEP_A, true));
  assert.deepEqual(JSON.parse(storage.getItem(PROGRESS_KEY)), progress(['C01', 'C03'], [STEP_A]));
  assert.deepEqual(parseProgress(storage.getItem(BACKUP_KEY)), progress(['C01', 'C03']));
});

test('Lab 步骤勾选与取消，按步骤文件顺序保存，不改原值', () => {
  const original = progress(['C23']);
  const both = markLabStep(markLabStep(original, STEP_B, true), STEP_A, true);
  assert.deepEqual(both, progress(['C23'], [STEP_A, STEP_B]));
  assert.deepEqual(markLabStep(both, STEP_A, false), progress(['C23'], [STEP_B]));
  assert.deepEqual(markLabStep(both, STEP_A, true), both);
  assert.deepEqual(original, progress(['C23']));
  assert.ok(STEP_IDS.includes('l3-finish-1'));
  assert.deepEqual(markLabStep(original, 'l3-finish-1', true).labSteps, ['l3-finish-1']);
  assert.throws(() => markLabStep(original, 'l3-c99-1', true), /无效的 Lab 步骤/);
});

test('导入 v1 与 v2 都能去重合并，完整 48 课和全部步骤可往返', () => {
  const fromV1 = parseProgress(JSON.stringify(v1('C48', 'C01', 'C48')));
  assert.deepEqual(mergeProgress(progress(['C02'], [STEP_A]), fromV1), progress(['C01', 'C02', 'C48'], [STEP_A]));
  const fromV2 = parseProgress(JSON.stringify(progress(['C05'], [STEP_B, STEP_B])));
  assert.deepEqual(mergeProgress(progress(['C02'], [STEP_A]), fromV2), progress(['C02', 'C05'], [STEP_A, STEP_B]));
  const complete = progress(Array.from({ length: 48 }, (_, i) => `C${String(i + 1).padStart(2, '0')}`), [...STEP_IDS]);
  assert.deepEqual(parseProgress(JSON.stringify(complete)), complete);
});

for (const [name, raw] of [
  ['无效 JSON', '{'], ['空值', 'null'], ['未知版本', '{"version":3,"completed":[],"labSteps":[]}'],
  ['错误列表类型', '{"version":1,"completed":{}}'], ['无效课号', '{"version":1,"completed":["C49"]}'],
  ['非字符串课号', '{"version":1,"completed":[null]}'], ['超大文件', ' '.repeat(MAX_IMPORT_SIZE + 1)],
  ['v2 缺少步骤列表', '{"version":2,"completed":[]}'], ['v2 步骤列表类型错误', '{"version":2,"completed":[],"labSteps":"l3-c21-1"}'],
  ['不存在的步骤', '{"version":2,"completed":[],"labSteps":["l3-c99-1"]}'], ['非字符串步骤', '{"version":2,"completed":[],"labSteps":[1]}'],
]) {
  test(`拒绝${name}且不修改已有数据`, () => {
    const storage = storageFor({ [PROGRESS_KEY]: JSON.stringify(progress(['C03'], [STEP_A])) });
    assert.throws(() => parseProgress(raw));
    assert.deepEqual(readProgress(storage).progress, progress(['C03'], [STEP_A]));
  });
}

test('保存成功后，刷新能读回；备份保留上一次有效进度', () => {
  const storage = storageFor();
  writeProgress(storage, progress(['C01']));
  writeProgress(storage, progress(['C01', 'C02'], [STEP_A]));
  assert.deepEqual(readProgress(storage).progress, progress(['C01', 'C02'], [STEP_A]));
  assert.deepEqual(parseProgress(storage.getItem(BACKUP_KEY)), progress(['C01']));
});

test('每次写入成功都派发 js_web:progress 事件，失败时不派发', () => {
  const previous = globalThis.window;
  const target = new EventTarget();
  const seen = [];
  target.addEventListener(PROGRESS_EVENT, (event) => seen.push(event.detail.progress));
  globalThis.window = target;
  try {
    const storage = storageFor();
    writeProgress(storage, progress([], [STEP_A]));
    assert.throws(() => writeProgress(storage, progress([], ['l3-c99-1'])));
    assert.deepEqual(seen, [progress([], [STEP_A])]);
    seen[0].labSteps.push('changed');
    assert.deepEqual(readProgress(storage).progress, progress([], [STEP_A]));
  } finally {
    if (previous === undefined) delete globalThis.window;
    else globalThis.window = previous;
  }
});

test('损坏主记录不自动覆盖，恢复备份时保留原始文本与已勾选步骤', () => {
  const storage = storageFor({ [PROGRESS_KEY]: '{broken', [BACKUP_KEY]: JSON.stringify(progress(['C04'], [STEP_B])) });
  const state = readProgress(storage);
  assert.equal(state.status, 'damaged');
  assert.deepEqual(state.backup, progress(['C04'], [STEP_B]));
  assert.equal(storage.getItem(PROGRESS_KEY), '{broken');
  writeProgress(storage, state.backup);
  assert.deepEqual(readProgress(storage).progress, progress(['C04'], [STEP_B]));
  assert.equal(storage.getItem(DAMAGED_KEY), '{broken');
});

test('v1 备份也能用于恢复', () => {
  const storage = storageFor({ [PROGRESS_KEY]: 'bad', [BACKUP_KEY]: JSON.stringify(v1('C10')) });
  const state = readProgress(storage);
  assert.deepEqual(state.backup, progress(['C10']));
  writeProgress(storage, state.backup);
  assert.deepEqual(readProgress(storage).progress, progress(['C10']));
});

test('主副记录均损坏时，可导入文件或重新开始', () => {
  for (const replacement of [progress(['C48'], [STEP_A]), emptyProgress()]) {
    const storage = storageFor({ [PROGRESS_KEY]: 'bad', [BACKUP_KEY]: 'also bad' });
    assert.equal(readProgress(storage).backup, null);
    writeProgress(storage, replacement);
    assert.deepEqual(readProgress(storage).progress, replacement);
    assert.equal(storage.getItem(DAMAGED_KEY), 'bad');
  }
});

test('无存储权限时明确不可用，写入失败不丢失原进度', () => {
  assert.equal(readProgress(undefined).status, 'unavailable');
  assert.equal(readProgress({ getItem() { throw new Error('denied'); } }).status, 'unavailable');
  const storage = storageFor({ [PROGRESS_KEY]: JSON.stringify(progress(['C01'])) });
  const set = storage.setItem;
  storage.setItem = (key, value) => { if (key === PROGRESS_KEY) throw new Error('quota'); set(key, value); };
  assert.throws(() => writeProgress(storage, progress(['C01'], [STEP_A])));
  assert.deepEqual(readProgress(storage).progress, progress(['C01']));
});

test('保留损坏记录失败时不覆盖原记录', () => {
  const storage = storageFor({ [PROGRESS_KEY]: 'broken' });
  storage.setItem = () => { throw new Error('quota'); };
  assert.throws(() => writeProgress(storage, emptyProgress()));
  assert.equal(storage.getItem(PROGRESS_KEY), 'broken');
});

test('待保存进度非法时，主记录、备份与损坏原文逐字不变', () => {
  const entries = { [PROGRESS_KEY]: JSON.stringify(progress(['C01'])), [BACKUP_KEY]: JSON.stringify(v1('C02')), [DAMAGED_KEY]: '{old' };
  const storage = storageFor(entries);
  assert.throws(() => writeProgress(storage, progress(['C49'])));
  assert.throws(() => writeProgress(storage, progress([], ['l3-c99-1'])));
  for (const [key, raw] of Object.entries(entries)) assert.equal(storage.getItem(key), raw);
});

test('备份写满时不尝试覆盖主记录，失败后仍能读取原进度', () => {
  const original = JSON.stringify(v1('C01'), null, 2);
  const backup = JSON.stringify(progress(['C02']));
  const storage = storageFor({ [PROGRESS_KEY]: original, [BACKUP_KEY]: backup });
  const writes = [];
  const set = storage.setItem;
  storage.setItem = (key, value) => { writes.push(key); if (key === BACKUP_KEY) throw new Error('quota'); set(key, value); };
  assert.throws(() => writeProgress(storage, progress(['C01', 'C03'])));
  assert.deepEqual(writes, [BACKUP_KEY]);
  assert.equal(storage.getItem(PROGRESS_KEY), original);
  assert.equal(storage.getItem(BACKUP_KEY), backup);
  assert.deepEqual(readProgress(storage).progress, progress(['C01']));
});

test('恢复时主记录写满，损坏原文与有效备份仍可再次恢复', () => {
  const backup = JSON.stringify(progress(['C04'], [STEP_A]));
  const storage = storageFor({ [PROGRESS_KEY]: '{broken', [BACKUP_KEY]: backup });
  const set = storage.setItem;
  storage.setItem = (key, value) => { if (key === PROGRESS_KEY) throw new Error('quota'); set(key, value); };
  assert.throws(() => writeProgress(storage, progress(['C04'], [STEP_A])));
  assert.equal(storage.getItem(PROGRESS_KEY), '{broken');
  assert.equal(storage.getItem(DAMAGED_KEY), '{broken');
  assert.equal(storage.getItem(BACKUP_KEY), backup);
  storage.setItem = set;
  writeProgress(storage, readProgress(storage).backup);
  assert.deepEqual(readProgress(storage).progress, progress(['C04'], [STEP_A]));
});
