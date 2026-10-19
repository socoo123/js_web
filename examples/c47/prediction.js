import { products } from "../shared/products.js";
import { parseInventorySnapshot } from "../inventory/04-react/src/inventory-storage.js";

const raw = JSON.stringify({ version: 1, products: [{ ...products[1], stock: "0" }] });
console.log("JSON 中的库存类型", typeof JSON.parse(raw).products[0].stock);
try {
  parseInventorySnapshot(raw);
} catch (error) {
  console.log(error.message);
}
console.log("空库存种类", parseInventorySnapshot('{"version":1,"products":[]}').length);
