import { products } from "../shared/products.js";

export function loadStock(id, { fail = false } = {}) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (fail) {
        reject(new Error("库存加载失败"));
        return;
      }
      const product = products.find(product => product.id === id);
      if (product === undefined) reject(new Error("商品不存在"));
      else resolve(product.stock);
    }, 20);
  });
}
