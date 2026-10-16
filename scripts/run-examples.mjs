import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../examples/', import.meta.url));
const args = process.argv.slice(2);
if (args.length > 1 || (args[0] && !/^c\d{2}$/.test(args[0]))) {
  console.error('用法：npm run examples [-- c06]');
  process.exit(1);
}
const start = args[0] ? path.join(root, args[0]) : root;
const files = [];
function walk(directory) {
  if (existsSync(path.join(directory, 'package.json'))) return;
  for (const item of readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, item.name);
    if (item.isDirectory() && item.name !== 'node_modules') walk(file);
    else if (item.isFile() && /\.(?:js|mjs)$/.test(item.name) && existsSync(file.replace(/\.(?:js|mjs)$/, '.expected.txt'))) files.push(file);
  }
}
if (existsSync(start)) walk(start);
if (!files.length) {
  console.error(`没有可核对的例子：${path.relative(root, start) || 'examples'}`);
  process.exit(1);
}
const normalize = (value) => value.replace(/\r\n?/g, '\n').replace(/[\t ]+$/gm, '').replace(/\n$/, '');
let passed = 0;
for (const file of files.sort()) {
  const expected = readFileSync(file.replace(/\.(?:js|mjs)$/, '.expected.txt'), 'utf8');
  const errorName = readFileSync(file, 'utf8').split(/\r?\n/, 1)[0].match(/^\/\/ expect-error: (\w+)\s*$/)?.[1];
  const result = spawnSync(process.execPath, [path.basename(file)], {
    cwd: path.dirname(file), encoding: 'utf8', timeout: 10000, maxBuffer: 1024 * 1024,
  });
  const outputOK = normalize(result.stdout ?? '') === normalize(expected);
  const exitOK = errorName ? result.status !== null && result.status !== 0 && result.stderr.includes(errorName) : result.status === 0;
  if (!result.error && !result.signal && outputOK && exitOK) {
    passed++;
    console.log(`PASS ${path.relative(root, file)}`);
  } else {
    console.error(`FAIL ${path.relative(root, file)}：${result.error?.message ?? `exit ${result.status}`}`);
    if (!outputOK) console.error(`预期 stdout：${JSON.stringify(normalize(expected))}\n实际 stdout：${JSON.stringify(normalize(result.stdout ?? ''))}`);
    if (!exitOK && result.stderr) console.error(result.stderr.trim());
  }
}
console.log(`示例：${passed}/${files.length} 通过。`);
process.exitCode = passed === files.length ? 0 : 1;
