import { products } from "../shared/products.js";

const after = products.map((product) => product.id === "P002"
  ? { ...product, tags: [...product.tags, "待盘点"] }
  : product);
console.log(products[1].tags.length, after[1].tags.join()); // → 0 待盘点
console.log(products[1] === after[1]); // → false
