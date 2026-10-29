import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { spawnSync } from 'node:child_process';
import { repo, catalog, materialize, bundle, safePath, hash } from '../labs/snapshots.mjs';
import { validateBundle } from '../labs/inventory/tools/reference.mjs';

test('48 个稳定 ID、前置与五个 Lab 连续', () => {
  assert.equal(catalog.lessons.length, 48);
  catalog.lessons.forEach((row, i) => {
    assert.equal(row.lessonId, `C${String(i + 1).padStart(2, '0')}`);
    assert.equal(row.startCheckpoint, `C${String(i).padStart(2, '0')}`);
    assert.equal(row.previousLesson, row.startCheckpoint);
    assert(row.files.length && row.acceptance.length);
    for (const field of ['trigger', 'evidence', 'repair', 'risk']) assert(row.error[field]?.trim(), `${row.lessonId} 缺少错误字段 ${field}`);
  });
  assert.equal(new Set(catalog.lessons.map((row) => row.labId)).size, 5);
});
test('C03 的逻辑或属于代码，不能截断错误字段或移位证据', () => {
  const { error } = catalog.lessons.find((row) => row.lessonId === 'C03');
  assert.match(error.trigger, /`stock \|\| 12` 把售罄复活/);
  assert.match(error.evidence, /^Sources：amount 的 typeof 为 string/);
  assert.match(error.repair, /0 保留/);
  assert.match(error.risk, /Java parseInt 与 JS parseInt/);
});
test('快照路径与下载包拒绝越界、缓存、符号链接', () => {
  for (const file of ['../a', '/tmp/a', 'src/../a', 'a\\b', 'a//b']) assert.throws(() => safePath('/tmp/x', file));
  for (const file of ['../a', 'src/../../a', '.env', 'node_modules/a', 'a\\b']) assert.throws(() => validateBundle({ release: catalog.release, files: { [file]: '' } }));
});
test('C00→C03 可重建；start 不覆盖；实际源码改错会失败；非空恢复拒绝', async () => {
  const parent = await mkdtemp(path.join(os.tmpdir(), 'inventory-contract-'));
  try {
    for (const id of ['C00', 'C01', 'C02', 'C03']) {
      const root = path.join(parent, id); await materialize(id, root);
      const data = await bundle(root);
      assert.equal(data.files['data/products.json'], await readFile(path.join(repo, 'examples/shared/products.json'), 'utf8'));
      assert(!Object.keys(data.files).some((name) => /node_modules|reference\/steps/.test(name)));
      if (id === 'C00') { assert(!data.files['src/core/inventory.js'].includes('parseStock')); continue; }
      assert.equal(spawnSync(process.execPath, ['tools/check.mjs', id], { cwd: root }).status, 0);
    }
    const root = path.join(parent, 'C03');
    const source = path.join(root, 'src/core/inventory.js');
    const before = await readFile(source, 'utf8');
    const start = spawnSync(process.execPath, ['tools/lab.mjs', 'start', 'C03'], { cwd: root });
    assert.equal(start.status, 0, start.stderr.toString());
    assert.equal(hash(await readFile(source)), hash(before));
    await writeFile(source, before.replace('return stock ?? 12;', 'return stock || 12;'));
    const broken = spawnSync(process.execPath, ['tools/check.mjs', 'C03'], { cwd: root, encoding: 'utf8' });
    assert.notEqual(broken.status, 0); assert.match(broken.stderr, /初始库存 0/);
    await assert.rejects(() => materialize('C00', root), /非空/);
    assert.match(await readFile(source, 'utf8'), /stock \|\| 12/);
  } finally { await rm(parent, { recursive: true, force: true }); }
});
