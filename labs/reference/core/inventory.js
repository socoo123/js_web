import { parseStock, validateProduct, validateProducts } from "./validation.js";
export * from "./validation.js";
export * from "./summary.js";
export function describeProduct(product) { return `${product.id} ${product.name} · 库存 ${product.stock} 件`; }
export function stockValue(product) { return product.stock * product.priceCents; }
export function initialStock(stock) { return stock ?? 12; }
export function restockProduct(product, text) {
  const stock = parseStock(String(initialStock(product.stock) + parseStock(text)));
  return { ...product, stock };
}
// region update-stock
export function updateStock(products, id, stock) {
  if (!Number.isInteger(stock) || stock < 0 || stock > 99999) {
    throw new RangeError("库存必须是 0–99999 的整数");
  }
  if (!products.some((product) => product.id === id)) throw new RangeError(`商品不存在：${id}`);
  return products.map((product) => product.id === id ? { ...product, stock } : product);
}
// endregion update-stock
