import { readFileSync, existsSync, realpathSync } from 'node:fs';
import path from 'node:path';
import pairsData from './comparisons.json' with { type: 'json' };
import snippetsData from './snippets.json' with { type: 'json' };

// Astro bundles this module; import.meta.url then points at a prerender chunk.
// All site authoring/build commands run from the repository root.
export const root = path.resolve(process.env.JS_WEB_SOURCE_ROOT ?? process.cwd()) + path.sep;
export function checkedPath(relative) {
  if (typeof relative !== 'string' || path.isAbsolute(relative) || relative.includes('\\') || relative.split('/').some((part) => !part || part === '..' || part === '.')) throw new Error(`代码来源路径越界：${relative}`);
  const absolute = path.resolve(root, relative);
  if (!absolute.startsWith(root) || !existsSync(absolute)) throw new Error(`代码来源不存在：${relative}`);
  if (!realpathSync(absolute).startsWith(realpathSync(root) + path.sep)) throw new Error(`代码来源路径越界：${relative}`);
  return absolute;
}
export function checkpointFile(checkpoint, file) {
  checkedPath('labs/catalog.json');
  if (!/^[CP]\d{2}$/.test(checkpoint)) throw new Error(`快照不存在：${checkpoint}`);
  // 参考快照的覆盖链；绝不从 labs/inventory 的可变学员源码提取片段。
  if (checkpoint.startsWith('P')) {
    const dir = `labs/reference/prototypes/${checkpoint}`;
    const change = JSON.parse(readFileSync(checkedPath(`${dir}/change.json`), 'utf8'));
    if (change.sharedFiles?.[file]) return checkedPath(change.sharedFiles[file]);
    if (change.files.includes(file)) return checkedPath(`${dir}/files/${file}`);
    return checkpointFile(change.previous, file);
  }
  for (let n = Number(checkpoint.slice(1)); n > 0; n--) {
    const step = `labs/reference/steps/C${String(n).padStart(2, '0')}`;
    const manifest = JSON.parse(readFileSync(checkedPath(`${step}/change.json`), 'utf8'));
    if (manifest.remove?.includes(file)) throw new Error(`${checkpoint} 已删除 ${file}`);
    if (manifest.sharedFiles?.[file]) return checkedPath(manifest.sharedFiles[file]);
    if (manifest.files.includes(file)) return checkedPath(`${step}/files/${file}`);
  }
  return checkedPath(`labs/reference/c00/${file}`);
}
export function extractRegion(source, region) {
  if (!region) return source.trimEnd();
  if (!/^[a-z0-9-]+$/.test(region)) throw new Error(`区域名无效：${region}`);
  const starts = [...source.matchAll(new RegExp(`^.*(?:region|#region) ${region}(?: -->)?[ \\t]*$`, 'gm'))];
  const ends = [...source.matchAll(new RegExp(`^.*(?:endregion|#endregion) ${region}(?: -->)?[ \\t]*$`, 'gm'))];
  // region 的匹配排除 endregion，避免用模糊子串产生第二个起点。
  const begin = starts.filter((match) => !/(?:endregion|#endregion)/.test(match[0]));
  if (begin.length !== 1 || ends.length !== 1 || begin[0].index >= ends[0].index) throw new Error(`区域缺失、重复或顺序错误：${region}`);
  return source.slice(begin[0].index + begin[0][0].length + 1, ends[0].index).trimEnd();
}
export function resolveSource(ref) {
  const filename = ref.checkpoint ? checkpointFile(ref.checkpoint, ref.file) : checkedPath(ref.source);
  if (!ref.checkpoint && !ref.source.startsWith('labs/reference/')) throw new Error('对照来源必须位于受控参考目录');
  const source = readFileSync(filename, 'utf8').replaceAll('\r\n', '\n');
  if (ref.jsonKey && (!/^[a-zA-Z]+$/.test(ref.jsonKey) || !Object.hasOwn(JSON.parse(source), ref.jsonKey))) throw new Error('JSON 来源缺少约定字段');
  const code = ref.jsonKey ? JSON.stringify({ [ref.jsonKey]: JSON.parse(source)[ref.jsonKey] }, null, 2) : extractRegion(source, ref.region);
  return { ...ref, code };
}
export const pairs = pairsData;
export const snippets = snippetsData;
export function comparison(pairId) {
  const pair = pairs[pairId]; if (!pair) throw new Error(`缺少代码对照：${pairId}`);
  return { ...pair, left: resolveSource(pair.left), right: resolveSource(pair.right) };
}
export function snippet(snippetId) {
  const ref = snippets[snippetId]; if (!ref) throw new Error(`缺少代码片段：${snippetId}`);
  return resolveSource(ref);
}
