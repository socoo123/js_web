async function load() {
  console.log("开始读取");
  await Promise.resolve();
  console.log("读取完成");
}
console.log("同步开始");
const pending = load();
console.log("继续执行");
await pending;
console.log("收尾");
