// 效果截图入口：图片与清单由 scripts/capture-previews.mjs 生成，alt/caption 直接读 labs/previews 的定义。
// 只能在 Astro/Vite 中导入（依赖 import.meta.glob）；新鲜度由 scripts/check-previews.mjs 检查。
import manifest from '../assets/previews/manifest.json';

/** @typedef {{ width: number, theme: 'light' | 'dark', src: import('astro').ImageMetadata }} ShotImage */
/** @typedef {{ id: string, alt: string, caption?: string, images: ShotImage[] }} Shot */

const files = import.meta.glob('../assets/previews/**/*.webp', { eager: true, import: 'default' });
const groups = import.meta.glob('../../labs/previews/*.json', { eager: true, import: 'default' });
const THEME_ORDER = { light: 0, dark: 1 };

/** @type {Map<string, Shot>} */
const shots = new Map();
for (const group of Object.values(groups)) {
  for (const definition of group.shots) {
    const id = `${group.group}/${definition.name}`;
    const entry = manifest.shots[id];
    if (!entry) continue;
    const images = entry.images.map((image) => ({ width: image.width, theme: image.theme, src: files[`../assets/previews/${image.file}`] }));
    if (!images.length || images.some((image) => !image.src)) continue;
    images.sort((a, b) => a.width - b.width || THEME_ORDER[a.theme] - THEME_ORDER[b.theme]);
    shots.set(id, { id, alt: definition.alt, ...(definition.caption ? { caption: definition.caption } : {}), images });
  }
}

/**
 * @param {string} id 形如 c15/layout
 * @returns {Shot | undefined} 定义存在且已拍摄时返回；缺图时返回 undefined，由调用方输出占位。
 */
export function getShot(id) {
  return shots.get(id);
}

/** @returns {Shot[]} */
export function listShots() {
  return [...shots.values()].sort((a, b) => a.id.localeCompare(b.id, 'en'));
}
