import { products } from "../shared/products.js";

const before = structuredClone(products.slice(0, 2));
const after = [...before];
after[1].tags = [...after[1].tags, "待盘点"];
const visible = after.filter((product) => product.stock === 0);
console.log(before[1] === visible[0]);
console.log(before[1].tags.join());
console.log(before.length, visible.length);
