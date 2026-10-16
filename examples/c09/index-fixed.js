import { products } from "../shared/products.js";

const byId = new Map();
for (const product of products) byId.set(product.id, product);
console.log(byId.size, byId.get("P001").name); // → 6 机械键盘
console.log(Object.hasOwn(byId, "P001")); // → false
