import { products } from "../shared/products.js";

const mouse = products[1];
console.log(mouse.stock && "有货"); // → 0
console.log(mouse.stock > 0 && "有货"); // → false
console.log(mouse.stock === 0 ? "已售罄" : "有货"); // → 已售罄
console.log(mouse.tags.length > 0 ? mouse.tags.join("、") : "无标签"); // → 无标签
