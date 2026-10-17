export function countLowStock(products) {
  return products.filter(product => product.stock > 0 && product.stock <= 5).length;
}
