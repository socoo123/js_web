// 有问题的写法：把随启动位置变化的路径当成模块相邻路径
import { readFile } from "node:fs/promises";
import path from "node:path";

const source = path.resolve("../shared/products.json");
debugger;
const products = JSON.parse(await readFile(source, "utf8"));
console.log("商品", products.length);
