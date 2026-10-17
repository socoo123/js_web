import { products } from "../shared/products.js";

function stockLabel({ product, prefix = "库存" }) {
  return `${product.name} ${prefix}：${product.stock} 件`;
}

console.log(stockLabel({ product: products[0] }));
console.log(stockLabel({ product: products[1], prefix: "剩余" }));
console.log(stockLabel({ product: products[1], prefix: undefined }));
console.log(stockLabel({ product: products[1], prefix: null }));
