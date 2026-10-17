import { products } from "../shared/products.js";

const product = { ...products[0] };
function stockLabel(product) {
  return `${product.name}：${product.stock} 件`;
}

console.log(stockLabel(product));
console.log(stockLabel(product));
console.log("输入库存", product.stock);
