import { mkdtemp, rm, mkdir, writeFile, readFile } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { gzipSync } from 'node:zlib';
import { spawnSync } from 'node:child_process';
import { repo, catalog, materialize, bundle, hash } from '../labs/snapshots.mjs';

const out = path.join(repo, 'public/downloads/inventory', catalog.release);
await mkdir(out, { recursive: true });
await writeFile(path.join(repo, 'labs/inventory/tools/catalog.json'), JSON.stringify(catalog, null, 2) + '\n');
const checkpoints = { C00: {} };
for (const lesson of catalog.lessons) if (lesson.implemented) {
  if (lesson.trial) { checkpoints[lesson.trial.start] = {}; checkpoints[lesson.trial.end] = {}; }
  else checkpoints[lesson.endCheckpoint] = {};
}
const manifest = { release: catalog.release, checkpoints };
for (const id of Object.keys(checkpoints)) {
  const temp = await mkdtemp(path.join(os.tmpdir(), 'inventory-release-'));
  try {
    await materialize(id, temp);
    const data = await bundle(temp);
    const bytes = gzipSync(JSON.stringify(data), { level: 9 });
    await writeFile(path.join(out, `${id}.json.gz`), bytes);
    const sourceHashes = Object.fromEntries(Object.entries(data.files).map(([file, text]) => [file, hash(text)]));
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
await writeFile(path.join(out, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log(`Lab 发行包：${catalog.release}，${Object.keys(checkpoints).join('、')}；每包含锁文件，不含依赖/缓存/教师目录。`);
