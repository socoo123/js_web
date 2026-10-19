import { products } from "../shared/products.js";
import { writeInventorySnapshot } from "../inventory/04-react/src/inventory-storage.js";

const original = JSON.stringify({ version: 1, products });
let saved = original;
const storage = { setItem(key, value) { saved = value; } };
const invalid = products.map((product) => product.id === "P002"
  ? { ...product, stock: "0" } : product);
try {
  writeInventorySnapshot(storage, invalid);
} catch (error) {
  console.log(error.message);
}
console.log("旧快照保留", saved === original);
