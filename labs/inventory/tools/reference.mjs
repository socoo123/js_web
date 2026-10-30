import { readFile, mkdir, readdir, writeFile, lstat, rm, mkdtemp } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { gunzipSync } from 'node:zlib';
import { createHash } from 'node:crypto';
import { get as httpsGet } from 'node:https';
import { workspace, catalog } from './lab.mjs';

const base = `https://socoo123.github.io/js_web/downloads/inventory/${catalog.release}/`;
async function get(name) {
  const local = path.resolve(workspace, '../../public/downloads/inventory', catalog.release, name);
  if (existsSync(local)) return readFile(local);
  // npm forwards an explicitly configured public CA bundle to its scripts.
  // Keep certificate/hostname verification enabled, including behind a local proxy.
  const ca = process.env.npm_config_cafile ? await readFile(process.env.npm_config_cafile) : undefined;
  return new Promise((resolve, reject) => {
    const request = httpsGet(new URL(name, base), { ...(ca ? { ca } : {}), timeout: 30000 }, (response) => {
      if (response.statusCode !== 200) { response.resume(); reject(new Error(`参考包尚未可用：HTTP ${response.statusCode} ${new URL(name, base)}`)); return; }
      const chunks = []; let size = 0;
      response.on('data', (chunk) => { size += chunk.length; if (size > 64 * 1024 * 1024) request.destroy(new Error('参考包超过 64 MB')); else chunks.push(chunk); });
      response.on('end', () => resolve(Buffer.concat(chunks))); response.on('error', reject);
    });
    request.on('timeout', () => request.destroy(new Error('参考包下载超时'))); request.on('error', reject);
  });
}
export function validateBundle(bundle, release = catalog.release) {
  if (!bundle || bundle.release !== release || !bundle.files || typeof bundle.files !== 'object' || Array.isArray(bundle.files) || !Object.keys(bundle.files).length) throw new Error('参考包发行版不匹配或文件清单无效');
  for (const [name, text] of Object.entries(bundle.files)) {
    if (typeof text !== 'string' || path.isAbsolute(name) || name.includes('\\') || name.includes('\0') || name.split('/').some((part) => !part || part === '..' || part === '.') || /(^|\/)(node_modules|dist|\.lab|\.git|\.cache|coverage|test-results|reference|\.env[^/]*)(\/|$)/.test(name)) throw new Error(`不安全的参考文件：${name}`);
    const parts = name.split('/');
    while (parts.pop() && parts.length) if (Object.hasOwn(bundle.files, parts.join('/'))) throw new Error(`参考文件与目录冲突：${name}`);
  }
  return bundle;
}
async function load(id) {
  if (!/^[CP]\d{2}$/.test(id)) throw new Error(`错误快照：${id}`);
  const manifest = JSON.parse((await get('manifest.json')).toString());
  const entry = manifest.checkpoints?.[id];
  if (manifest.release !== catalog.release || !entry) throw new Error(`本发行版未提供 ${id}；没有修改源码。`);
  const bytes = await get(`${id}.json.gz`);
  if (createHash('sha256').update(bytes).digest('hex') !== entry.sha256) throw new Error('参考包校验值不匹配');
  const data = validateBundle(JSON.parse(gunzipSync(bytes, { maxOutputLength: 64 * 1024 * 1024 }).toString()));
  const names = Object.keys(data.files).sort();
  if (!entry.files || JSON.stringify(names) !== JSON.stringify(Object.keys(entry.files).sort()) || names.some((name) => createHash('sha256').update(data.files[name]).digest('hex') !== entry.files[name])) throw new Error('参考包源码清单校验失败');
  return data;
}
export async function restore(id, target) {
  // 拒绝任何已存在的非空目录或符号链接；先校验整个包，再写文件。
  const info = await lstat(target).catch((error) => { if (error.code !== 'ENOENT') throw error; });
  if (info && (!info.isDirectory() || (await readdir(target)).length)) throw new Error('恢复目标非空或不是普通目录；没有修改文件。');
  const data = await load(id);
  const parent = path.dirname(target);
  await mkdir(parent, { recursive: true });
  const staging = await mkdtemp(path.join(parent, '.inventory-restore-'));
  try {
    for (const [name, text] of Object.entries(data.files)) {
      const file = path.join(staging, name); await mkdir(path.dirname(file), { recursive: true }); await writeFile(file, text);
    }
    // 不合并目录：rename 只允许不存在或空目录，竞态下新增文件也会使操作失败。
    const { rename } = await import('node:fs/promises'); await rename(staging, target);
  } finally { await rm(staging, { recursive: true, force: true }); }
  console.log(`${id} 已另存到 ${target}；这是参考快照。原工作区保持不变。`);
}
export async function compare(id) {
  const lesson = catalog.lessons.find((row) => row.lessonId === id);
  id = lesson?.trial?.end ?? id;
  const data = await load(id);
  let changed = 0;
  for (const [name, expected] of Object.entries(data.files)) {
    if (!/^(src|adapters|tests|notes)\//.test(name) && !/^(package(?:-lock)?\.json|vite\.config\.js)$/.test(name)) continue;
    const file = path.join(workspace, name);
    const actual = existsSync(file) ? await readFile(file, 'utf8') : '';
    if (actual === expected) continue;
    changed++; console.log(`\n--- 当前 ${name}\n+++ ${id} 参考 ${name}`);
    const left = actual.split('\n'); const right = expected.split('\n');
    for (let i = 0; i < Math.max(left.length, right.length); i++) if (left[i] !== right[i]) {
      if (left[i] !== undefined) console.log(`- ${i + 1}: ${left[i]}`);
      if (right[i] !== undefined) console.log(`+ ${i + 1}: ${right[i]}`);
    }
  }
  console.log(`\n${changed} 个文件有差异；只读对照，没有写入业务文件。`);
}
