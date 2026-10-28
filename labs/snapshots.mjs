import { cp, mkdir, readdir, readFile, writeFile, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

export const repo = fileURLToPath(new URL('../', import.meta.url));
export const catalog = JSON.parse(await readFile(new URL('./catalog.json', import.meta.url)));
const excluded = new Set(['node_modules', 'dist', '.lab', '.git', '.DS_Store', 'coverage', 'test-results']);
export const hash = (data) => createHash('sha256').update(data).digest('hex');
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
    else files.push(name);
  }
  return files;
}
export async function materialize(checkpoint, target) {
  if (!/^[CP]\d{2}$/.test(checkpoint)) throw new Error(`错误快照：${checkpoint}`);
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
    await writeFile(path.join(target, 'checkpoint.json'), JSON.stringify({ release: catalog.release, checkpoint }, null, 2) + '\n');
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
  await writeFile(path.join(target, 'checkpoint.json'), JSON.stringify({ release: catalog.release, checkpoint }, null, 2) + '\n');
  return target;
}
export async function bundle(root) {
  const files = {};
  for (const file of await filesIn(root)) files[file] = await readFile(safePath(root, file), 'utf8');
  return { release: catalog.release, files };
}
