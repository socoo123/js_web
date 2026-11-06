// 接口骨架：路 4 负责替换为读取 src/assets/previews/manifest.json 的正式实现，保留下列类型与导出。

/** @typedef {{ width: number, theme: 'light' | 'dark', src: import('astro').ImageMetadata }} ShotImage */
/** @typedef {{ id: string, alt: string, caption?: string, images: ShotImage[] }} Shot */

/**
 * @param {string} _id 形如 c15/layout
 * @returns {Shot | undefined}
 */
export function getShot(_id) {
  return undefined;
}

/** @returns {Shot[]} */
export function listShots() {
  return [];
}
