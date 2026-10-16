import { products } from "../shared/products.js";

const labels = products.map(product => {
  return `${product.id}：${product.name}`;
});
console.log(labels.length, labels[0]); // → 6 P001：机械键盘
console.log(labels.join(" | "));
// → P001：机械键盘 | P002：无线鼠标 | P003：27 英寸显示器 | P004：USB-C 扩展坞 | P005：显示器支架 | P006：降噪耳机
