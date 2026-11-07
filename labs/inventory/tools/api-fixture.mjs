import { mkdtemp, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { workspace } from './lab.mjs';

// 检查与截图专用的后端：临时数据文件 + 随机端口。绝不读写学员的 .lab/server/products.json。
export async function startApiFixture({ root = workspace, corsOrigin } = {}) {
  const app = path.join(root, 'server/app.mjs');
  if (!existsSync(app)) throw new Error('工作区没有 server/：本地后端从 2026.11-v4.0 的 C44 起提供，按 Lab 总览的升级说明取得新工作区。');
  const { startApiServer } = await import(pathToFileURL(app));
  const dir = await mkdtemp(path.join(os.tmpdir(), 'inventory-api-check-'));
  const log = [];
  let api;
  try {
    api = await startApiServer({ port: 0, dataFile: path.join(dir, 'products.json'), seedFile: path.join(root, 'data/products.json'), corsOrigin, log: (line) => log.push(line) });
  } catch (error) { await rm(dir, { recursive: true, force: true }); throw error; }
  async function post(pathname, body) {
    const response = await fetch(api.origin + pathname, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: body && JSON.stringify(body) });
    if (response.status !== 204) throw new Error(`临时后端 ${pathname} 返回 ${response.status}：${await response.text()}`);
  }
  return {
    origin: api.origin, log,
    reset: () => post('/api/_lab/reset'),
    fault: (spec) => post('/api/_lab/faults', spec),
    async get(pathname) { return (await fetch(api.origin + pathname)).json(); },
    async patch(pathname, body, version) {
      const response = await fetch(api.origin + pathname, { method: 'PATCH', headers: { 'Content-Type': 'application/json', 'If-Match': `"${version}"` }, body: JSON.stringify(body) });
      if (!response.ok) throw new Error(`临时后端 PATCH ${pathname} 返回 ${response.status}：${await response.text()}`);
      return response.json();
    },
    async close() { await api.close(); await rm(dir, { recursive: true, force: true }); },
  };
}

// 学员 vite.config.js 里的 /api 代理换成指向临时后端，其余代理选项保留。
export function proxyTo(proxy, origin) {
  const own = proxy?.['/api'];
  if (!own) throw new Error('vite.config.js 缺少 server.proxy["/api"]：开发服务器需要把 /api 转发到 http://127.0.0.1:8070');
  return { ...proxy, '/api': typeof own === 'string' ? origin : { ...own, target: origin } };
}
