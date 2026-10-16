import { products } from "../shared/products.js";

const totalStock = products.reduce((total, product) => total + product.stock, 0);
const totalValueCents = products.reduce(
  (total, product) => total + product.stock * product.priceCents, 0,
);
console.log(totalStock); // → 52
console.log(totalValueCents); // → 2634800
console.log((totalValueCents / 100).toFixed(2)); // → 26348.00
console.log([].reduce((total, product) => total + product.stock, 0)); // → 0
