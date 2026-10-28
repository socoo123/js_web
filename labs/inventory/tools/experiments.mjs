import { mkdtemp, mkdir, cp, writeFile, readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { workspace, run } from './lab.mjs';

export async function experiment(kind) {
  if (!['lock', 'managers', 'types'].includes(kind)) throw new Error('实验：lock | managers | types');
  const parent = path.join(workspace, '.lab/sandboxes');
  await mkdir(parent, { recursive: true });
  const root = await mkdtemp(path.join(parent, kind + '-'));
  console.log(`隔离实验目录：${root}；不修改主清单和主锁。`);
  const put = (file, text) => writeFile(path.join(root, file), text);
  if (kind === 'types') {
    await put('price.ts', 'const stock: number = "3";\nconsole.log(stock + 1);\n');
    // Vite's transformWithOxc is the public transform used by this pinned Vite.
    const { transformWithOxc } = await import('vite');
    const result = await transformWithOxc(await readFile(path.join(root, 'price.ts'), 'utf8'), 'price.ts');
    await put('price.mjs', result.code);
    await run(process.execPath, ['price.mjs'], root);
    const tsc = path.join(workspace, 'node_modules/typescript/bin/tsc');
    const checked = spawnSync(process.execPath, [tsc, '--ignoreConfig', '--noEmit', '--skipLibCheck', '--target', 'es2022', 'price.ts'], { cwd: root, encoding: 'utf8' });
    console.log(checked.stdout + checked.stderr);
    if (checked.status === 0 || !/TS2322/.test(checked.stdout + checked.stderr)) throw new Error('预期类型错误没有出现');
    console.log('转译后运行输出 31；独立类型检查拒绝 string→number。请在此隔离文件把 "3" 改为 3 后重跑终端打印的命令。');
    console.log(`node ${JSON.stringify(tsc)} --ignoreConfig --noEmit --skipLibCheck --target es2022 ${JSON.stringify(path.join(root, 'price.ts'))}`);
    return;
  }
  const manifest = { name: 'inventory-tool-experiment', version: '1.0.0', private: true, type: 'module', scripts: { report: 'node src/cli/report.js' }, dependencies: { semver: '7.8.5' } };
  const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  if (kind === 'lock') {
    await put('package.json', JSON.stringify(manifest, null, 2));
    await run(npm, ['install', '--package-lock-only', '--ignore-scripts', '--no-audit', '--no-fund'], root);
    manifest.dependencies.semver = '6.3.1';
    await put('package.json', JSON.stringify(manifest, null, 2));
    const broken = spawnSync(npm, ['ci', '--ignore-scripts', '--no-audit', '--no-fund'], { cwd: root, encoding: 'utf8', timeout: 120000 });
    console.log(broken.stdout + broken.stderr);
    if (broken.status === 0 || !/sync|Invalid|Missing/.test(broken.stdout + broken.stderr)) throw new Error('未得到预期的清单/锁不一致证据');
    console.log('已观察到预期的 npm ci 失败。要修复：在上面的隔离目录运行 npm install --package-lock-only，再 npm ci；主工程无需修复。');
    return;
  }
  for (const manager of ['npm', 'pnpm']) {
    const dir = path.join(root, manager); await mkdir(dir);
    for (const file of ['src/core', 'src/cli', 'data']) await cp(path.join(workspace, file), path.join(dir, file), { recursive: true });
    await writeFile(path.join(dir, 'package.json'), JSON.stringify(manifest, null, 2));
    if (manager === 'npm') {
      await run(npm, ['install', '--ignore-scripts', '--no-audit', '--no-fund'], dir);
      await run(npm, ['run', 'report'], dir);
    } else {
      const prefix = ['exec', '--yes', '--package=pnpm@12.14.0', '--', 'pnpm'];
      await run(npm, [...prefix, 'install', '--ignore-scripts'], dir);
      await run(npm, [...prefix, 'run', 'report'], dir);
    }
    const resolved = spawnSync(process.execPath, ['--input-type=module', '-e', 'import {createRequire} from "node:module"; const r=createRequire(process.cwd()+"/probe.cjs"); console.log(r.resolve("semver")); console.log(r("semver").satisfies("24.22.0", "^24.0.0"));'], { cwd: dir, encoding: 'utf8' });
    if (resolved.status !== 0) throw new Error(resolved.stderr);
    console.log(`${manager} 的显式依赖解析：\n${resolved.stdout}`);
  }
  console.log('两个包管理器都通过同一个 Node 运行报告；这次比较没有更换运行时。锁文件仅在各自隔离子目录。把观察结果写入 notes/tooling.md。');
}
