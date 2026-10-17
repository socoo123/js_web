// expect-error: Error
// 有问题的写法：相对导入省略了扩展名
import money from "./format";
console.log(money(39900));
