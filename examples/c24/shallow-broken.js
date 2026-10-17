// 有问题的写法：只复制数组，商品对象仍与原数组共享。
import { products } from "../shared/products.js";

const before = structuredClone(products);
const after = [...before];
after[0].stock += 1;
console.log(before === after); // → false
console.log(before[0] === after[0]); // → true
console.log(before[0].stock, after[0].stock); // → 13 13
