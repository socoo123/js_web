// 严格按文件提供 /js_web/，用于发现被 Vite SPA 回退掩盖的路径错误。
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { resolve, sep, extname } from "node:path";
import { fileURLToPath } from "node:url";

const base = "/js_web/";
const root = resolve(process.argv[3] ?? fileURLToPath(new URL("../dist/", import.meta.url)));
const port = Number(process.argv[2] ?? 4179);
const types = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8", ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml", ".map": "application/json", ".txt": "text/plain; charset=utf-8",
  ".woff2": "font/woff2", ".png": "image/png", ".ico": "image/x-icon",
};

const server = createServer(async (request, response) => {
  response.setHeader("Cache-Control", "no-store");
  try {
    if (!["GET", "HEAD"].includes(request.method)) {
      response.writeHead(405, { Allow: "GET, HEAD" }).end();
      return;
    }
    const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
    if (!pathname.startsWith(base)) throw new Error("outside base");
    let file = resolve(root, pathname.slice(base.length));
    if (file !== root && !file.startsWith(root + sep)) throw new Error("outside dist");
    if ((await stat(file)).isDirectory()) {
      if (!pathname.endsWith("/")) {
        const url = new URL(request.url, "http://localhost");
        response.writeHead(301, { Location: url.pathname + "/" + url.search }).end();
        return;
      }
      file = resolve(file, "index.html");
    }
    const body = await readFile(file);
    response.writeHead(200, { "Content-Type": types[extname(file)] ?? "application/octet-stream" });
    response.end(request.method === "HEAD" ? undefined : body);
  } catch {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end(request.method === "HEAD" ? undefined : "404：没有对应的静态文件\n");
  }
});
server.listen(port, "127.0.0.1", () => console.log(`静态文件预览：http://127.0.0.1:${port}${base}`));
