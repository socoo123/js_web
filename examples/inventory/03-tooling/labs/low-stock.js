// 有问题的写法：把售罄商品也计入低库存
export function countLowStock(products) {
  return products.filter(product => product.stock <= 5).length;
}
