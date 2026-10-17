import { readFile } from "node:fs/promises";

const source = new URL("../shared/products.json", import.meta.url);
const products = JSON.parse(await readFile(source, "utf8"));
console.log("商品", products.length);
