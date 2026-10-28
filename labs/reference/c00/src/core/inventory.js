// C00 提供可读卡片；表单的输入规则将在课程中加入。
export function describeProduct(product) {
  return `${product.id} ${product.name} · 库存 ${product.stock} 件`;
}

// 有问题的写法：为 C02 提供待修的输入接口，C03 会加入校验。
export function restockProduct(product, text) {
  return { ...product, stock: (product.stock || 12) + text };
}
