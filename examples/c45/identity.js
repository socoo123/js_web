import { products } from "../shared/products.js";
import { restockProduct } from "../inventory/04-react/src/product-state.js";

const next = restockProduct(products, "P002");
console.log(Object.is(products, next));
console.log(Object.is(products[1], next[1]));
console.log(Object.is(products[0], next[0]));
console.log(products[1].stock, next[1].stock);
