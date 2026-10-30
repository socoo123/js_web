import { createServer } from 'node:http';
import { readFile, realpath, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'vite';
import { workspace, viteConfig } from './lab.mjs';
export const deliveryBase = '/js_web/demos/inventory/';
export const deliveryOutput = path.join(workspace, 'dist/src-react');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.map': 'application/json', '.woff': 'font/woff', '.woff2': 'font/woff2' };

// Reuse the C35 strict file server. This function never rebuilds or repairs base.
export async function serveStatic({ root, port }) {
  const actualRoot = await realpath(root);
  await stat(path.join(actualRoot, 'index.html'));
  const server = createServer(async (request, response) => {
    try {
      if (!['GET', 'HEAD'].includes(request.method)) throw new Error('method');
      const url = new URL(request.url, 'http://localhost');
      if (!url.pathname.startsWith(deliveryBase)) throw new Error('outside base');
      const relative = decodeURIComponent(url.pathname.slice(deliveryBase.length)) || 'index.html';
      const file = await realpath(path.resolve(actualRoot, relative));
      if (!file.startsWith(actualRoot + path.sep) || !(await stat(file)).isFile()) throw new Error('not a file');
      response.writeHead(200, { 'Content-Type': types[path.extname(file)] ?? 'application/octet-stream', 'Cache-Control': 'no-store' });
      response.end(request.method === 'HEAD' ? undefined : await readFile(file));
    } catch { response.writeHead(404, { 'Content-Type': 'text/plain', 'Cache-Control': 'no-store' }); response.end('Not found'); }
  });
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(port, '127.0.0.1', resolve); });
  return server;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const existing = process.env.LAB_STATIC_ROOT;
    const out = existing ? path.resolve(workspace, existing) : path.join(workspace, '.lab/static-smoke');
    if (!existing) {
      // Preserve the original C35 smoke setup; C46 explicitly opts out of this build.
      const config = await viteConfig('C35', true);
      config.base = deliveryBase;
      config.build.outDir = out;
      await build(config);
    }
    const server = await serveStatic({ root: out, port: Number(process.env.LAB_E2E_PORT ?? (existing ? 8068 : 8064)) });
    console.log(`严格静态预览：http://127.0.0.1:${server.address().port}${deliveryBase}${existing ? '（只读已有产物，不build、不修复base）' : '（C35构建冒烟）'}`);
    for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, () => server.close(() => process.exit(0)));
  } catch (error) { console.error(`严格预览失败：${error.message}。已有产物模式需先执行 npm run lab -- build。`); process.exitCode = 1; }
}
