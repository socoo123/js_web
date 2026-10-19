// 有问题的写法：只复制数组，商品对象仍与旧状态共享
import { products } from "../shared/products.js";

const before = structuredClone(products);
const after = [...before];
after.find((product) => product.id === "P002").stock += 1;
console.log("旧库存", before[1].stock);
console.log("新库存", after[1].stock);
console.log("同一商品对象", before[1] === after[1]);
