// C00 只提供一张可读的卡片；业务能力在课程中逐步加入。
export function describeProduct(product) {
  return `${product.id} ${product.name} · 库存 ${product.stock} 件`;
}

export function stockValue(product) {
  return product.stock * product.priceCents;
}
