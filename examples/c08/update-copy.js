import { products } from "../shared/products.js";

const updated = products.map(product => product.id === "P002"
  ? { ...product, stock: product.stock + 3 }
  : product);
console.log(updated[1].stock, products[1].stock); // → 3 0
console.log(updated[1] === products[1]); // → false
console.log(updated[0] === products[0]); // → true
