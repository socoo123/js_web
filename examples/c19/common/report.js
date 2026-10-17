import { readFile } from "node:fs/promises";
import wrapAnsi from "wrap-ansi";

const products = JSON.parse(await readFile(
  new URL("./products.json", import.meta.url), "utf8",
));
console.log("商品", products.length);
console.log("总库存", products.reduce((sum, product) => sum + product.stock, 0));
console.log("总价值（分）", products.reduce(
  (sum, product) => sum + product.stock * product.priceCents, 0,
));
console.log(wrapAnsi(products.slice(0, 2).map((product) => product.name).join(" "), 8));
