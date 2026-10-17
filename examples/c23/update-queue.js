// 只用于手算单个 state 的更新顺序；不模拟 React 的调度与提交。
export function applyUpdates(initial, updates) {
  return updates.reduce((pending, update) =>
    typeof update === "function" ? update(pending) : update, initial);
}
