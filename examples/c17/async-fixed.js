import { readFile } from "node:fs/promises";

try {
  await readFile(new URL("./missing.json", import.meta.url), "utf8");
} catch (error) {
  console.log("读取失败", error.code); // → 读取失败 ENOENT
}
