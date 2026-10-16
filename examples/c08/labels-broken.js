// 有问题的写法：带大括号的箭头函数漏了 return
import { products } from "../shared/products.js";

const labels = products.map(product => {
  `${product.id}：${product.name}`;
});
console.log(labels.length, labels[0]); // → 6 undefined
console.log(labels.join(" | ")); // →  |  |  |  |  |
