import { initializeInventory, readInventorySnapshot } from "../inventory/04-react/src/inventory-storage.js";

const raw = "{";
const storage = { getItem: () => raw };
const result = initializeInventory(() => readInventorySnapshot(storage));
console.log(result.products.reduce((sum, product) => sum + product.stock, 0));
console.log(result.products.find((product) => product.id === "P002").stock);
console.log(storage.getItem(), result.message.includes("原记录保留"));
