import { products } from "../shared/products.js";
import { productsReducer } from "../inventory/04-react/src/products-reducer.js";
import { Inventory } from "../inventory/01-core/inventory.js";

const before = structuredClone(products);
const after = productsReducer(before, { type: "restocked", id: "P002" });
console.log("旧库存", before[1].stock);
console.log("新库存", after[1].stock);
console.log("同一商品对象", before[1] === after[1]);
console.log("未改商品共享", before[0] === after[0]);
console.log("总库存", new Inventory(after).summary().totalStock);
console.log("原始总库存", new Inventory(before).summary().totalStock);
