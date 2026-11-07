// 后端契约测试：node --test server/test/（工作区）或 node --test labs/inventory/server/test/（仓库根）。
// 每个用例用自己的临时数据文件和随机端口，不碰 .lab/server/products.json。
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readdir, readFile, rm, rmdir, stat, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createApiServer, DataFileError, resetDataFile, startApiServer } from '../app.mjs';

const serverDir = fileURLToPath(new URL('../', import.meta.url));
const seedFile = fileURLToPath(new URL('../../data/products.json', import.meta.url));
const rulesScript = fileURLToPath(new URL('../../../../scripts/build-server-rules.mjs', import.meta.url));
const initialTotals = { count: 6, stock: 52, valueCents: 2634800, soldOut: 1, lowStock: 2 };
const adapter = { name: '随身转接头', category: '配件', stock: 3, priceCents: 29, tags: [] };

async function tempDir(t) {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'inventory-api-'));
  t.after(() => rm(dir, { recursive: true, force: true }));
  return dir;
}

async function startApi(t, options = {}) {
  const dir = await tempDir(t);
  const lines = [];
  const dataFile = options.dataFile ?? path.join(dir, 'products.json');
  const api = await startApiServer({ port: 0, seedFile, log: (line) => lines.push(line), ...options, dataFile });
  t.after(() => api.close());
  async function call(method, url, { body, headers } = {}) {
    const response = await fetch(api.origin + url, { method, headers, body: typeof body === 'string' || body === undefined ? body : JSON.stringify(body) });
    const text = await response.text();
    return { status: response.status, headers: response.headers, body: text ? JSON.parse(text) : null };
  }
  return { ...api, dir, dataFile, lines, call };
}

const ids = (items) => items.map((product) => product.id);
const readData = async (file) => JSON.parse(await readFile(file, 'utf8'));
const waitForLog = async (lines, count) => {
  for (let i = 0; i < 50 && lines.length < count; i++) await new Promise((resolve) => setTimeout(resolve, 10));
};

test('首次启动从固定数据生成数据文件；createApiServer 返回未监听的服务器', async (t) => {
  const dir = await tempDir(t);
  const dataFile = path.join(dir, 'nested/products.json');
  const server = createApiServer({ dataFile, seedFile, log: () => {} });
  assert.equal(server.listening, false);
  const data = await readData(dataFile);
  assert.equal(data.format, 1);
  assert.deepEqual(ids(data.products), ['P001', 'P002', 'P003', 'P004', 'P005', 'P006']);
  assert(data.products.every((product) => product.version === 1));
});

test('初始 6/52/2634800；stock=low 得 P004/P006；分页不影响 summary', async (t) => {
  const { call } = await startApi(t);
  const health = await call('GET', '/api/health');
  assert.deepEqual([health.status, health.body], [200, { ok: true }]);
  assert.equal(health.headers.get('content-type'), 'application/json; charset=utf-8');
  assert.equal(health.headers.get('cache-control'), 'no-store');

  const all = await call('GET', '/api/products');
  assert.equal(all.status, 200);
  assert.deepEqual(Object.keys(all.body), ['items', 'page', 'pageSize', 'total', 'summary', 'totals']);
  assert.deepEqual([all.body.page, all.body.pageSize, all.body.total], [1, 20, 6]);
  assert.deepEqual(all.body.totals, initialTotals);
  assert.deepEqual(all.body.summary, initialTotals);
  assert.deepEqual(all.body.items[3], { id: 'P004', name: 'USB-C 扩展坞', category: '配件', stock: 3, priceCents: 29900, tags: ['热销', '新品'], version: 1 });

  const low = await call('GET', '/api/products?stock=low');
  assert.deepEqual(ids(low.body.items), ['P004', 'P006']);
  assert.deepEqual(low.body.summary, { count: 2, stock: 8, valueCents: 539200, soldOut: 0, lowStock: 2 });
  assert.deepEqual(low.body.totals, initialTotals);
  assert.equal(low.body.total, 2);

  const paged = await call('GET', '/api/products?pageSize=2&page=2');
  assert.deepEqual(ids(paged.body.items), ['P003', 'P004']);
  assert.deepEqual([paged.body.page, paged.body.pageSize, paged.body.total], [2, 2, 6]);
  assert.deepEqual(paged.body.summary, initialTotals);
  assert.deepEqual((await call('GET', '/api/products?page=9')).body.items, []);
});

test('列表筛选与排序：q、category、stock=out、sort，未知参数忽略', async (t) => {
  const { call } = await startApi(t);
  const list = async (query) => ids((await call('GET', `/api/products?${query}`)).body.items);
  assert.deepEqual(await list('q=%20usb%20'), ['P004']);
  assert.deepEqual(await list(`q=p00&category=${encodeURIComponent('配件')}`), ['P004', 'P005']);
  assert.deepEqual(await list(`category=${encodeURIComponent('全部')}&stock=out`), ['P002']);
  assert.deepEqual(await list('sort=stock'), ['P002', 'P004', 'P006', 'P003', 'P001', 'P005']);
  assert.deepEqual(await list('sort=-stock'), ['P005', 'P001', 'P003', 'P006', 'P004', 'P002']);
  const seed = JSON.parse(await readFile(seedFile, 'utf8'));
  const byName = [...seed].sort((a, b) => a.name.localeCompare(b.name, 'zh-Hans-CN') || (a.id < b.id ? -1 : 1));
  assert.deepEqual(await list('sort=name'), ids(byName));
  assert.deepEqual(await list('debug=1&stock=low'), ['P004', 'P006']);
});

test('非法查询参数 → 400 BAD_QUERY，fields 写明参数', async (t) => {
  const { call } = await startApi(t);
  const cases = [
    [`category=${encodeURIComponent('玩具')}`, 'category'], ['stock=few', 'stock'], ['stock=', 'stock'], ['sort=price', 'sort'],
    ['page=0', 'page'], ['page=1.5', 'page'], ['page=abc', 'page'], ['pageSize=51', 'pageSize'], ['pageSize=0', 'pageSize'],
  ];
  for (const [query, field] of cases) {
    const result = await call('GET', `/api/products?${query}`);
    assert.equal(result.status, 400, query);
    assert.equal(result.body.error.code, 'BAD_QUERY');
    assert.deepEqual(Object.keys(result.body.error.fields), [field], query);
  }
});

test('PATCH：If-Match 1 改 P004 为 8 → version 2、totals 57；旧版本 409；缺 If-Match 428；空白库存 422，0 合法', async (t) => {
  const { call, dataFile } = await startApi(t);
  const one = await call('GET', '/api/products/P004');
  assert.equal(one.headers.get('etag'), '"1"');

  const saved = await call('PATCH', '/api/products/P004', { headers: { 'If-Match': '"1"' }, body: { stock: 8 } });
  assert.equal(saved.status, 200);
  assert.deepEqual([saved.body.stock, saved.body.version, saved.headers.get('etag')], [8, 2, '"2"']);
  assert.equal((await call('GET', '/api/products')).body.totals.stock, 57);

  const stale = await call('PATCH', '/api/products/P004', { headers: { 'If-Match': '"1"' }, body: { stock: 9 } });
  assert.equal(stale.status, 409);
  assert.equal(stale.body.error.code, 'CONFLICT');
  assert.deepEqual([stale.body.error.current.stock, stale.body.error.current.version], [8, 2]);

  const missing = await call('PATCH', '/api/products/P004', { body: { stock: 9 } });
  assert.deepEqual([missing.status, missing.body.error.code], [428, 'PRECONDITION_REQUIRED']);

  const blank = await call('PATCH', '/api/products/P004', { headers: { 'If-Match': '2' }, body: { stock: '' } });
  assert.equal(blank.status, 422);
  assert.equal(blank.body.error.code, 'VALIDATION');
  assert.deepEqual(blank.body.error.fields, { stock: '库存必须是 0–99999 的整数' });

  const zero = await call('PATCH', '/api/products/P004', { headers: { 'If-Match': '2' }, body: { stock: 0 } });
  assert.deepEqual([zero.status, zero.body.stock, zero.body.version], [200, 0, 3]);
  assert.equal((await call('PATCH', '/api/products/P004', { headers: { 'If-Match': 'W/"3"' }, body: { stock: 1 } })).status, 409);

  const locked = await call('PATCH', '/api/products/P004', { headers: { 'If-Match': '"3"' }, body: { id: 'P100', version: 9, color: 'red' } });
  assert.equal(locked.status, 422);
  assert.equal(locked.body.error.fields.id, '编号不能修改');
  assert.deepEqual(Object.keys(locked.body.error.fields).sort(), ['color', 'id', 'version']);

  const renamed = await call('PATCH', '/api/products/P004', { headers: { 'If-Match': '"3"' }, body: { name: '  扩展坞 Pro  ', tags: [] } });
  assert.deepEqual([renamed.body.name, renamed.body.tags, renamed.body.version], ['扩展坞 Pro', [], 4]);
  const stored = (await readData(dataFile)).products.find((product) => product.id === 'P004');
  assert.deepEqual([stored.name, stored.stock, stored.version], ['扩展坞 Pro', 0, 4]);
});

test('PATCH 检查顺序：404 → 428 → 400 → 409 → 422', async (t) => {
  const { call } = await startApi(t);
  const patch = (id, ifMatch, body) => call('PATCH', `/api/products/${id}`, { headers: ifMatch ? { 'If-Match': ifMatch } : {}, body });
  assert.equal((await patch('P999', null, '{坏')).status, 404);
  assert.equal((await patch('P004', null, '{坏')).status, 428);
  const badJson = await patch('P004', '"9"', '{坏');
  assert.deepEqual([badJson.status, badJson.body.error.code], [400, 'BAD_JSON']);
  assert.equal((await patch('P004', '"9"', '[1]')).status, 400);
  assert.equal((await patch('P004', '"9"', { stock: -1 })).status, 409);
  assert.equal((await patch('P004', '"1"', { stock: -1 })).status, 422);
});

test('新建「随身转接头」→ 201 P007、totals 7/55/2634887；DELETE 后 GET 404', async (t) => {
  const { call } = await startApi(t);
  const created = await call('POST', '/api/products', { body: { id: 'P100', version: 5, ...adapter, name: '  随身转接头 ' } });
  assert.equal(created.status, 201);
  assert.equal(created.headers.get('location'), '/api/products/P007');
  assert.equal(created.headers.get('etag'), '"1"');
  assert.deepEqual(created.body, { id: 'P007', ...adapter, version: 1 });
  const totals = (await call('GET', '/api/products')).body.totals;
  assert.deepEqual([totals.count, totals.stock, totals.valueCents], [7, 55, 2634887]);

  const invalid = await call('POST', '/api/products', { body: {} });
  assert.equal(invalid.status, 422);
  assert.deepEqual(invalid.body.error.fields, {
    name: '名称需要 1–40 个字符', category: '分类无效', stock: '库存必须是 0–99999 的整数',
    priceCents: '价格必须是非负安全整数分', tags: '标签必须是字符串数组',
  });

  const removed = await call('DELETE', '/api/products/P007');
  assert.deepEqual([removed.status, removed.body], [204, null]);
  assert.equal((await call('GET', '/api/products/P007')).status, 404);
  assert.equal((await call('DELETE', '/api/products/P007')).status, 404);
});

test('编号用尽：已有 P999 时新建 → 422 fields.id', async (t) => {
  const dir = await tempDir(t);
  const dataFile = path.join(dir, 'products.json');
  await writeFile(dataFile, JSON.stringify({ format: 1, products: [{ id: 'P999', ...adapter, version: 1 }] }));
  const { call } = await startApi(t, { dataFile });
  const result = await call('POST', '/api/products', { body: adapter });
  assert.equal(result.status, 422);
  assert.deepEqual(Object.keys(result.body.error.fields), ['id']);
});

test('补货：quantity 1–99999，结果不超过 99999', async (t) => {
  const { call } = await startApi(t);
  const restocked = await call('POST', '/api/products/P004/restock', { body: { quantity: 3 } });
  assert.deepEqual([restocked.status, restocked.body.stock, restocked.body.version, restocked.headers.get('etag')], [200, 6, 2, '"2"']);
  for (const quantity of [0, 1.5, '3', 100000, null]) {
    const result = await call('POST', '/api/products/P004/restock', { body: { quantity } });
    assert.equal(result.status, 422, String(quantity));
    assert.deepEqual(Object.keys(result.body.error.fields), ['quantity']);
  }
  const overflow = await call('POST', '/api/products/P005/restock', { body: { quantity: 99990 } });
  assert.equal(overflow.status, 422);
  assert.match(overflow.body.error.fields.quantity, /不能超过 99999/);
  assert.equal((await call('POST', '/api/products/P404/restock', { body: { quantity: 1 } })).status, 404);
  assert.equal((await call('POST', '/api/products/P004/restock', { body: 'quantity=3' })).status, 400);
});

test('reset：回到初始数据、version 全为 1，并清空注入的故障', async (t) => {
  const { call, dataFile } = await startApi(t);
  await call('PATCH', '/api/products/P004', { headers: { 'If-Match': '1' }, body: { stock: 8 } });
  await call('POST', '/api/products', { body: adapter });
  await call('POST', '/api/_lab/faults', { body: { method: 'GET', path: '/api/health', status: 500, times: 5 } });
  const reset = await call('POST', '/api/_lab/reset');
  assert.deepEqual([reset.status, reset.body], [204, null]);
  const list = await call('GET', '/api/products');
  assert.deepEqual(list.body.totals, initialTotals);
  assert(list.body.items.every((product) => product.version === 1));
  assert.equal((await call('GET', '/api/health')).status, 200);
  assert((await readData(dataFile)).products.every((product) => product.version === 1));
});

test('通用错误：坏 JSON 400、405 带 Allow、请求体超过 64KB 413、未知路径 404', async (t) => {
  const { call } = await startApi(t);
  for (const body of ['{坏', '', '[]', '"文本"', 'null']) {
    const result = await call('POST', '/api/products', { body });
    assert.deepEqual([result.status, result.body.error.code], [400, 'BAD_JSON'], JSON.stringify(body));
  }
  const notAllowed = await call('PUT', '/api/products');
  assert.deepEqual([notAllowed.status, notAllowed.body.error.code, notAllowed.headers.get('allow')], [405, 'METHOD_NOT_ALLOWED', 'GET, POST']);
  const tooLarge = await call('POST', '/api/products', { body: { ...adapter, name: 'x'.repeat(70 * 1024) } });
  assert.deepEqual([tooLarge.status, tooLarge.body.error.code], [413, 'PAYLOAD_TOO_LARGE']);
  for (const url of ['/api/nothing', '/api', '/index.html', '/api/products/P001/extra']) {
    const result = await call('GET', url);
    assert.deepEqual([result.status, result.body.error.code], [404, 'NOT_FOUND'], url);
  }
});

test('故障注入：500 一次后恢复；按注入顺序消耗；自定义 body；只按路径匹配', async (t) => {
  const { call, lines } = await startApi(t);
  const inject = (fault) => call('POST', '/api/_lab/faults', { body: fault });
  assert.equal((await inject({ method: 'GET', path: '/api/products', status: 500 })).status, 204);
  const failed = await call('GET', '/api/products?stock=low');
  assert.deepEqual([failed.status, failed.body], [500, { error: { code: 'FAULT', message: '注入的故障：500' } }]);
  assert.equal((await call('GET', '/api/products?stock=low')).status, 200);
  await waitForLog(lines, 3);
  assert.match(lines.at(-2), /^GET \/api\/products\?stock=low 500 \d+ms 注入故障$/);
  assert.match(lines.at(-1), /^GET \/api\/products\?stock=low 200 \d+ms$/);

  await inject({ method: 'PATCH', path: '/api/products/P004', status: 503 });
  await inject({ method: 'PATCH', path: '/api/products/P004', status: 502, times: 2 });
  const statuses = [];
  for (let i = 0; i < 4; i++) statuses.push((await call('PATCH', '/api/products/P004', { headers: { 'If-Match': '1' }, body: { stock: 4 } })).status);
  assert.deepEqual(statuses, [503, 502, 502, 200]);

  const teapot = { error: { code: 'TEAPOT', message: '自定义响应体' } };
  await inject({ method: 'GET', path: '/api/health', status: 418, body: teapot });
  assert.deepEqual(await call('GET', '/api/health').then((r) => [r.status, r.body]), [418, teapot]);
});

test('故障参数不合法 → 422；请求体不是 JSON 对象 → 400', async (t) => {
  const { call } = await startApi(t);
  const cases = [
    [{ method: 'get', path: '/api/health', status: 500 }, ['method']],
    [{ method: 'GET', status: 500 }, ['path']],
    [{ method: 'GET', path: '/api/products?stock=low', status: 500 }, ['path']],
    [{ method: 'POST', path: '/api/_lab/reset', status: 500 }, ['path']],
    [{ method: 'GET', path: '/api/health', status: 600 }, ['status']],
    [{ method: 'GET', path: '/api/health', delayMs: 20000 }, ['delayMs']],
    [{ method: 'GET', path: '/api/health' }, ['status', 'delayMs']],
    [{ method: 'GET', path: '/api/health', status: 500, times: 0 }, ['times']],
    [{ method: 'GET', path: '/api/health', status: 500, body: [] }, ['body']],
  ];
  for (const [fault, fields] of cases) {
    const result = await call('POST', '/api/_lab/faults', { body: fault });
    assert.equal(result.status, 422, JSON.stringify(fault));
    assert.deepEqual(Object.keys(result.body.error.fields).sort(), [...fields].sort(), JSON.stringify(fault));
  }
  assert.equal((await call('POST', '/api/_lab/faults', { body: '{坏' })).status, 400);
});

test('延迟故障：等待后照常处理，只影响一次', async (t) => {
  const { call, lines } = await startApi(t);
  await call('POST', '/api/_lab/faults', { body: { method: 'GET', path: '/api/products/P001', delayMs: 300 } });
  let started = performance.now();
  const slow = await call('GET', '/api/products/P001');
  assert(performance.now() - started >= 280, '延迟没有生效');
  assert.deepEqual([slow.status, slow.body.id], [200, 'P001']);
  await waitForLog(lines, 2);
  assert.match(lines.at(-1), /^GET \/api\/products\/P001 200 \d+ms 注入故障$/);
  started = performance.now();
  await call('GET', '/api/products/P001');
  assert(performance.now() - started < 250, '延迟只应生效一次');
});

test('CORS：默认不发任何 Access-Control-* 头；设置来源后只放行完全相同的来源', async (t) => {
  const origin = 'http://127.0.0.1:8060';
  const corsHeaders = (headers) => [...headers.keys()].filter((name) => name.startsWith('access-control-'));
  const closed = await startApi(t);
  assert.deepEqual(corsHeaders((await closed.call('GET', '/api/health', { headers: { Origin: origin } })).headers), []);
  const preflight = await closed.call('OPTIONS', '/api/products/P004', { headers: { Origin: origin, 'Access-Control-Request-Method': 'PATCH' } });
  assert.equal(preflight.status, 204);
  assert.deepEqual(corsHeaders(preflight.headers), []);

  const open = await startApi(t, { corsOrigin: origin });
  const allowed = await open.call('GET', '/api/products/P004', { headers: { Origin: origin } });
  assert.equal(allowed.headers.get('access-control-allow-origin'), origin);
  assert.equal(allowed.headers.get('vary'), 'Origin');
  assert.equal(allowed.headers.get('access-control-expose-headers'), 'ETag, Location');
  const allowedPreflight = await open.call('OPTIONS', '/api/products/P004', { headers: { Origin: origin, 'Access-Control-Request-Method': 'PATCH' } });
  assert.equal(allowedPreflight.status, 204);
  assert.equal(allowedPreflight.headers.get('access-control-allow-methods'), 'GET, POST, PATCH, DELETE');
  assert.equal(allowedPreflight.headers.get('access-control-allow-headers'), 'Content-Type, If-Match');
  assert.deepEqual(corsHeaders((await open.call('GET', '/api/health', { headers: { Origin: 'http://localhost:8060' } })).headers), []);
});

test('日志：每个请求一行「方法 路径?查询 状态 耗时ms」', async (t) => {
  const { call, lines } = await startApi(t);
  await call('GET', '/api/products?stock=low');
  await call('GET', `/api/products?q=${encodeURIComponent('键盘')}`);
  await call('PATCH', '/api/products/P004', { body: { stock: 8 } });
  await call('GET', '/favicon.ico');
  await waitForLog(lines, 4);
  assert.equal(lines.length, 4);
  assert.match(lines[0], /^GET \/api\/products\?stock=low 200 \d+ms$/);
  assert.match(lines[1], /^GET \/api\/products\?q=键盘 200 \d+ms$/);
  assert.match(lines[2], /^PATCH \/api\/products\/P004 428 \d+ms$/);
  assert.match(lines[3], /^GET \/favicon\.ico 404 \d+ms$/);
});

test('数据文件损坏：拒绝启动并提示 reset；reset 另存损坏文件后恢复', async (t) => {
  const dir = await tempDir(t);
  const dataFile = path.join(dir, 'products.json');
  const valid = (products) => JSON.stringify({ format: 1, products });
  const seed = JSON.parse(await readFile(seedFile, 'utf8')).map((product) => ({ ...product, version: 1 }));
  const damaged = [
    ['{坏', /不是合法 JSON/],
    [JSON.stringify(seed), /format/],
    [valid([{ ...seed[3], stock: -1 }]), /P004.*库存必须是 0–99999 的整数/],
    [valid([seed[0], seed[0]]), /重复编号 P001/],
    [valid([{ ...seed[0], version: 0 }]), /version 必须是正整数/],
  ];
  for (const [text, reason] of damaged) {
    await writeFile(dataFile, text);
    assert.throws(() => createApiServer({ dataFile, seedFile, log: () => {} }), (error) => {
      assert(error instanceof DataFileError);
      assert.match(error.message, /^数据文件损坏：.*products\.json（/);
      assert.match(error.message, reason);
      assert.match(error.message, /运行 npm run lab -- api reset 恢复固定数据；损坏文件会另存，不会删除。$/);
      return true;
    });
  }
  await assert.rejects(startApiServer({ port: 0, dataFile, seedFile, log: () => {} }), DataFileError);

  const before = await readFile(dataFile, 'utf8');
  const result = resetDataFile({ dataFile, seedFile });
  assert.match(path.basename(result.damagedFile), /^products\.json\.damaged-\d{4}-\d{2}-\d{2}T\d{6}\.\d{3}Z$/);
  assert.equal(await readFile(result.damagedFile, 'utf8'), before);
  assert.deepEqual((await readData(dataFile)).products, seed);

  const again = resetDataFile({ dataFile, seedFile });
  assert.equal(again.damagedFile, null);
  assert.equal((await readdir(dir)).filter((name) => name.includes('.damaged-')).length, 1);
  const { call } = await startApi(t, { dataFile });
  assert.deepEqual((await call('GET', '/api/products')).body.totals, initialTotals);
});

test('写入是原子的：先写临时文件再改名；写盘失败返回 500，文件与内存都不变', async (t) => {
  const { call, dataFile, lines } = await startApi(t);
  const inode = (await stat(dataFile)).ino;
  assert.equal((await call('PATCH', '/api/products/P004', { headers: { 'If-Match': '1' }, body: { stock: 8 } })).status, 200);
  assert.notEqual((await stat(dataFile)).ino, inode, '应当用 rename 替换整个文件');
  assert(!existsSync(`${dataFile}.tmp`));

  const before = await readFile(dataFile, 'utf8');
  await mkdir(`${dataFile}.tmp`);
  const failed = await call('PATCH', '/api/products/P004', { headers: { 'If-Match': '2' }, body: { stock: 1 } });
  assert.deepEqual([failed.status, failed.body.error.code], [500, 'INTERNAL']);
  assert.match(failed.body.error.message, /本次修改未生效/);
  assert.equal(await readFile(dataFile, 'utf8'), before);
  const current = (await call('GET', '/api/products/P004')).body;
  assert.deepEqual([current.stock, current.version], [8, 2]);
  await waitForLog(lines, 4);
  assert(lines.some((line) => line.startsWith('  原因：')));

  await rmdir(`${dataFile}.tmp`);
  const retried = await call('PATCH', '/api/products/P004', { headers: { 'If-Match': '2' }, body: { stock: 1 } });
  assert.deepEqual([retried.status, retried.body.version], [200, 3]);
  assert.equal((await readData(dataFile)).products[3].stock, 1);
});

test('服务端只 import 生成的规则，不 import 工作区 src/core', async () => {
  for (const name of await readdir(serverDir)) {
    if (!name.endsWith('.mjs')) continue;
    const text = await readFile(path.join(serverDir, name), 'utf8');
    assert.doesNotMatch(text, /(from|import\()\s*['"][^'"]*src\/core/, name);
  }
});

test('服务端规则生成物与参考 core 同步', { skip: !existsSync(rulesScript) && '工作区快照里没有仓库脚本' }, () => {
  const result = spawnSync(process.execPath, [rulesScript, '--check'], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
});
