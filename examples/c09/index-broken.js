// 有问题的写法：把 Map 条目写成了普通对象属性
import { products } from "../shared/products.js";

const byId = new Map();
for (const product of products) byId[product.id] = product;
console.log(byId.size, byId.get("P001")); // → 0 undefined
console.log(Object.hasOwn(byId, "P001")); // → true
