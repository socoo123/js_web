import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
const root = resolve("dist");
const prefix = "/js_web/ui5-react/";
const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".woff2": "font/woff2", ".svg": "image/svg+xml" };
createServer(async (request, response) => {
  try {
    const url = new URL(request.url, "http://localhost");
    if (!url.pathname.startsWith(prefix)) throw new Error("path");
    const file = resolve(root, decodeURIComponent(url.pathname.slice(prefix.length)) || "index.html");
    if (!file.startsWith(root + sep)) throw new Error("path");
    const content = await readFile(file);
    response.writeHead(200, { "Content-Type": types[extname(file)] ?? "application/octet-stream" });
    response.end(content);
  } catch { response.writeHead(404); response.end("Not found"); }
}).listen(8144, "127.0.0.1");
