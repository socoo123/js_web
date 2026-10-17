import { Buffer } from "node:buffer";

const name = "机械键盘";
const bytes = Buffer.from(name, "utf8");
console.log(name.length, bytes.length); // → 4 12
console.log(bytes.toString("utf8")); // → 机械键盘
