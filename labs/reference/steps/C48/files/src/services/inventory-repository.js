// region repository-init
import initialProducts from "../../data/products.json" with { type: "json" };
import { restockProduct, selectProducts, summarize } from "../core/inventory.js";
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
// region repository-list-page
    // 与后端 GET /api/products 同形：summary 统计筛选后的全部结果，totals 统计全部商品。
    async listPage({ q = "", category = "", stock, page = 1, pageSize = 20 } = {}, options) {
      await before("listPage", options);
      const stockFilters = { low: (product) => product.stock >= 1 && product.stock <= 5, out: (product) => product.stock === 0 };
      const matched = selectProducts(current(), { query: q, category: category || "全部" }).filter(stockFilters[stock] ?? (() => true));
      const start = (page - 1) * pageSize;
      return structuredClone({ items: matched.slice(start, start + pageSize), page, pageSize,
        total: matched.length, summary: summarize(matched), totals: summarize(current()) });
    },
// endregion repository-list-page
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
