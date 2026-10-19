import { readFile } from "node:fs/promises";

const file = new URL("../shared/products.json", import.meta.url);
const products = JSON.parse(await readFile(file, "utf8"));
const totalStock = products.reduce((sum, product) => sum + product.stock, 0);
console.log("构建输入", products.length, "种商品"); // → 构建输入 6 种商品
console.log("总库存", totalStock); // → 总库存 52
console.log("Node 中的 document", typeof document); // → Node 中的 document undefined
console.log("JSON 是文本", typeof JSON.stringify(products)); // → JSON 是文本 string
