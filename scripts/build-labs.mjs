import { mkdtemp, rm, mkdir, writeFile, readFile, readdir, cp } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { gzipSync } from 'node:zlib';
import { spawnSync } from 'node:child_process';
import { repo, catalog, materialize, bundle, hash, checkpointIds, verifyRelease } from '../labs/snapshots.mjs';

const out = path.join(repo, 'public/downloads/inventory', catalog.release);
await mkdir(out, { recursive: true });
const releases = path.join(repo, 'labs/releases');
for (const entry of await readdir(releases, { withFileTypes: true })) if (entry.isDirectory()) {
  await verifyRelease(path.join(releases, entry.name), entry.name);
  await cp(path.join(releases, entry.name), path.join(repo, 'public/downloads/inventory', entry.name), { recursive: true });
}
const frozenFile = path.join(releases, catalog.release, 'manifest.json');
const frozenText = existsSync(frozenFile) ? await readFile(frozenFile, 'utf8') : null;
const frozen = frozenText ? JSON.parse(frozenText) : null;
await writeFile(path.join(repo, 'labs/inventory/tools/catalog.json'), JSON.stringify(catalog, null, 2) + '\n');
const checkpoints = Object.fromEntries(checkpointIds().map((id) => [id, {}]));
const manifest = { release: catalog.release, checkpoints };
if (frozen && JSON.stringify(Object.keys(frozen.checkpoints)) !== JSON.stringify(Object.keys(checkpoints))) throw new Error(`${catalog.release} 已发布，快照范围变动需要新发行版。`);
for (const id of Object.keys(checkpoints)) {
  const temp = await mkdtemp(path.join(os.tmpdir(), 'inventory-release-'));
  try {
    await materialize(id, temp);
    const data = await bundle(temp);
    const sourceHashes = Object.fromEntries(Object.entries(data.files).map(([file, text]) => [file, hash(text)]));
    if (frozen) {
      const expected = frozen.checkpoints[id].files;
      const changed = [...new Set([...Object.keys(expected), ...Object.keys(sourceHashes)])].filter((file) => expected[file] !== sourceHashes[file]);
      if (changed.length) throw new Error(`${catalog.release}/${id} 已冻结，源码变动需要新发行版：${changed.join('、')}`);
      checkpoints[id] = frozen.checkpoints[id];
      continue;
    }
    const bytes = gzipSync(JSON.stringify(data), { level: 9 });
    await writeFile(path.join(out, `${id}.json.gz`), bytes);
    const change = id === 'C00' ? null : JSON.parse(await readFile(path.join(repo, id.startsWith('P') ? 'labs/reference/prototypes' : 'labs/reference/steps', id, 'change.json')));
    const previous = checkpoints[change?.previous]?.files ?? {};
    const changed = Object.keys(sourceHashes).filter((file) => previous[file] !== sourceHashes[file]);
    const removed = Object.keys(previous).filter((file) => !(file in sourceHashes));
    const archive = path.join(out, `${id}.tar.gz`);
    const result = spawnSync('python3', ['-c', `import sys,pathlib,tarfile,gzip
root=pathlib.Path(sys.argv[1])
with open(sys.argv[2],'wb') as raw, gzip.GzipFile(filename='',mode='wb',fileobj=raw,mtime=0) as compressed, tarfile.open(fileobj=compressed,mode='w') as archive:
 for file in sorted(root.rglob('*')):
  if not file.is_file(): continue
  info=archive.gettarinfo(str(file),arcname=file.relative_to(root).as_posix())
  info.mtime=0; info.uid=0; info.gid=0; info.uname=''; info.gname=''; info.mode=0o644
  with file.open('rb') as source: archive.addfile(info,source)
`, temp, archive], { encoding: 'utf8' });
    if (result.status !== 0) throw new Error(result.stderr);
    checkpoints[id] = { previous: change?.previous ?? null, sha256: hash(bytes), archiveSha256: hash(await readFile(archive)), files: sourceHashes, changed, removed };
  } finally { await rm(temp, { recursive: true, force: true }); }
}
await writeFile(path.join(out, 'manifest.json'), frozenText ?? JSON.stringify(manifest, null, 2) + '\n');
console.log(`Lab 发行包：${catalog.release}，${Object.keys(checkpoints).join('、')}；每包含锁文件，不含依赖/缓存/教师目录。`);
