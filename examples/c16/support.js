import { products } from "../shared/products.js";

console.log(typeof Array.prototype.toSorted === "function");
console.log(typeof Map.groupBy === "function");
console.log(products.toSorted((a, b) => a.stock - b.stock)[0].id);
console.log(Map.groupBy(products, product => product.category).get("配件").length);
