import { products } from "../shared/products.js";
import { productsReducer } from "../inventory/04-react/src/products-reducer.js";
import { parseInventorySnapshot } from "../inventory/04-react/src/inventory-storage.js";

const edited = productsReducer(products, { type: "saved", id: "P002",
  changes: { ...products[1], stock: 3, priceCents: 29 } });
const restored = parseInventorySnapshot(JSON.stringify({ version: 1, products: edited }));
console.log("恢复鼠标", restored[1].stock, restored[1].priceCents);
console.log("总库存", restored.reduce((sum, product) => sum + product.stock, 0));
console.log("总价值分", restored.reduce((sum, product) => sum + product.stock * product.priceCents, 0));
console.log("起点鼠标", products[1].stock, products[1].priceCents);
