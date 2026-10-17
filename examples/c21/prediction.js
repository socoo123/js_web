import { products } from "../shared/products.js";

const product = products[1];
console.log("product.name");
console.log(product.name);
console.log(product.stock ?? 12);
console.log((product.priceCents / 100).toFixed(2));
