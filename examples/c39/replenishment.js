import { products } from "../shared/products.js";

const soldOut = products.filter((product) => product.stock === 0);
console.log(`总库存 ${products.reduce((sum, product) => sum + product.stock, 0)} 件`);
for (const product of soldOut) {
  console.log(`待补货：${product.id} ${product.name}`);
}
