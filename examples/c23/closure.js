import { products } from "../shared/products.js";

function createReader(stock) {
  return () => stock;
}
const readBefore = createReader(products[0].stock);
const readAfter = createReader(products[0].stock + 3);
setTimeout(() => {
  console.log("旧回调", readBefore()); // → 旧回调 12
  console.log("新回调", readAfter()); // → 新回调 15
}, 0);
