// region repository-init
import initialProducts from "../../data/products.json" with { type: "json" };
import { restockProduct } from "../core/inventory.js";
import { readProducts, saveProducts, recoverProducts, encodeSnapshot, decodeSnapshot } from "./storage.js";
export const reactStorageKey = "js_web:inventory:react:v2";
export function createInventoryRepository({ storage, seed = initialProducts, delay = 80 } = {}) {
  let products;
  const failures = new Set();
  const store = () => storage === undefined ? globalThis.localStorage : storage;
  function current() {
    if (products === undefined) products = (store() && readProducts(store(), reactStorageKey)) ?? decodeSnapshot(encodeSnapshot(seed));
    return products;
  }
  function find(id) {
    const product = current().find((item) => item.id === id);
    if (!product) throw new Error(`HTTP 404：商品 ${id} 不存在`);
    return product;
  }
// endregion repository-init
// region repository-delay
  async function before(operation, options = {}) {
    const { signal } = options;
    await new Promise((resolve, reject) => {
      if (signal?.aborted) { reject(new DOMException("已取消", "AbortError")); return; }
      const abort = () => { clearTimeout(timer); reject(new DOMException("已取消", "AbortError")); };
      const timer = setTimeout(() => { signal?.removeEventListener("abort", abort); resolve(); }, options.delay ?? delay);
      signal?.addEventListener("abort", abort, { once: true });
    });
    if (options.fail || failures.delete(operation)) throw new Error(`模拟 ${operation} 失败`);
  }
  function commit(next) {
    const checked = decodeSnapshot(encodeSnapshot(next));
    if (store()) saveProducts(store(), checked, reactStorageKey);
    products = checked;
  }
// endregion repository-delay
// region repository-read-save
  return {
    failNext(operation) { failures.add(operation); },
    async list(options) { await before("list", options); return structuredClone(current()); },
    async get(id, options) { await before("get", options); return structuredClone(find(id)); },
    async save(product, options) {
      const value = structuredClone(product);
      await before("save", options); find(value.id);
      commit(current().map((item) => item.id === value.id ? value : item));
      return structuredClone(find(value.id));
    },
    async create(product, options) {
      const value = structuredClone(product);
      await before("create", options);
      commit([...current(), value]);
      return structuredClone(find(value.id));
    },
// endregion repository-read-save
// region repository-restock-remove
    async remove(id, options) {
      await before("remove", options); const removed = structuredClone(find(id));
      commit(current().filter((item) => item.id !== id)); return removed;
    },
    async restock(id, amount, options) {
      await before("restock", options);
      const value = restockProduct(find(id), String(amount));
      commit(current().map((item) => item.id === id ? value : item));
      return structuredClone(find(id));
    },
// endregion repository-restock-remove
// region repository-snapshots
    async saveSnapshot() { commit(current()); return structuredClone(current()); },
    async recover() {
      if (!store()) throw new Error("没有本地存储");
      products = recoverProducts(store(), reactStorageKey); return structuredClone(products);
    },
    async importText(text) { commit(decodeSnapshot(text)); return structuredClone(current()); },
    async exportText() { return encodeSnapshot(current()); },
  };
}
export const repository = createInventoryRepository();
// endregion repository-snapshots
