import { products } from "../shared/products.js";

const soldOut = products.find(product => product.stock === 0);
console.log(soldOut?.id); // → P002
console.log(products.find(product => product.id === "P999")); // → undefined
console.log(products.some(product => product.stock === 0)); // → true
console.log(products.every(product => product.stock > 0)); // → false
console.log([].some(() => true), [].every(() => false)); // → false true
