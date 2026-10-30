import assert from 'node:assert/strict';
import { readFile, readdir, realpath, stat } from 'node:fs/promises';
import path from 'node:path';
import { deliveryBase, deliveryOutput } from './static-react-server.mjs';
import { workspace } from './lab.mjs';

export async function verifyDeliveryFiles(root = deliveryOutput) {
  const html = await readFile(path.join(root, 'index.html'), 'utf8');
  const references = [...html.matchAll(/(?:src|href)="([^"]+)"/g)].map((match) => match[1]);
  assert(references.some((url) => url.endsWith('.js')), '缺少生产 JS 入口');
  assert(references.some((url) => url.endsWith('.css')), '缺少生产 CSS 入口');
  const actualRoot = await realpath(root);
  for (const url of references) {
    assert(url.startsWith(deliveryBase), `生产入口前缀错误：${url}；应以 ${deliveryBase} 开头。修改 vite.config.js 后重新 build。`);
    const file = await realpath(path.resolve(root, decodeURIComponent(url.slice(deliveryBase.length))));
    assert(file.startsWith(actualRoot + path.sep) && (await stat(file)).isFile(), `产物缺失或越界：${url}`);
  }
  const seed = JSON.parse(await readFile(path.join(workspace, 'data/products.json')));
  assert.deepEqual(JSON.parse(await readFile(path.join(root, 'products.json'))), seed, '生产静态数据与当前工作区不符');
  const assets = await readdir(path.join(root, 'assets'));
  const maps = assets.filter((name) => name.endsWith('.js.map'));
  assert(maps.length > 0, '缺少生产 source map');
  const sources = [];
  for (const name of maps) {
    const map = JSON.parse(await readFile(path.join(root, 'assets', name), 'utf8'));
    assert.equal(map.version, 3);
    assert.equal(map.sources.length, map.sourcesContent.length, `map 缺少源码内容：${name}`);
    sources.push(...map.sources);
  }
  assert(sources.some((name) => name.endsWith('/src/react/App.jsx') || name.endsWith('/App.jsx')), 'map 中找不到当前 App.jsx');
  assert(sources.some((name) => name.endsWith('/inventory-repository.js')), 'map 中找不到 repository');
  console.log(`生产文件：${references.length} 个入口资源、固定 JSON、${maps.length} 份同次构建 source map 通过。`);
}
