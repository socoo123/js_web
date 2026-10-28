// region load
import seed from "../../data/products.json" with { type: "json" };
import { importProducts } from "../core/inventory.js";
export function loadProducts({ fail = false, delay = 120 } = {}) {
  return Promise.resolve().then(() => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (fail) reject(new Error("模拟加载失败"));
        else resolve(importProducts(JSON.stringify(seed)));
      }, delay);
    });
  });
}
// endregion load
