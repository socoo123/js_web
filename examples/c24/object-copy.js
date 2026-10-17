import { products } from "../shared/products.js";

const before = products[0];
const after = { ...before, stock: before.stock + 1 };
console.log(before.stock, after.stock); // → 12 13
console.log(before === after); // → false
console.log(before.tags === after.tags); // → true
