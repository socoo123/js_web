import { products } from "../shared/products.js";

const after = products.map((product) => product.id === "P001"
  ? { ...product, stock: product.stock + 1 }
  : product);
console.log(products[0].stock, after[0].stock); // → 12 13
console.log(products === after); // → false
console.log(products[0] === after[0]); // → false
console.log(products[1] === after[1]); // → true
