import { products } from "../shared/products.js";
import { productsReducer } from "../inventory/04-react/src/products-reducer.js";

const before = structuredClone(products);
const after = productsReducer(before, { type: "restocked", id: "P002" });
const total = (items) => items.reduce((sum, product) => sum + product.stock, 0);
console.log(before[1].stock, after[1].stock);
console.log(total(before), total(after));
console.log(before === after, before[1] === after[1]);
console.log(before[0] === after[0]);
