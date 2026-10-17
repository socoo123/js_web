import { products } from "../shared/products.js";
import { restockReducer } from "../inventory/04-react/labs/MutationReducerFixed.js";

const after = restockReducer(products, { type: "restocked", id: "P002" });
console.log(products === after);
console.log(products[1] === after[1]);
console.log(products[0] === after[0]);
console.log(products[1].stock, after[1].stock);
