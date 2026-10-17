import { products } from "../shared/products.js";
import { countLowStock } from "./low-stock-fixed.js";

console.log("固定样例", countLowStock(products));
console.log("空数组", countLowStock([]));
for (const stock of [0, 1, 5, 6]) {
  console.log(stock, countLowStock([{ ...products[3], stock }]));
}
