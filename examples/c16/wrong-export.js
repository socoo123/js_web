// expect-error: SyntaxError
// 有问题的写法：默认导出的本地函数名不是具名导出
import { formatMoney } from "./format.js";
console.log(formatMoney(39900));
