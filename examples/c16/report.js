console.log("report 初始化");
export function totalStock(products) {
  return products.reduce((sum, product) => sum + product.stock, 0);
}
