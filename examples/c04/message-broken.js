// expect-error: ReferenceError
// 有问题的写法：message 只属于 if 块，块外无法读取
const messageStock = 0;
if (messageStock === 0) {
  const message = "售罄";
}
console.log(message); // → 抛出 ReferenceError
