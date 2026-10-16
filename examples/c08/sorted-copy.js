import { products } from "../shared/products.js";

const stocks = products.map(product => product.stock);
const ascending = stocks.toSorted((a, b) => a - b);
console.log(ascending.join(", ")); // → 0, 3, 5, 7, 12, 25
console.log(stocks.join(", ")); // → 12, 0, 7, 3, 25, 5
const byStock = products.toSorted((a, b) => a.stock - b.stock);
console.log(byStock.map(product => product.id).join(", "));
// → P002, P004, P006, P003, P001, P005
