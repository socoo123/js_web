import { products } from "../shared/products.js";

function uniqueTags(items) {
  const tags = new Set();
  for (const product of items) {
    for (const tag of product.tags) tags.add(tag);
  }
  return [...tags];
}
console.log(uniqueTags(products).join(", ")); // → 热销, 新品
console.log(uniqueTags([]).length); // → 0
