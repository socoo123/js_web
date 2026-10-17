import { products } from "../shared/products.js";
import { applyUpdates } from "./update-queue.js";

const stock = products[0].stock;
console.log(applyUpdates(stock, [stock + 3, (n) => n + 1, (n) => n * 2]));
console.log(applyUpdates(stock, [(n) => n + 3, stock + 1]));
console.log(applyUpdates(stock, [(n) => n + 3, (n) => n + 3]));
console.log(stock);
