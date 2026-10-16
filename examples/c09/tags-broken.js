// 有问题的写法：加入 Set 的是标签数组，而不是单个标签
import { products } from "../shared/products.js";

const tags = new Set(products.map(product => product.tags));
console.log(tags.size); // → 6
console.log(tags.has("热销")); // → false
