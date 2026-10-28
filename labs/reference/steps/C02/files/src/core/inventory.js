// C00 只提供一张可读的卡片；业务能力在课程中逐步加入。
export function describeProduct(product) {
  return `${product.id} ${product.name} · 库存 ${product.stock} 件`;
}

export function stockValue(product) {
  return product.stock * product.priceCents;
}

// 有问题的写法：C03 将在这个入口处理输入边界。
export function restockProduct(product, text) {
  return { ...product, stock: (product.stock || 12) + text };
}
