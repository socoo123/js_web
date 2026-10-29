import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const workspace = fileURLToPath(new URL('../', import.meta.url));
function run(args) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, args, { cwd: workspace, stdio: 'inherit', env: process.env });
    child.on('error', reject);
    child.on('exit', (code) => code === 0 ? resolve() : reject(new Error(`${args[0]} 退出 ${code}`)));
  });
}
await run(['tools/component-choice-check.mjs']);
await run(['node_modules/vitest/vitest.mjs', 'run', '--config', 'tools/antd-config.mjs']);
await run(['tools/antd-browser.mjs']);
console.log('C38：当前 Ant Design adapter 的规则、仓库、真实浏览器与严格静态子路径检查通过。');
