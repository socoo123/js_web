import test from 'node:test';
import assert from 'node:assert/strict';
import {
  PROGRESS_KEY, BACKUP_KEY, DAMAGED_KEY, MAX_IMPORT_SIZE,
  emptyProgress, parseProgress, readProgress, writeProgress, markLesson, mergeProgress,
} from '../src/lib/progress.mjs';

function storageFor(entries = {}) {
  const values = new Map(Object.entries(entries));
  return { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
}
const progress = (...completed) => ({ version: 1, completed });

test('首次访问不写存储，显示零进度', () => {
  const storage = storageFor();
  assert.deepEqual(readProgress(storage), { status: 'ready', progress: emptyProgress(), backup: null });
  assert.equal(storage.getItem(PROGRESS_KEY), null);
});

test('标记、撤销均不修改原值，课号保持排序', () => {
  const original = progress('C02');
  assert.deepEqual(markLesson(original, 'C01', true), progress('C01', 'C02'));
  assert.deepEqual(markLesson(original, 'C02', false), emptyProgress());
  assert.deepEqual(original, progress('C02'));
  assert.throws(() => markLesson(original, 'C49', true));
});

test('导入去重、合并已有进度，完整 48 课可往返', () => {
  const imported = parseProgress(JSON.stringify(progress('C48', 'C01', 'C48')));
  assert.deepEqual(mergeProgress(progress('C02'), imported), progress('C01', 'C02', 'C48'));
  const complete = progress(...Array.from({ length: 48 }, (_, i) => `C${String(i + 1).padStart(2, '0')}`));
  assert.deepEqual(parseProgress(JSON.stringify(complete)), complete);
});

for (const [name, raw] of [
  ['无效 JSON', '{'], ['空值', 'null'], ['未知版本', '{"version":2,"completed":[]}'],
  ['错误列表类型', '{"version":1,"completed":{}}'], ['无效课号', '{"version":1,"completed":["C49"]}'],
  ['非字符串课号', '{"version":1,"completed":[null]}'], ['超大文件', ' '.repeat(MAX_IMPORT_SIZE + 1)],
]) {
  test(`拒绝${name}且不修改已有数据`, () => {
    const storage = storageFor({ [PROGRESS_KEY]: JSON.stringify(progress('C03')) });
    assert.throws(() => parseProgress(raw));
    assert.deepEqual(readProgress(storage).progress, progress('C03'));
  });
}

test('保存成功后，刷新能读回；备份保留上一次有效进度', () => {
  const storage = storageFor();
  writeProgress(storage, progress('C01'));
  writeProgress(storage, progress('C01', 'C02'));
  assert.deepEqual(readProgress(storage).progress, progress('C01', 'C02'));
  assert.deepEqual(parseProgress(storage.getItem(BACKUP_KEY)), progress('C01'));
});

test('损坏主记录不自动覆盖，恢复备份时保留原始文本', () => {
  const storage = storageFor({ [PROGRESS_KEY]: '{broken', [BACKUP_KEY]: JSON.stringify(progress('C04')) });
  const state = readProgress(storage);
  assert.equal(state.status, 'damaged');
  assert.deepEqual(state.backup, progress('C04'));
  assert.equal(storage.getItem(PROGRESS_KEY), '{broken');
  writeProgress(storage, state.backup);
  assert.deepEqual(readProgress(storage).progress, progress('C04'));
  assert.equal(storage.getItem(DAMAGED_KEY), '{broken');
});

test('主副记录均损坏时，可导入文件或重新开始', () => {
  for (const replacement of [progress('C48'), emptyProgress()]) {
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
  const storage = storageFor({ [PROGRESS_KEY]: JSON.stringify(progress('C01')) });
  const set = storage.setItem;
  storage.setItem = (key, value) => { if (key === PROGRESS_KEY) throw new Error('quota'); set(key, value); };
  assert.throws(() => writeProgress(storage, progress('C01', 'C02')));
  assert.deepEqual(readProgress(storage).progress, progress('C01'));
});

test('保留损坏记录失败时不覆盖原记录', () => {
  const storage = storageFor({ [PROGRESS_KEY]: 'broken' });
  storage.setItem = () => { throw new Error('quota'); };
  assert.throws(() => writeProgress(storage, emptyProgress()));
  assert.equal(storage.getItem(PROGRESS_KEY), 'broken');
});

test('待保存进度非法时，主记录、备份与损坏原文逐字不变', () => {
  const entries = { [PROGRESS_KEY]: JSON.stringify(progress('C01')), [BACKUP_KEY]: JSON.stringify(progress('C02')), [DAMAGED_KEY]: '{old' };
  const storage = storageFor(entries);
  assert.throws(() => writeProgress(storage, progress('C49')));
  for (const [key, raw] of Object.entries(entries)) assert.equal(storage.getItem(key), raw);
});

test('备份写满时不尝试覆盖主记录，失败后仍能读取原进度', () => {
  const original = JSON.stringify(progress('C01'), null, 2);
  const backup = JSON.stringify(progress('C02'));
  const storage = storageFor({ [PROGRESS_KEY]: original, [BACKUP_KEY]: backup });
  const writes = [];
  const set = storage.setItem;
  storage.setItem = (key, value) => { writes.push(key); if (key === BACKUP_KEY) throw new Error('quota'); set(key, value); };
  assert.throws(() => writeProgress(storage, progress('C01', 'C03')));
  assert.deepEqual(writes, [BACKUP_KEY]);
  assert.equal(storage.getItem(PROGRESS_KEY), original);
  assert.equal(storage.getItem(BACKUP_KEY), backup);
  assert.deepEqual(readProgress(storage).progress, progress('C01'));
});

test('恢复时主记录写满，损坏原文与有效备份仍可再次恢复', () => {
  const backup = JSON.stringify(progress('C04'));
  const storage = storageFor({ [PROGRESS_KEY]: '{broken', [BACKUP_KEY]: backup });
  const set = storage.setItem;
  storage.setItem = (key, value) => { if (key === PROGRESS_KEY) throw new Error('quota'); set(key, value); };
  assert.throws(() => writeProgress(storage, progress('C04')));
  assert.equal(storage.getItem(PROGRESS_KEY), '{broken');
  assert.equal(storage.getItem(DAMAGED_KEY), '{broken');
  assert.equal(storage.getItem(BACKUP_KEY), backup);
  storage.setItem = set;
  writeProgress(storage, readProgress(storage).backup);
  assert.deepEqual(readProgress(storage).progress, progress('C04'));
});
