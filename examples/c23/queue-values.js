import { products } from "../shared/products.js";
import { applyUpdates } from "./update-queue.js";

const stock = products[0].stock;
const updates = [stock + 1, stock + 1, stock + 1];
console.log("排入的值", updates.join("、")); // → 排入的值 13、13、13
console.log("下一次库存", applyUpdates(stock, updates)); // → 下一次库存 13
console.log("本次快照", stock); // → 本次快照 12
