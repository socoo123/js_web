import { products } from "../shared/products.js";

const lowStock = products.filter(product => product.stock > 0 && product.stock <= 5);
const labels = lowStock.map(product => `${product.id}：${product.stock} 件`);
console.log(labels.join("；")); // → P004：3 件；P006：5 件
console.log(products.length, lowStock.length); // → 6 2
console.log(lowStock[0] === products[3]); // → true
