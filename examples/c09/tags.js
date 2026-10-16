import { products } from "../shared/products.js";

const tags = new Set();
for (const product of products) {
  for (const tag of product.tags) tags.add(tag);
}
tags.add("热销");
console.log(tags.size, tags.has("新品")); // → 2 true
console.log([...tags].join(", ")); // → 热销, 新品
console.log(tags.delete("新品")); // → true
console.log([...tags].join(", ")); // → 热销
tags.clear();
console.log(tags.size); // → 0
