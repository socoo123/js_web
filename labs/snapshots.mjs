import { cp, mkdir, readdir, readFile, writeFile, rm, lstat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { gunzipSync } from 'node:zlib';
import { validateBundle } from './inventory/tools/reference.mjs';

export const repo = fileURLToPath(new URL('../', import.meta.url));
export const catalog = JSON.parse(await readFile(new URL('./catalog.json', import.meta.url)));
const excluded = new Set(['node_modules', 'dist', '.lab', '.git', '.cache', '.DS_Store', 'coverage', 'test-results']);
export const hash = (data) => createHash('sha256').update(data).digest('hex');
export function checkpointIds() {
  const ids = ['C00'];
  for (const row of catalog.lessons) if (row.implemented) {
    if (row.trial) ids.push(row.trial.start, row.trial.end);
    else {
      if (row.startCheckpoint !== ids.filter((id) => id.startsWith('C')).at(-1)) throw new Error(`快照前置不连续：${row.lessonId}`);
      ids.push(row.endCheckpoint);
    }
  }
  return [...new Set(ids)];
}
export async function verifyRelease(directory, release = path.basename(directory)) {
  const manifest = JSON.parse(await readFile(path.join(directory, 'manifest.json'), 'utf8'));
  if (manifest.release !== release || !manifest.checkpoints || Array.isArray(manifest.checkpoints) || !manifest.checkpoints.C00) throw new Error(`发行清单无效：${release}`);
  for (const [id, entry] of Object.entries(manifest.checkpoints)) {
    if (!/^[CP]\d{2}$/.test(id) || !entry.files || Array.isArray(entry.files)) throw new Error(`快照清单无效：${release}/${id}`);
    if (id === 'C00' ? entry.previous !== null : !manifest.checkpoints[entry.previous]) throw new Error(`快照前置不存在：${release}/${id}`);
    if (id.startsWith('C') && id !== 'C00' && entry.previous !== `C${String(Number(id.slice(1)) - 1).padStart(2, '0')}`) throw new Error(`快照前置不连续：${release}/${id}`);
    let bytes;
    for (const [suffix, digest] of [['json.gz', entry.sha256], ['tar.gz', entry.archiveSha256]]) {
      const data = await readFile(path.join(directory, `${id}.${suffix}`));
      if (hash(data) !== digest) throw new Error(`快照缺失或校验失败：${release}/${id}.${suffix}`);
      if (suffix === 'json.gz') bytes = data;
    }
    const data = validateBundle(JSON.parse(gunzipSync(bytes, { maxOutputLength: 64 * 1024 * 1024 }).toString()), release);
    const names = Object.keys(data.files).sort();
    if (JSON.stringify(names) !== JSON.stringify(Object.keys(entry.files).sort()) || names.some((name) => hash(data.files[name]) !== entry.files[name])) throw new Error(`快照源码清单校验失败：${release}/${id}`);
    const checkpoint = JSON.parse(data.files['checkpoint.json']);
    if (checkpoint.release !== release || checkpoint.checkpoint !== id) throw new Error(`快照身份不匹配：${release}/${id}`);
  }
  return manifest;
}
export function safePath(root, name) {
  if (typeof name !== 'string' || name.includes('\\') || name.split('/').some((part) => !part || part === '.' || part === '..') || path.isAbsolute(name)) throw new Error(`不安全的快照路径：${name}`);
  const target = path.resolve(root, name);
  if (!target.startsWith(path.resolve(root) + path.sep)) throw new Error(`路径越界：${name}`);
  return target;
}
export async function filesIn(root, prefix = '') {
  const files = [];
  for (const entry of (await readdir(path.join(root, prefix), { withFileTypes: true })).sort((a,b) => a.name.localeCompare(b.name, 'en'))) {
    if (excluded.has(entry.name) || entry.name === '.env' || entry.name.startsWith('.env.')) continue;
    const name = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isSymbolicLink()) throw new Error(`快照不接受符号链接：${name}`);
    if (entry.isDirectory()) files.push(...await filesIn(root, name));
    else if (entry.isFile()) files.push(name);
    else throw new Error(`快照只接受普通文件：${name}`);
  }
  return files;
}
async function identify(root, checkpoint) {
  const trial = catalog.lessons.find((row) => row.trial?.start === checkpoint || row.trial?.end === checkpoint);
  const start = trial?.trial?.start === checkpoint;
  const title = checkpoint === 'C00' ? 'C00 初始工程' : trial ? `${trial.lessonId} 试做${start ? '参考起点' : '完整参考解'}（${checkpoint}）` : `${checkpoint} 完成参考解`;
  const task = trial?.lessonId ?? (checkpoint === 'C00' ? 'C01' : checkpoint);
  await writeFile(path.join(root, 'checkpoint.json'), JSON.stringify({ release: catalog.release, checkpoint, kind: checkpoint === 'C00' ? 'starter' : start ? 'trial-start' : 'reference' }, null, 2) + '\n');
  const description = checkpoint === 'C00' ? '这是最小商品卡片骨架，后续能力由你逐章加入。' : start ? `这是 ${task} 明确前置的试做起点；不代表此前所有课程已连续完成。` : '这是已完成的参考解。通常作为下一课的参考起点或用于补课对照；不是 C00 初始工程。';
  await writeFile(path.join(root, 'README.md'), `# 库存工作区 · ${title}\n\n发行版：${catalog.release}。${description}\n\n需要 Node 24。在本目录执行一次 npm ci，再按课内说明执行 npm run lab -- start ${task} 和 npm run lab -- dev。打开终端给出的地址。跨课继续自己的源码，不自动复制答案。\n\n五个 Lab 起点为 C00/C10/C20/C36/C44；恢复的是该课完成态，不包含下一阶段的答案。L5 从 C44 接 C45–C48，回到保留的 src/react；adapters 留作对照。\n\n暂停时在 notes/next.md 记录当前课、已改文件、观察结果和下一步。start 只选择任务，status 可跨终端查看；check 检查实际工作文件，不会标记网页课程完成。compare 只读显示差异，不应用补丁或改任务记录。\n\n恢复示例：npm run lab -- restore C44 ../inventory-delivery。目标必须不存在或为普通空目录；非空目录、普通文件、符号链接均拒绝。先核对发行版和文件校验值，再写入新目录；当前源码、notes 和 .lab 均保留，坏任务记录也不妨碍另存恢复。进入新目录后用该版锁执行 npm ci，再 start 当前课。\n\n课程与升级说明：https://socoo123.github.io/js_web/labs/\n`);
}
export async function materialize(checkpoint, target) {
  if (!/^[CP]\d{2}$/.test(checkpoint)) throw new Error(`错误快照：${checkpoint}`);
  const info = await lstat(target).catch((error) => { if (error.code !== 'ENOENT') throw error; });
  if (info && (!info.isDirectory() || (await readdir(target)).length)) throw new Error('恢复目标非空或不是普通目录；源码未修改。');
  if (checkpoint.startsWith('P')) {
    const dir = path.join(repo, 'labs/reference/prototypes', checkpoint);
    const change = JSON.parse(await readFile(path.join(dir, 'change.json')));
    await materialize(change.previous, target);
    for (const [file, shared] of Object.entries(change.sharedFiles ?? {})) {
      const to = safePath(target, file); await mkdir(path.dirname(to), { recursive: true }); await cp(safePath(repo, shared), to);
    }
    for (const file of change.files) {
      const to = safePath(target, file); await mkdir(path.dirname(to), { recursive: true }); await cp(safePath(path.join(dir, 'files'), file), to);
    }
    await identify(target, checkpoint);
    return target;
  }
  await mkdir(target, { recursive: true });
  if ((await readdir(target)).length) throw new Error('恢复目标非空；源码未修改。');
  const skeleton = path.join(repo, 'labs/reference/c00');
  for (const file of await filesIn(skeleton)) {
    const to = safePath(target, file); await mkdir(path.dirname(to), { recursive: true }); await cp(safePath(skeleton, file), to);
  }
  const tooling = path.join(repo, 'labs/inventory/tools');
  for (const file of await filesIn(tooling)) {
    const to = safePath(target, `tools/${file}`); await mkdir(path.dirname(to), { recursive: true }); await cp(safePath(tooling, file), to);
  }
  await mkdir(path.join(target, 'data'), { recursive: true });
  await cp(path.join(repo, 'examples/shared/products.json'), path.join(target, 'data/products.json'));
  const checkpoints = ['C00'];
  for (let n = 1; n <= Number(checkpoint.slice(1)); n++) {
    const id = `C${String(n).padStart(2, '0')}`;
    const dir = path.join(repo, 'labs/reference/steps', id);
    if (!existsSync(path.join(dir, 'change.json'))) throw new Error(`尚未发行快照：${id}`);
    const change = JSON.parse(await readFile(path.join(dir, 'change.json')));
    if (change.previous !== checkpoints.at(-1)) throw new Error(`快照前置不连续：${id}`);
    for (const file of change.remove ?? []) await rm(safePath(target, file));
    for (const [file, shared] of Object.entries(change.sharedFiles ?? {})) {
      const to = safePath(target, file); await mkdir(path.dirname(to), { recursive: true }); await cp(safePath(repo, shared), to);
    }
    for (const file of change.files) {
      const to = safePath(target, file); await mkdir(path.dirname(to), { recursive: true }); await cp(safePath(path.join(dir, 'files'), file), to);
    }
    checkpoints.push(id);
  }
  await identify(target, checkpoint);
  return target;
}
export async function bundle(root) {
  const files = {};
  for (const file of await filesIn(root)) files[file] = await readFile(safePath(root, file), 'utf8');
  return { release: catalog.release, files };
}
