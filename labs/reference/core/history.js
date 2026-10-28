import { createDraft } from "./validation.js";
import { restockProduct } from "./stock.js";
// region history-start
export function createHistory(initial) {
  const products = initial.map(createDraft);
  const history = [];
  return {
    getProducts: () => products.map(createDraft),
    restock(id, text) {
      const product = products.find((item) => item.id === id);
      if (!product) throw new RangeError(`商品不存在：${id}`);
      const next = restockProduct(product, text);
      history.push({ id, stock: product.stock });
      product.stock = next.stock;
    },
// endregion history-start
// region history-end
undo() {
      const before = history.pop();
      if (!before) return false;
      products.find((item) => item.id === before.id).stock = before.stock;
      return true;
    },
  };
}
// endregion history-end

// region queue
export function createTaskQueue() {
  const tasks = [];
  let head = 0;
  return {
    enqueue(task) {
      if (task === null || task === undefined) throw new TypeError("任务不能为空");
      tasks.push(task);
    },
    dequeue() {
      if (head === tasks.length) return null;
      const task = tasks[head];
      tasks[head++] = undefined;
      return task;
    },
  };
}
// endregion queue
