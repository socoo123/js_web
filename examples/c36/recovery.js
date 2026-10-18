import { products } from "../shared/products.js";
import { initializeInventory, parseInventorySnapshot } from "../inventory/04-react/src/inventory-storage.js";

const raw = JSON.stringify({ version: 1, products });
console.log(parseInventorySnapshot(raw)[1].stock);
const result = initializeInventory(() => parseInventorySnapshot("{"));
console.log(result.products.reduce((sum, product) => sum + product.stock, 0));
console.log(result.message);
