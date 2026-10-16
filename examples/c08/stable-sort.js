import { products } from "../shared/products.js";

const availableFirst = products.toSorted(
  (a, b) => Number(a.stock === 0) - Number(b.stock === 0),
);
console.log(availableFirst.map(product => product.id).join(", "));
// → P001, P003, P004, P005, P006, P002
console.log(availableFirst === products); // → false
console.log(availableFirst[0] === products[0]); // → true
