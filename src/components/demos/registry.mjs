// 课程里可用的 React 演示。Effect.astro 为每个 id 写了显式的 client:visible 分支，两边必须一致。
export const DEMOS = {
  'c23-first-render': { lessonId: 'C23', label: 'useState 的初始值只用一次' },
  'c23-update-queue': { lessonId: 'C23', label: '更新队列与延迟补货' },
};

export function demoInfo(id) {
  const demo = DEMOS[id];
  if (!demo) throw new Error(`未登记的交互演示：${id}`);
  return demo;
}
