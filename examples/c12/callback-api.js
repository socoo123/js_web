import { products } from "../shared/products.js";

export function readProducts(callback, { fail = false } = {}) {
  setTimeout(() => {
    if (fail) {
      callback(new Error("库存加载失败"));
      return;
    }
    callback(null, products.map(product => ({ ...product, tags: [...product.tags] })));
  }, 20);
}

export function readStock(id, callback) {
  setTimeout(() => {
    const product = products.find(product => product.id === id);
    if (product === undefined) callback(new Error("商品不存在：" + id));
    else callback(null, product.stock);
  }, 20);
}
