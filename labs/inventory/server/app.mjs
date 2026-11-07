// L5 本地库存后端：只用 Node 内置模块，只监听 127.0.0.1。启动方式见 server/README.md。
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { setTimeout as sleep } from 'node:timers/promises';
import { ApiError, sendEmpty, sendJson } from './http.mjs';
import { openInventory, resetDataFile as resetFile } from './store.mjs';
import { createFaultQueue } from './faults.mjs';
import { createRoutes } from './routes.mjs';

export { DataFileError } from './store.mjs';

const workspace = fileURLToPath(new URL('../', import.meta.url));
export const defaultDataFile = path.join(workspace, '.lab/server/products.json');
export const defaultSeedFile = path.join(workspace, 'data/products.json');
export const defaultPort = 8070;

export function optionsFromEnv(env = process.env) {
  const port = env.LAB_API_PORT ? Number(env.LAB_API_PORT) : defaultPort;
  if (!Number.isInteger(port) || port < 0 || port > 65535) throw new Error(`LAB_API_PORT 必须是 0–65535 的整数：${env.LAB_API_PORT}`);
  return {
    port,
    dataFile: env.LAB_API_DATA ? path.resolve(env.LAB_API_DATA) : defaultDataFile,
    seedFile: defaultSeedFile,
    corsOrigin: env.LAB_API_CORS_ORIGIN || undefined,
  };
}

export function resetDataFile({ dataFile = defaultDataFile, seedFile = defaultSeedFile } = {}) {
  return resetFile(dataFile, seedFile);
}

// 默认不发任何 CORS 头；只有配置了来源且请求的 Origin 完全相等时才放行。
function applyCors(request, response, corsOrigin) {
  if (!corsOrigin || request.headers.origin !== corsOrigin) return;
  response.setHeader('Access-Control-Allow-Origin', corsOrigin);
  response.setHeader('Vary', 'Origin');
  response.setHeader('Access-Control-Expose-Headers', 'ETag, Location');
  if (request.method === 'OPTIONS') {
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type, If-Match');
  }
}

function displayUrl(url) {
  try {
    return decodeURI(url);
  } catch {
    return url;
  }
}

function requestLine(request, response, startedAt, context) {
  const finished = response.writableFinished;
  let line = `${request.method} ${displayUrl(request.url)} ${finished ? response.statusCode : '-'} ${Math.round(performance.now() - startedAt)}ms`;
  if (context.injected) line += ' 注入故障';
  if (!finished) line += ' 客户端已断开';
  return line;
}

// 返回 true 表示故障已经替代了正常响应。
async function applyFault(fault, response) {
  if (fault.delayMs) await sleep(fault.delayMs, undefined, { ref: false });
  if (fault.status === undefined) return false;
  sendJson(response, fault.status, fault.body ?? { error: { code: 'FAULT', message: `注入的故障：${fault.status}` } });
  return true;
}

function route(routes, request, response, url) {
  for (const { path: pattern, methods } of routes) {
    const match = pattern.exec(url.pathname);
    if (!match) continue;
    const handler = methods[request.method];
    if (!handler) {
      const allow = Object.keys(methods).join(', ');
      throw new ApiError(405, 'METHOD_NOT_ALLOWED', `${url.pathname} 不支持 ${request.method}；可用：${allow}`, { headers: { Allow: allow } });
    }
    return handler({ request, response, url, id: match[1] });
  }
  throw new ApiError(404, 'NOT_FOUND', `没有这个接口：${request.method} ${url.pathname}`);
}

function sendError(response, error, context) {
  if (response.headersSent) {
    response.destroy();
    return;
  }
  if (error instanceof ApiError) {
    sendJson(response, error.status, error.toBody(), error.headers);
    return;
  }
  context.cause = error.message;
  sendJson(response, 500, { error: { code: 'INTERNAL', message: `服务器内部错误：${error.message}` } });
}

export function createApiServer({ dataFile = defaultDataFile, seedFile = defaultSeedFile, corsOrigin, log = console.log } = {}) {
  const inventory = openInventory(dataFile, seedFile);
  const faults = createFaultQueue();
  const routes = createRoutes({ inventory, faults });

  async function handle(request, response) {
    const startedAt = performance.now();
    const context = { injected: false, cause: null };
    response.on('close', () => {
      log(requestLine(request, response, startedAt, context));
      if (context.cause) log(`  原因：${context.cause}`);
    });
    applyCors(request, response, corsOrigin);
    try {
      const url = new URL(request.url, 'http://127.0.0.1');
      if (!url.pathname.startsWith('/api/')) throw new ApiError(404, 'NOT_FOUND', `没有这个接口：${url.pathname}（后端只处理 /api/ 开头的路径）`);
      // /api/_lab/* 是排错用的控制接口，自身不受故障影响。
      const fault = url.pathname.startsWith('/api/_lab/') ? null : faults.take(request.method, url.pathname);
      if (fault) {
        context.injected = true;
        if (await applyFault(fault, response)) return;
      }
      if (request.method === 'OPTIONS') {
        sendEmpty(response, 204);
        return;
      }
      await route(routes, request, response, url);
    } catch (error) {
      sendError(response, error, context);
    } finally {
      request.resume();
    }
  }

  return http.createServer((request, response) => {
    handle(request, response);
  });
}

function listen(server, port, host) {
  return new Promise((resolve, reject) => {
    const fail = (error) => {
      if (error.code !== 'EADDRINUSE') return reject(error);
      reject(Object.assign(new Error(`${port} 已被占用：可能已有一个 api 在运行。先在那个终端按 Ctrl+C 停止，或设置 LAB_API_PORT 换端口。`), { code: 'EADDRINUSE' }));
    };
    server.once('error', fail);
    server.listen(port, host, () => {
      server.off('error', fail);
      resolve();
    });
  });
}

export async function startApiServer({ port = defaultPort, host = '127.0.0.1', dataFile, seedFile, corsOrigin, log } = {}) {
  const server = createApiServer({ dataFile, seedFile, corsOrigin, log });
  await listen(server, port, host);
  const origin = `http://${host}:${server.address().port}`;
  const close = () => new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
    server.closeAllConnections();
  });
  return { server, origin, close };
}
