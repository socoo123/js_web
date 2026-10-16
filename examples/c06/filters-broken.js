// 有问题的写法：提前调用筛选函数，再把布尔值当作筛选规则
function createStockFilter(minimum = 1) {
  return product => product.stock >= minimum;
}
function selectProducts(products, predicate) {
  const selected = [];
  for (const product of products) {
    if (predicate) selected.push(product);
  }
  return selected;
}
const products = [{ id: "P001", stock: 12 }, { id: "P002", stock: 0 }];
const hasStock = createStockFilter(1)(products[0]);
console.log(typeof hasStock); // → boolean
console.log(selectProducts(products, hasStock).length); // → 2
