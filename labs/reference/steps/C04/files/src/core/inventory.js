// C00 只提供一张可读的卡片；业务能力在课程中逐步加入。
export function describeProduct(product) {
  return `${product.id} ${product.name} · 库存 ${product.stock} 件`;
}

export function stockValue(product) {
  return product.stock * product.priceCents;
}

// region stock-input
export function parseStock(text) {
  if (typeof text !== "string" || text.trim() === "") {
    throw new RangeError("请输入库存，空白无效");
  }
  const stock = Number(text);
  if (!Number.isInteger(stock) || stock < 0 || stock > 99999) {
    throw new RangeError("库存必须是 0–99999 的整数");
  }
  return stock;
}
// endregion stock-input

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

// region total-stock
export function totalStock(products) {
  let total = 0;
  for (const product of products) {
    if (!Number.isInteger(product.stock)) throw new TypeError("库存必须是整数");
    total += product.stock;
  }
  return total;
}
// endregion total-stock
