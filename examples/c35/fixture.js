import { products } from "../shared/products.js";
import { productsReducer } from "../inventory/04-react/src/products-reducer.js";

const after = productsReducer(structuredClone(products), { type: "sampleAdded" });
const created = after.at(-1);
console.log(created.id, created.name, created.stock);
console.log(after.length, after.reduce((sum, product) => sum + product.stock, 0));
console.log(products.length);
