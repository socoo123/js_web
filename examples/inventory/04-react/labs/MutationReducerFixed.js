export function restockReducer(products, action) {
  if (action.type === "restocked") {
    return products.map((product) => product.id === action.id
      ? { ...product, stock: Math.min(product.stock + 1, 99999) }
      : product);
  }
  throw new Error(`未知 action：${action.type}`);
}
