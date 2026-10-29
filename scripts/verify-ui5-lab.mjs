import { mkdtemp, rm, symlink } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { spawnSync } from 'node:child_process';
import { repo, materialize } from '../labs/snapshots.mjs';

// Actual-source regression; reader walkthroughs are recorded separately.
const parent = await mkdtemp(path.join(os.tmpdir(), 'inventory-adapters-regression-'));
const dependencies = process.env.LAB_DEPENDENCIES ?? path.join(repo, 'labs/inventory/node_modules');
try {
  for (let number = 37; number <= 44; number++) {
    const id = `C${number}`;
    const root = path.join(parent, id);
    await materialize(id, root);
    await symlink(dependencies, path.join(root, 'node_modules'), 'dir');
    const commands = [['tools/check.mjs', id]];
    if (id === 'C40' || id === 'C42') commands.push(['tools/openui5-static-check.mjs', id]);
    if (id === 'C43') commands.push(['tools/web-components-check.mjs', '--static']);
    if (id === 'C44') commands.push(['tools/ui5-react-check.mjs', '--production']);
    for (const command of commands) {
      const result = spawnSync(process.execPath, command, {
        cwd: root, stdio: 'inherit', timeout: 600000,
      });
      if (result.status !== 0) throw new Error(`${id} ${command.join(' ')} 失败：${result.error?.message ?? result.signal ?? result.status}`);
    }
  }
  console.log('组件库/UI5 C37–C44：8 个真实连续快照检查通过；不等同独立读者跟做。');
} finally {
  await rm(parent, { recursive: true, force: true });
}
