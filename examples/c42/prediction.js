import { products } from "../shared/products.js";

const root = { products };
console.log(root.Products); // → undefined
console.log(root.products[1].stock); // → 0
console.log(products.findIndex((product) => product.id === "P999")); // → -1
const query = products.filter((product) => product.stock >= 1 && product.stock <= 5)
  .toSorted((a, b) => b.stock - a.stock || a.id.localeCompare(b.id)).slice(0, 2);
console.log(query.map((product) => `${product.id}:${product.stock}`).join(","));
// → P006:5,P004:3
