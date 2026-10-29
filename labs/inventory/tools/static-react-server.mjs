import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { build } from 'vite';
import { workspace, viteConfig } from './lab.mjs';
const base = '/js_web/demos/inventory/';
const out = path.join(workspace, '.lab/static-smoke');
const config = await viteConfig('C35', true);
config.base = base;
config.build.outDir = out;
await build(config);
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.map': 'application/json' };
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
server.listen(Number(process.env.LAB_E2E_PORT ?? 8064), '127.0.0.1');
for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, () => server.close(() => process.exit(0)));
