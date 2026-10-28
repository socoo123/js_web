import { build } from 'vite';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { workspace } from './lab.mjs';

const result = await build({
  configFile: false, root: workspace, logLevel: 'warn',
  build: { write: false, minify: false, lib: { entry: path.join(workspace, 'src/core/inventory.js'), name: 'InventoryRules', formats: ['iife'] } },
});
const code = (Array.isArray(result) ? result : [result]).flatMap((entry) => entry.output).find((entry) => entry.type === 'chunk').code;
const dir = path.join(workspace, 'adapters/openui5/webapp/model');
await mkdir(dir, { recursive: true });
await writeFile(path.join(dir, 'rules.js'), `// 由 src/core 构建生成；请修改源文件后重新运行 lab dev/build。\nsap.ui.define([], function () {\n${code}\nreturn InventoryRules;\n});\n`);
const products = JSON.parse(await readFile(path.join(workspace, 'data/products.json')));
await writeFile(path.join(dir, 'products.json'), JSON.stringify({ products }, null, 2) + '\n');
console.log('共享 core → OpenUI5 rules.js；商品数据由工作区 data/products.json 生成。');
