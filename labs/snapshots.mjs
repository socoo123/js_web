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
async function identify(root, checkpoint) {
  const trial = catalog.lessons.find((row) => row.trial?.start === checkpoint || row.trial?.end === checkpoint);
  const start = trial?.trial?.start === checkpoint;
  const title = checkpoint === 'C00' ? 'C00 初始工程' : trial ? `${trial.lessonId} 试做${start ? '参考起点' : '完整参考解'}（${checkpoint}）` : `${checkpoint} 完成参考解`;
  const task = trial?.lessonId ?? (checkpoint === 'C00' ? 'C01' : checkpoint);
  await writeFile(path.join(root, 'checkpoint.json'), JSON.stringify({ release: catalog.release, checkpoint, kind: checkpoint === 'C00' ? 'starter' : start ? 'trial-start' : 'reference' }, null, 2) + '\n');
  const description = checkpoint === 'C00' ? '这是最小商品卡片骨架，后续能力由你逐章加入。' : start ? `这是 ${task} 明确前置的试做起点；不代表此前所有课程已连续完成。` : '这是已完成的参考解。通常作为下一课的参考起点或用于补课对照；不是 C00 初始工程。';
  await writeFile(path.join(root, 'README.md'), `# 库存工作区 · ${title}\n\n发行版：${catalog.release}。${description}\n\n需要 Node 24。在本目录执行一次 npm ci，再按课内说明执行 npm run lab -- start ${task} 和 npm run lab -- dev。打开终端给出的地址。跨课继续自己的源码，不自动复制答案。\n\n暂停时在 notes/next.md 记录当前课、已改文件、观察结果和下一步。check 检查实际工作文件，不会标记网页课程完成。restore 只写新目录，非空则拒绝；compare 只读显示差异。\n\n课程与升级说明：https://socoo123.github.io/js_web/labs/\n`);
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
