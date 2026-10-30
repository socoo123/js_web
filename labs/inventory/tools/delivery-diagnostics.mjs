import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createServer } from 'vite';
import { chromium, expect } from '@playwright/test';
import { workspace, viteConfig } from './lab.mjs';

// Author diagnostic on actual C45 files, using a disposable context and CDP.
// Does not stand in for the learner interpreting Performance/Memory in DevTools.
const config = await viteConfig('C45');
config.server.port = Number(process.env.LAB_DELIVERY_PORT ?? 8068);
config.server.hmr = false;
const server = await createServer(config);
let browser;
try {
  await server.listen();
  browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(`http://127.0.0.1:${config.server.port}/`);
  await expect(page.locator('#list article')).toHaveCount(6);
  const cdp = await context.newCDPSession(page);
  await cdp.send('Performance.enable');
  async function listeners() {
    const { result } = await cdp.send('Runtime.evaluate', { expression: 'window', objectGroup: 'delivery-diagnostic' });
    try {
      const { listeners } = await cdp.send('DOMDebugger.getEventListeners', { objectId: result.objectId });
      const count = listeners.filter((listener) => listener.type === 'keydown' && listener.handler?.description.includes('onKey')).length;
      for (const objectId of new Set(listeners.flatMap((item) => [item.handler?.objectId, item.originalHandler?.objectId]).filter(Boolean))) await cdp.send('Runtime.releaseObject', { objectId });
      return count;
    } finally { await cdp.send('Runtime.releaseObjectGroup', { objectGroup: 'delivery-diagnostic' }); }
  }
  const dir = path.join(workspace, '.lab/delivery-diagnostics');
  await mkdir(dir, { recursive: true });
  async function snapshot(name) {
    await cdp.send('HeapProfiler.collectGarbage');
    const chunks = [];
    const receive = ({ chunk }) => chunks.push(chunk);
    cdp.on('HeapProfiler.addHeapSnapshotChunk', receive);
    try { await cdp.send('HeapProfiler.takeHeapSnapshot', { reportProgress: false }); }
    finally { cdp.off('HeapProfiler.addHeapSnapshotChunk', receive); }
    const text = chunks.join('');
    await writeFile(path.join(dir, `${name}.heapsnapshot`), text);
    const heap = JSON.parse(text);
    const fields = heap.snapshot.meta.node_fields;
    const type = fields.indexOf('type'); const nameIndex = fields.indexOf('name');
    const types = heap.snapshot.meta.node_types[type];
    let onKeyClosures = 0;
    for (let index = 0; index < heap.nodes.length; index += fields.length) {
      if (types[heap.nodes[index + type]] === 'closure' && heap.strings[heap.nodes[index + nameIndex]] === 'onKey') onKeyClosures++;
    }
    return { bytes: Buffer.byteLength(text), onKeyClosures };
  }
  const beforeListeners = await listeners();
  const beforeHeap = await snapshot('before');
  for (let round = 0; round < 3; round++) {
    await page.getByLabel('分类', { exact: true }).selectOption('外设');
    await expect(page.locator('#list article')).toHaveCount(2);
    await page.getByLabel('分类', { exact: true }).selectOption('全部');
    await expect(page.locator('#list article')).toHaveCount(6);
  }
  const afterListeners = await listeners();
  const afterHeap = await snapshot('after');
  const modules = [];
  page.on('request', (request) => { if (request.url().includes('/ReportPanel.jsx')) modules.push(request.url()); });
  const metrics = async () => Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map(({ name, value }) => [name, value]));
  const start = await metrics();
  await page.getByRole('button', { name: '查看分类报表', exact: true }).click();
  await expect(page.getByRole('row', { name: '配件 2 28 587200', exact: true })).toBeVisible();
  const first = await metrics(); const firstModuleRequests = modules.length;
  await page.getByRole('button', { name: '收起分类报表', exact: true }).click();
  await page.getByRole('button', { name: '查看分类报表', exact: true }).click();
  await expect(page.getByRole('row', { name: '配件 2 28 587200', exact: true })).toBeVisible();
  const second = await metrics();
  const evidence = {
    categoryCycles: 3, keydown: { before: beforeListeners, after: afterListeners },
    heap: { before: beforeHeap, after: afterHeap },
    report: { firstModuleRequests, totalModuleRequestsAfterReopen: modules.length,
      firstScriptSeconds: first.ScriptDuration - start.ScriptDuration, reopenScriptSeconds: second.ScriptDuration - first.ScriptDuration,
      firstTaskSeconds: first.TaskDuration - start.TaskDuration, reopenTaskSeconds: second.TaskDuration - first.TaskDuration },
    interpretation: '采样只作本机前后证据；不设固定耗时门槛，不凭堆总字节判断泄漏。heap文件只在本次隔离工作区.lab内。',
  };
  await writeFile(path.join(dir, 'evidence.json'), JSON.stringify(evidence, null, 2) + '\n');
  console.log(JSON.stringify(evidence, null, 2));
  assert.equal(afterListeners, beforeListeners, 'keydown监听器未按生命周期释放');
  assert.equal(firstModuleRequests, 1, '报表首次展开应按需加载一次');
  assert.equal(modules.length, 1, '再次展开不应重新下载同一报表模块');
  await context.close();
} finally { await browser?.close(); await server.close(); }
