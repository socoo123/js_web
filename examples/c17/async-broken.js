// expect-error: Error
// 有问题的写法：try 里只创建 Promise，没有等待它
import { readFile } from "node:fs/promises";

try {
  const pending = readFile(new URL("./missing.json", import.meta.url), "utf8");
  debugger;
  console.log("读取调用已返回");
} catch (error) {
  console.log("读取失败", error.code);
}
