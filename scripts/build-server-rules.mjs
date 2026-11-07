// 从参考 core 生成 L5 本地后端的规则文件：node scripts/build-server-rules.mjs [--check]
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import * as validation from '../labs/reference/core/validation.js';
import * as summary from '../labs/reference/core/summary.js';
import * as filters from '../labs/reference/core/filters.js';

const target = fileURLToPath(new URL('../labs/inventory/server/rules.generated.mjs', import.meta.url));
const seed = JSON.parse(await readFile(new URL('../examples/shared/products.json', import.meta.url), 'utf8'));

// 服务端只需要这几个导出；它们引用的其他函数必须也在清单里，生成后会实际运行一次确认。
const sources = [
  ['validation.js', validation, ['validateProduct', 'validateProducts']],
  ['summary.js', summary, ['summarize']],
  ['filters.js', filters, ['selectProducts']],
];

function render() {
  const lines = [
    '// 生成物，只读。来源：labs/reference/core/{validation,summary,filters}.js。',
    '// 改 labs/reference/core 后在仓库根运行 node scripts/build-server-rules.mjs 重新生成。',
    '// 后端只 import 本文件，不 import 工作区 src/core：学员改自己的前端规则不会改变服务器行为。',
    '',
    `export const categories = [${validation.categories.map((name) => JSON.stringify(name)).join(', ')}];`,
  ];
  for (const [file, module, names] of sources) {
    for (const name of names) {
      if (typeof module[name] !== 'function') throw new Error(`参考 ${file} 缺少导出函数 ${name}`);
      lines.push('', `export ${module[name].toString()}`);
    }
  }
  return lines.join('\n') + '\n';
}

async function smokeTest(text) {
  const rules = await import(`data:text/javascript;base64,${Buffer.from(text).toString('base64')}`);
  const totals = rules.summarize(seed);
  const low = rules.selectProducts(seed, { query: ' usb ', category: '配件' });
  if (totals.count !== 6 || totals.stock !== 52 || totals.valueCents !== 2634800 || low[0]?.id !== 'P004') {
    throw new Error(`生成的规则与固定结果不符：${JSON.stringify({ totals, low: low.map((p) => p.id) })}`);
  }
  if (rules.validateProduct({ ...seed[0], stock: '' }).stock !== '库存必须是 0–99999 的整数') throw new Error('生成的 validateProduct 消息与参考不一致');
}

const text = render();
await smokeTest(text);
if (process.argv.includes('--check')) {
  const current = await readFile(target, 'utf8').catch(() => '');
  if (current !== text) {
    console.error('labs/inventory/server/rules.generated.mjs 与 labs/reference/core 不同步；运行 node scripts/build-server-rules.mjs 重新生成并提交。');
    process.exit(1);
  }
  console.log('服务端规则与参考 core 同步。');
} else {
  await writeFile(target, text);
  console.log('已生成 labs/inventory/server/rules.generated.mjs。');
}
