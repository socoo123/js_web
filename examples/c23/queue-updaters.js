import { products } from "../shared/products.js";
import { applyUpdates } from "./update-queue.js";

const stock = products[0].stock;
const addOne = (pending) => pending + 1;
console.log(applyUpdates(stock, [addOne, addOne, addOne])); // → 15
console.log(applyUpdates(stock, [stock + 3, addOne])); // → 16
console.log(applyUpdates(stock, [addOne, stock + 3])); // → 15
console.log(applyUpdates(stock, [addOne, 0])); // → 0
