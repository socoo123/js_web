function createStockFilter(minimum = 1) {
  return product => product.stock >= minimum;
}
function selectProducts(products, predicate) {
  const selected = [];
  for (const product of products) {
    if (predicate(product)) selected.push(product);
  }
  return selected;
}
const products = [{ id: "P001", stock: 12 }, { id: "P002", stock: 0 }];
const hasStock = createStockFilter(1);
console.log(typeof hasStock); // → function
console.log(selectProducts(products, hasStock).length); // → 1
