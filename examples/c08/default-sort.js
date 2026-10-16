import { products } from "../shared/products.js";

const stocks = products.map(product => product.stock);
const result = stocks.sort();
console.log(result.join(", ")); // → 0, 12, 25, 3, 5, 7
console.log(result === stocks); // → true
