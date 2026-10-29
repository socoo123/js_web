export function selectProduct(products, row) {
  return products.find((product) => product.id === row.id) ?? null;
}
