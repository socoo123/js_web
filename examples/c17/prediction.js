import { readFile } from "node:fs/promises";

const pending = readFile(new URL("../shared/products.json", import.meta.url), "utf8");
console.log("A", typeof pending.then);
const text = await pending;
console.log("B", typeof text);
console.log("C", JSON.parse(text)[1].stock ?? 12);
