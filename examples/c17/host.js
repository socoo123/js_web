import { Inventory } from "../inventory/01-core/inventory.js";
import { products } from "../shared/products.js";

console.log("document", typeof document);
console.log("process", typeof process);
console.log("fetch", typeof fetch);
console.log("总库存", new Inventory(products).summary().totalStock);
