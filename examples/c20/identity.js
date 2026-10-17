import { Inventory } from "../inventory/01-core/inventory.js";

const first = new Inventory([]).summary();
const second = new Inventory([]).summary();
console.log(first === second);
console.log(JSON.stringify(first) === JSON.stringify(second));
