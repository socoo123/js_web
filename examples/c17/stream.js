import { createReadStream } from "node:fs";

const source = new URL("../shared/products.json", import.meta.url);
let byteCount = 0;
for await (const chunk of createReadStream(source)) {
  byteCount += chunk.length;
}
console.log("读到了字节", byteCount > 0); // → true
