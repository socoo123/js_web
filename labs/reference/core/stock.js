import { parseStock } from "./validation.js";
// region restock
export function initialStock(stock) {
  return stock ?? 12;
}

export function restockProduct(product, text) {
  const amount = parseStock(text);
  const stock = initialStock(product.stock);
  const nextStock = parseStock(String(stock + amount));
  return { ...product, stock: nextStock };
}
// endregion restock

// region update-stock
export function updateStock(products, id, stock) {
  if (!Number.isInteger(stock) || stock < 0 || stock > 99999) {
    throw new RangeError("库存必须是 0–99999 的整数");
  }
  if (!products.some((product) => product.id === id)) throw new RangeError(`商品不存在：${id}`);
  return products.map((product) => product.id === id ? { ...product, stock } : product);
}
// endregion update-stock
