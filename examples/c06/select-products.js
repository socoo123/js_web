function selectProducts(products, predicate) {
  const selected = [];
  for (const product of products) {
    if (predicate(product)) selected.push(product);
  }
  return selected;
}
const products = [{ id: "P001", stock: 12 }, { id: "P002", stock: 0 }];
const hasStock = product => product.stock > 0;
const selected = selectProducts(products, hasStock);
console.log(selected.length, selected[0].id); // → 1 P001
console.log(products.length);                 // → 2
