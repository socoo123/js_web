// 有问题的写法：改坏旧快照，再返回同一个数组
export function restockReducer(products, action) {
  if (action.type === "restocked") {
    const product = products.find((item) => item.id === action.id);
    product.stock += 1;
    return products;
  }
  throw new Error(`未知 action：${action.type}`);
}
