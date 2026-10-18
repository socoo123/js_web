import { products } from "../../../shared/products.js";
import { fetchProduct } from "./product-api.js";

function wait(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) { reject(signal.reason); return; }
    const abort = () => { clearTimeout(timer); reject(signal.reason); };
    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", abort);
      resolve();
    }, ms);
    signal?.addEventListener("abort", abort, { once: true });
  });
}

export function createMockProductService({ loadProduct = fetchProduct, delayMs = () => 0,
  failRead = () => false, failWrite = () => false } = {}) {
  const overrides = new Map();
  return {
    async getProduct(id, { signal } = {}) {
      await wait(delayMs(), signal);
      if (failRead()) throw new Error("模拟读取失败");
      const initial = await loadProduct(id, { signal });
      return structuredClone(overrides.get(id) ?? initial);
    },
    async restock(id) {
      await wait(Math.max(300, delayMs()));
      if (failWrite()) throw new Error("模拟保存失败");
      const current = overrides.get(id) ?? products.find((product) => product.id === id);
      if (!current) throw new Error("商品不存在");
      if (current.stock >= 99999) throw new Error("库存已到上限");
      const saved = { ...current, stock: current.stock + 1 };
      overrides.set(id, structuredClone(saved));
      return structuredClone(saved);
    },
  };
}

export const mockProductService = createMockProductService();
