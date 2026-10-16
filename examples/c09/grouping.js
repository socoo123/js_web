import { products } from "../shared/products.js";

const groups = new Map();
for (const product of products) {
  if (!groups.has(product.category)) groups.set(product.category, []);
  groups.get(product.category).push(product);
}
for (const [category, group] of groups) {
  const stock = group.reduce((total, product) => total + product.stock, 0);
  console.log(`${category}：${group.length} 种，${stock} 件`);
}
// → 外设：2 种，12 件
// → 显示器：1 种，7 件
// → 配件：2 种，28 件
// → 音频：1 种，5 件
