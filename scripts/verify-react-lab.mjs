import { mkdtemp, rm, symlink } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { spawnSync } from 'node:child_process';
import { repo, materialize } from '../labs/snapshots.mjs';

// Actual-source regression, separate from the main agent's reader walkthrough.
// Each chapter gets an isolated snapshot; no learner files or storage are used.
const parent = await mkdtemp(path.join(os.tmpdir(), 'inventory-react-regression-'));
const dependencies = process.env.LAB_DEPENDENCIES ?? path.join(repo, 'labs/inventory/node_modules');
try {
  for (let number = 21; number <= 36; number++) {
    const id = `C${number}`;
    const root = path.join(parent, id);
    await materialize(id, root);
    await symlink(dependencies, path.join(root, 'node_modules'), 'dir');
    const result = spawnSync(process.execPath, ['tools/check.mjs', id], {
      cwd: root, stdio: 'inherit', timeout: 300000,
    });
    if (result.status !== 0) throw new Error(`${id} 实际快照检查失败：${result.error?.message ?? result.signal ?? result.status}`);
  }
  console.log('React C21–C36：16 个真实连续快照行为检查通过；不等同独立读者跟做。');
} finally {
  await rm(parent, { recursive: true, force: true });
}
