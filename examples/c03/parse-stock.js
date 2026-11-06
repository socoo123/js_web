// 直接调用 C03 参考解里的 parseStock，输出与正文的函数一致。
import { parseStock } from "../../labs/reference/steps/C03/files/src/core/inventory.js";

for (const text of ["3", " 3 ", "0", "", "3件", "-1", "3.5"]) {
  try {
    console.log(JSON.stringify(text), "→", parseStock(text));
  } catch (error) {
    console.log(JSON.stringify(text), "→", `${error.name}：${error.message}`);
  }
}
