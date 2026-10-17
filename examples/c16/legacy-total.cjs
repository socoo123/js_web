function totalStock(products) {
  return products.reduce((sum, product) => sum + product.stock, 0);
}
module.exports = { totalStock };
