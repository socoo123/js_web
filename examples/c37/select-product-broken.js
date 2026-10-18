// 有问题的写法：把显示位置当成原数组位置
export function selectProduct(products, row) {
  return products[row.index] ?? null;
}
