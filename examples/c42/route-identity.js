import { products } from "../shared/products.js";

const visible = products.filter((product) => product.id === "P004");
console.log(visible[0].id); // → P004
console.log(products[0].id); // → P001
const index = products.findIndex((product) => product.id === visible[0].id);
console.log(`/products/${index}`); // → /products/3
console.log(`#/products/${visible[0].id}`); // → #/products/P004
