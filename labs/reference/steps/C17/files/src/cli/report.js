// region report
import { readFile } from "node:fs/promises";
import { summarize } from "../core/inventory.js";
const file = new URL("../../data/products.json", import.meta.url);
const products = JSON.parse(await readFile(file, "utf8"));
const summary = summarize(products);
console.log(`商品数 ${summary.count}`);
console.log(`总库存 ${summary.stock}`);
console.log(`总价值 ${summary.valueCents} 分`);
// endregion report
