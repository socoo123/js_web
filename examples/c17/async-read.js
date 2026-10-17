import { readFile } from "node:fs/promises";

console.log("开始");
const pending = readFile(new URL("../shared/products.json", import.meta.url), "utf8");
console.log("同步代码继续");
const products = JSON.parse(await pending);
console.log("文件就绪", products.length);
