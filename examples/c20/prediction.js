import { products } from "../shared/products.js";
import { countLowStock } from "../inventory/03-tooling/labs/low-stock.js";
import { Inventory } from "../inventory/01-core/inventory.js";

console.log(countLowStock(products));
console.log(new Inventory(products).summary().lowStockCount);
