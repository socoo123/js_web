import { products } from "../shared/products.js";

function stockLabel({ product, prefix = "库存" }) {
  return `${product.name} ${prefix}：${product.stock} 件`;
}

console.log(stockLabel({ product: products[0] })); // → 机械键盘 库存：12 件
console.log(stockLabel({ product: products[1], prefix: "剩余" })); // → 无线鼠标 剩余：0 件
console.log(stockLabel({ product: products[1], prefix: undefined })); // → 无线鼠标 库存：0 件
console.log(stockLabel({ product: products[1], prefix: null })); // → 无线鼠标 null：0 件
