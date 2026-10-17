import path from "node:path";
import { fileURLToPath } from "node:url";

const source = new URL("../shared/products.json", import.meta.url);
const filename = fileURLToPath(source);
console.log(path.basename(filename)); // → products.json
console.log(path.isAbsolute(filename)); // → true
console.log(path.dirname(filename) === path.resolve("../shared")); // → true（在本目录运行）
console.log(path.basename(path.join("reports", "inventory.txt"))); // → inventory.txt
