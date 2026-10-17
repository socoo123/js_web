import { Inventory } from "../inventory/01-core/inventory.js";
import { products } from "../shared/products.js";
import { validateProducts } from "../inventory/02-web/validation.js";

const inventory = new Inventory(validateProducts(products));
console.log(inventory.count(), inventory.summary().totalStock);
console.log(inventory.summary().totalValueCents);
const next = new Inventory(validateProducts(inventory.select(() => true)));
next.setStock("P002", 3);
console.log(next.summary().totalStock, inventory.getById("P002").stock);
