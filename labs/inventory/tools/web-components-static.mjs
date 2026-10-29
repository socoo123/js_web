import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { build } from 'vite';
import { workspace, viteConfig } from './lab.mjs';

export async function staticWebComponents() {
  const config = await viteConfig('C43', true);
  const base = process.env.LAB_BASE ?? '/js_web/demos/inventory/';
  if (!base.startsWith('/') || !base.endsWith('/') || base === '/') throw new Error('静态检查需要带首尾 / 的非根子路径');
  const out = path.join(workspace, '.lab/web-components-static');
  config.base = base;
  config.build.outDir = out;
  config.logLevel = 'warn';
  await build(config);
  console.log(`C43 生产构建完成：${base}（完整资源写入 .lab/web-components-static）`);
  const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.woff': 'font/woff', '.map': 'application/json' };
  const server = createServer(async (request, response) => {
    try {
      const url = new URL(request.url, 'http://localhost');
      if (!url.pathname.startsWith(base)) throw new Error('outside base');
      const relative = decodeURIComponent(url.pathname.slice(base.length)) || 'index.html';
      const file = path.resolve(out, relative);
      if (!file.startsWith(out + path.sep) || !(await stat(file)).isFile()) throw new Error('not a file');
      response.writeHead(200, { 'Content-Type': types[path.extname(file)] ?? 'application/octet-stream', 'Cache-Control': 'no-store' });
      response.end(await readFile(file));
    } catch { response.writeHead(404, { 'Content-Type': 'text/plain' }); response.end('Not found'); }
  });
  await new Promise((resolve) => server.listen(Number(process.env.LAB_C43_PORT ?? 0), '127.0.0.1', resolve));
  return { url: `http://127.0.0.1:${server.address().port}${base}`, close: () => new Promise((resolve) => server.close(resolve)) };
}
