import { products } from "../shared/products.js";

const row = products[1];
const namedModels = { inventory: { products } };
console.log(row.name);
console.log(row.stock);
console.log(namedModels.inventory.products.length);
console.log(row.Stock);
