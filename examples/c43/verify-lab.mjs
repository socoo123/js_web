import { mkdir, mkdtemp, cp, readFile, symlink } from 'node:fs/promises';
import { realpathSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { materialize } from '../../labs/snapshots.mjs';

const repo = fileURLToPath(new URL('../../', import.meta.url));
const initial = process.argv.includes('--c00');
let workspace = process.env.LAB_C43_WORKSPACE;
if (!workspace) {
  await mkdir(path.join(repo, '.lab'), { recursive: true });
  workspace = await mkdtemp(path.join(repo, '.lab/c43-fixture-'));
  await materialize(initial ? 'C00' : 'C36', workspace);
  const prelude = JSON.parse(await readFile(path.join(repo, 'labs/reference/steps/C43/prelude/manifest.json')));
  assert(!Object.hasOwn(prelude, 'includeAt'), '机械外壳应从 C00 继承，不再注入 C36');
  for (const [target, source] of Object.entries(prelude.sharedFiles)) {
    assert(source.startsWith('labs/reference/c00/adapters/web-components/'));
    assert.equal(await readFile(path.join(workspace, target), 'utf8'), await readFile(path.join(repo, source), 'utf8'), `C00 外壳未自然继承：${target}`);
    assert.equal(await readFile(path.join(repo, 'labs/inventory', target), 'utf8'), await readFile(path.join(repo, source), 'utf8'), `仓库 C00 工作区镜像不一致：${target}`);
  }
  if (!initial && !process.argv.includes('--starter')) {
    const step = JSON.parse(await readFile(path.join(repo, 'labs/reference/steps/C43/change.json')));
    for (const file of step.files) await cp(path.join(repo, 'labs/reference/steps/C43/files', file), path.join(workspace, file));
  }
  await symlink(realpathSync(path.join(repo, 'labs/inventory/node_modules')), path.join(workspace, 'node_modules'), 'dir');
  console.log(initial
    ? '初始工程检查：真实新版 C00，机械外壳按课启用；本次只启动默认原生页。'
    : `局部夹具：真实 C36（含从新版 C00 自然继承的机械外壳）${process.argv.includes('--starter') ? '' : ' + C43 答案'}。缺少 C37–C42，不能作为真实接续通过证据。`);
} else {
  workspace = path.resolve(workspace);
  console.log(`直接检查指定的实际工作区：${workspace}；不组装、不覆盖源码。`);
}
console.log(`工作区：${workspace}`);
const result = spawnSync(process.execPath, [initial ? 'tools/web-components-c00.mjs' : 'tools/web-components-check.mjs', ...process.argv.slice(2)], { cwd: workspace, stdio: 'inherit', env: process.env });
process.exitCode = result.status ?? 1;
