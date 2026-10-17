import { products } from "../shared/products.js";

const product = products[0];
console.log(product.name);
console.log(`库存：${product.stock} 件`);
console.log(`单价：¥${(product.priceCents / 100).toFixed(2)}`);
console.log(`库存价值：¥${(product.stock * product.priceCents / 100).toFixed(2)}`);
