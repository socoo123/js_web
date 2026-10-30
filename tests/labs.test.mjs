import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, rm, mkdir, readdir, symlink, lstat, cp } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { spawnSync } from 'node:child_process';
import { gzipSync, gunzipSync } from 'node:zlib';
import { repo, catalog, materialize, bundle, safePath, hash, checkpointIds, verifyRelease, filesIn } from '../labs/snapshots.mjs';
import { validateBundle } from '../labs/inventory/tools/reference.mjs';
import { entryFor } from '../labs/inventory/tools/lab.mjs';

const cli = (root, ...args) => spawnSync(process.execPath, ['tools/lab.mjs', ...args], { cwd: root, encoding: 'utf8', timeout: 30000 });
async function treeHashes(root, prefix = '') {
  const files = {};
  for (const entry of await readdir(path.join(root, prefix), { withFileTypes: true })) {
    const name = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) Object.assign(files, await treeHashes(root, name));
    else if (entry.isFile()) files[name] = hash(await readFile(path.join(root, name)));
  }
  return files;
}
async function fixture() {
  const parent = await mkdtemp(path.join(os.tmpdir(), 'inventory-recovery-'));
  const root = path.join(parent, 'labs/inventory');
  await materialize('C03', root);
  const out = path.join(parent, 'public/downloads/inventory', catalog.release);
  await mkdir(out, { recursive: true });
  const data = await bundle(root);
  const bytes = gzipSync(JSON.stringify(data));
  const manifest = { release: catalog.release, checkpoints: { C03: { sha256: hash(bytes), files: Object.fromEntries(Object.entries(data.files).map(([name, text]) => [name, hash(text)])) } } };
  await writeFile(path.join(out, 'C03.json.gz'), bytes);
  await writeFile(path.join(out, 'manifest.json'), JSON.stringify(manifest));
  return { parent, root, out, data, manifest };
}

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
  for (const files of [[], {}, { 'src/a': '', 'src/a/b': '' }, { '.cache/a': '' }, { 'labs/reference/steps/C48/answer.js': '' }]) {
    assert.throws(() => validateBundle({ release: catalog.release, files }));
  }
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

test('打包枚举跳过环境/缓存/个人状态，但拒绝真实符号链接', async () => {
  const parent = await mkdtemp(path.join(os.tmpdir(), 'inventory-source-files-'));
  try {
    await writeFile(path.join(parent, 'source.js'), '公开源码');
    for (const directory of ['node_modules', '.lab', '.cache', 'dist']) {
      await mkdir(path.join(parent, directory)); await writeFile(path.join(parent, directory, 'private.txt'), '不能打包');
    }
    await writeFile(path.join(parent, '.env.local'), 'TOKEN=不打包');
    assert.deepEqual(await filesIn(parent), ['source.js']);
    await symlink(path.join(parent, 'source.js'), path.join(parent, 'linked.js'));
    await assert.rejects(() => filesIn(parent), /快照不接受符号链接/);
    await assert.rejects(() => materialize('C00', path.join(parent, 'linked.js')), /不是普通目录/);
  } finally { await rm(parent, { recursive: true, force: true }); }
});

test('暂停状态跨进程保留；start 不装答案；compare 连同任务记录只读', async () => {
  const { parent, root } = await fixture();
  try {
    await writeFile(path.join(root, 'notes/my-work.txt'), '我的暂停记录\n下一步：修复空值。\n');
    const before = await treeHashes(root);
    assert.equal(cli(root, 'start', 'C03').status, 0);
    const after = await treeHashes(root);
    delete after['.lab/state.json'];
    assert.deepEqual(after, before);
    const checked = cli(root, 'check', 'C03');
    assert.equal(checked.status, 0, checked.stdout + checked.stderr);
    const status = cli(root, 'status');
    assert.equal(status.status, 0, status.stderr);
    assert.match(status.stdout, /C03/);
    assert.match(status.stdout, /"passed":true/);
    await writeFile(path.join(root, 'src/core/inventory.js'), '// 我的改动\n');
    const paused = await treeHashes(root);
    const compared = cli(root, 'compare', 'C03');
    assert.equal(compared.status, 0, compared.stderr);
    assert.match(compared.stdout, /只读对照/);
    assert.deepEqual(await treeHashes(root), paused);
  } finally { await rm(parent, { recursive: true, force: true }); }
});

test('恢复只写新目录；非空、普通文件、有效及悬空符号链接均拒绝', async () => {
  const { parent, root } = await fixture();
  try {
    const keep = path.join(parent, 'keep'); await mkdir(keep);
    await writeFile(path.join(keep, 'my-work.txt'), '不要覆盖');
    const ordinary = path.join(parent, 'ordinary'); await writeFile(ordinary, '普通文件');
    const empty = path.join(parent, 'empty'); await mkdir(empty);
    const link = path.join(parent, 'link'); await symlink(empty, link, 'dir');
    const dangling = path.join(parent, 'dangling'); await symlink(path.join(parent, 'missing'), dangling, 'dir');
    for (const target of [keep, ordinary, link, dangling]) {
      const refused = cli(root, 'restore', 'C03', target);
      assert.notEqual(refused.status, 0);
      assert.match(refused.stderr, /恢复目标非空或不是普通目录/);
    }
    assert.equal(await readFile(path.join(keep, 'my-work.txt'), 'utf8'), '不要覆盖');
    assert((await lstat(dangling)).isSymbolicLink());
    const before = await treeHashes(root);
    const target = path.join(parent, 'recovered');
    const restored = cli(root, 'restore', 'C03', target);
    assert.equal(restored.status, 0, restored.stderr);
    assert.deepEqual(await treeHashes(root), before);
    assert.deepEqual(await treeHashes(target), before);
    assert.equal(cli(root, 'restore', 'C03', empty).status, 0);
  } finally { await rm(parent, { recursive: true, force: true }); }
});

test('损坏的暂停状态不妨碍向新目录恢复；原状态和源码保留', async () => {
  const { parent, root } = await fixture();
  try {
    await mkdir(path.join(root, '.lab')); await writeFile(path.join(root, '.lab/state.json'), '{坏记录');
    const before = await treeHashes(root);
    const result = cli(root, 'restore', 'C03', path.join(parent, 'recovered'));
    assert.equal(result.status, 0, result.stderr);
    assert.deepEqual(await treeHashes(root), before);
  } finally { await rm(parent, { recursive: true, force: true }); }
});

test('坏包、未知快照、越界文件与发行版不匹配均在写目标前拒绝', async () => {
  const { parent, root, out, data, manifest } = await fixture();
  try {
    const target = path.join(parent, 'recovered');
    const before = await treeHashes(root);
    const fail = () => {
      const result = cli(root, 'restore', 'C03', target);
      assert.notEqual(result.status, 0, result.stdout);
      return result.stderr;
    };
    await writeFile(path.join(out, 'C03.json.gz'), '损坏的压缩包');
    assert.match(fail(), /校验值不匹配/);
    for (const broken of [{ ...data, release: 'wrong' }, { ...data, files: { '../escape.js': '越界' } }]) {
      const bytes = gzipSync(JSON.stringify(broken));
      manifest.checkpoints.C03.sha256 = hash(bytes);
      await writeFile(path.join(out, 'C03.json.gz'), bytes);
      await writeFile(path.join(out, 'manifest.json'), JSON.stringify(manifest));
      assert.match(fail(), /发行版不匹配|不安全的参考文件/);
    }
    assert.notEqual(cli(root, 'restore', 'C99', target).status, 0);
    assert.deepEqual(await treeHashes(root), before);
    assert(!((await readdir(parent)).some((name) => name.startsWith('.inventory-restore-') || name === 'recovered' || name === 'escape.js')));
  } finally { await rm(parent, { recursive: true, force: true }); }
});

test('所有已实现快照相邻重建；五个Lab起点不预置后段答案', async () => {
  const parent = await mkdtemp(path.join(os.tmpdir(), 'inventory-chain-'));
  try {
    const ids = ['C00', ...catalog.lessons.filter((row) => row.implemented && !row.trial).map((row) => row.endCheckpoint)];
    assert.deepEqual(ids, Array.from({ length: ids.length }, (_, number) => `C${String(number).padStart(2, '0')}`));
    assert.deepEqual(checkpointIds().filter((id) => id.startsWith('C')), ids);
    const checkpoints = new Map();
    for (const id of ids) {
      const root = path.join(parent, id); await materialize(id, root);
      const data = await bundle(root); checkpoints.set(id, data.files);
      assert.equal(JSON.parse(data.files['checkpoint.json']).checkpoint, id);
      assert.equal(data.files['data/products.json'], await readFile(path.join(repo, 'examples/shared/products.json'), 'utf8'));
      assert(!Object.keys(data.files).some((name) => /(^|\/)(node_modules|dist|\.lab|reference|\.env)(\/|$)/.test(name)));
    }
    const c00 = checkpoints.get('C00');
    assert(!Object.keys(c00).some((name) => /^(src\/react|tests\/delivery)\//.test(name)));
    assert.match(c00['adapters/antd/select-product.js'], /throw new Error\("请先完成 C37/);
    assert.match(c00['adapters/ui5-react/App.jsx'], /按 C44 接入列表与库存表单/);
    assert(!/parseStock|createDraft|summarize/.test(c00['src/core/inventory.js']));
    if (checkpoints.has('C20')) assert(!Object.keys(checkpoints.get('C20')).some((name) => /^src\/react\//.test(name)));
    if (checkpoints.has('C36')) for (const [name, text] of Object.entries(c00)) if (/^adapters\//.test(name)) assert.equal(checkpoints.get('C36')[name], text, `C36仍是机械骨架：${name}`);
    if (checkpoints.has('C44')) {
      const c44 = checkpoints.get('C44');
      for (const [name, text] of Object.entries(checkpoints.get('C36'))) if (/^src\/(core|react|services)\//.test(name)) assert.equal(c44[name], text, `C44应保留C36：${name}`);
      for (const name of ['notes/debug.md', 'notes/test-plan.md', 'notes/final-review.md']) assert(!c44[name], `C44不含未来学习记录：${name}`);
      for (const adapter of ['antd', 'openui5', 'web-components', 'ui5-react']) assert(Object.keys(c44).some((name) => name.startsWith(`adapters/${adapter}/`)));
    }
    assert.equal(entryFor('C44'), 'adapters/ui5-react');
    for (const id of ['C45', 'C46', 'C47', 'C48']) assert.equal(entryFor(id), 'src/react');
  } finally { await rm(parent, { recursive: true, force: true }); }
});

test('冻结发行拒绝真实工具源码变更，重复生成字节不变且不重写冻结输出', async () => {
  const parent = await mkdtemp(path.join(os.tmpdir(), 'inventory-freeze-'));
  try {
    for (const file of ['labs/snapshots.mjs', 'scripts/build-labs.mjs', 'examples/shared/products.json']) {
      await mkdir(path.dirname(path.join(parent, file)), { recursive: true }); await cp(path.join(repo, file), path.join(parent, file));
    }
    await cp(path.join(repo, 'labs/reference/c00'), path.join(parent, 'labs/reference/c00'), { recursive: true });
    await cp(path.join(repo, 'labs/inventory/tools'), path.join(parent, 'labs/inventory/tools'), { recursive: true });
    const source = { ...catalog, release: '2026.10-v2.5', lessons: [] };
    await writeFile(path.join(parent, 'labs/catalog.json'), JSON.stringify(source));
    await mkdir(path.join(parent, 'labs/releases'), { recursive: true });
    const build = () => spawnSync(process.execPath, ['scripts/build-labs.mjs'], { cwd: parent, encoding: 'utf8', timeout: 30000 });
    let result = build(); assert.equal(result.status, 0, result.stderr);
    const out = path.join(parent, 'public/downloads/inventory', source.release);
    const generated = await treeHashes(out);
    result = build(); assert.equal(result.status, 0, result.stderr); assert.deepEqual(await treeHashes(out), generated);
    const manifest = JSON.parse(await readFile(path.join(out, 'manifest.json')));
    assert.deepEqual(await verifyRelease(out, source.release), manifest);
    const data = JSON.parse(gunzipSync(await readFile(path.join(out, 'C00.json.gz'))));
    assert.equal(hash(await readFile(path.join(out, 'C00.tar.gz'))), manifest.checkpoints.C00.archiveSha256);
    const listed = spawnSync('python3', ['-c', 'import sys,tarfile,json,hashlib\nwith tarfile.open(sys.argv[1]) as t: print(json.dumps({m.name:hashlib.sha256(t.extractfile(m).read()).hexdigest() for m in t.getmembers() if m.isfile()}))', path.join(out, 'C00.tar.gz')], { encoding: 'utf8' });
    assert.equal(listed.status, 0, listed.stderr);
    assert.deepEqual(JSON.parse(listed.stdout), manifest.checkpoints.C00.files);
    assert.deepEqual(Object.keys(data.files).sort(), Object.keys(manifest.checkpoints.C00.files).sort());
    await cp(out, path.join(parent, 'labs/releases', source.release), { recursive: true });
    const lab = path.join(parent, 'labs/inventory/tools/lab.mjs'); await writeFile(lab, await readFile(lab, 'utf8') + '\n// 真实源码修改\n');
    result = build(); assert.notEqual(result.status, 0); assert.match(result.stderr, /已冻结.*源码变动需要新发行版/);
    assert.deepEqual(await treeHashes(out), generated);
    const frozenArchive = path.join(parent, 'labs/releases', source.release, 'C00.json.gz');
    const frozenBytes = await readFile(frozenArchive); await writeFile(frozenArchive, '损坏的历史包');
    result = build(); assert.notEqual(result.status, 0); assert.match(result.stderr, /校验失败/);
    assert.deepEqual(await treeHashes(out), generated);
    await writeFile(frozenArchive, frozenBytes);
    const archive = path.join(out, 'C00.tar.gz');
    const good = await readFile(archive); await writeFile(archive, '坏包');
    await assert.rejects(() => verifyRelease(out, source.release), /校验失败/);
    await writeFile(archive, good); await verifyRelease(out, source.release);
    data.files['notes/unlisted.md'] = '不在清单中的文件';
    const bytes = gzipSync(JSON.stringify(data));
    manifest.checkpoints.C00.sha256 = hash(bytes);
    await writeFile(path.join(out, 'C00.json.gz'), bytes);
    await writeFile(path.join(out, 'manifest.json'), JSON.stringify(manifest));
    await assert.rejects(() => verifyRelease(out, source.release), /源码清单校验失败/);
  } finally { await rm(parent, { recursive: true, force: true }); }
});
